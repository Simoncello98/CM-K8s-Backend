/*
  Created by Simone Scionti 
    manager for consistent update of company service. 


*/

import { ConsistentUpdateManager } from "../../../../shared/SupportClasses/AbstractClasses/ConsistentUpdateManagerClass";
import { Company } from "../../../../shared/Models/Company";
import { Utils } from "../../../../shared/Utils/Utils";
import { DynamoDBKeySchemaInterface } from "../../../../shared/Utils/Interfaces/DynamoDBKeySchemaInterface";
import { CampusXCompanyXUser } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompanyXUser";
import { deserialize } from "typescript-json-serializer";
import { CampusXCompany } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompany";
import { Model } from "../../../../shared/Models/AbstractClasses/Model";
import { Resources } from "../../../../shared/Utils/Resources";
import { CampusXCompanyXUserServiceUtils } from "../../../CampusXCompanyXUserService/src/Utils/CampusXCompanyXUserServiceUtils";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { CampusXCompanyServiceUtils } from "../../../CampusXCompanyService/src/Utils/CampusXCompanyServiceUtils";

/*

TODO:
I can do better because i can query only for CampusXCompanyXUser records and : 
-If i have no results so i need to query for CampusXCompany Records 
- I f i have results i can use the couple (CampusName-CompanyName) to refer to CampusXCompany records. 

The problem is if i don't have any user inside a company, i will not refer the CampusXCompany record and i'll leave the db inconsistent.
*/
export class CompanyConsistentUpdateManager extends ConsistentUpdateManager {
    public static getUniqueInstance() {
        if (!CompanyConsistentUpdateManager.obj) CompanyConsistentUpdateManager.obj = new CompanyConsistentUpdateManager();
        return this.obj;
    }

    public async getRels(item: Company): Promise<any> {
        //CAMPUSXCOMPANY records
        const CampusXCompanyParams = CampusXCompanyServiceUtils.paramsForQueryForCompanyParentCampusesWithoutRelationshipStatus(item.CompanyName);
        //USERXCOMPANY records
        const CampusXCompanyXUserParams = CampusXCompanyXUserServiceUtils.paramsForQueryByCompany(item.CompanyName, EntityStatus.ACTIVE);
        
        //transactions don't support query operation, but to find all relationships record I need to query.. so i need to do two queries.
        const campusXCompanyRels = await this.dynamo.query(CampusXCompanyParams).promise();
        const campusXCompanyXUserRels = await this.dynamo.query(CampusXCompanyXUserParams).promise();
        let campXcompItems: Array<any> = campusXCompanyRels.Items;
        let campXcompXuserItems: Array<any> = campusXCompanyXUserRels.Items;

        //concat in one array 
        let allRels = campXcompXuserItems.concat(campXcompItems);
        return allRels;
    }

    public getUpdateObjects(rels: any[], item: Company, updateSchema: any): any[] {
        let updateObjects: any[] = [];
        //put all rerlationships objects to update
        for (let rel of rels) {
            let relkeys: DynamoDBKeySchemaInterface;
            //try to deserialize in the most specific model.
            let currentRelationship: Model;
            let relationship: CampusXCompanyXUser = deserialize(rel, CampusXCompanyXUser);
            if (relationship.isPKDefined()) {//check if i have all pk defined. If not, it was a CampusXCompany record, so we don't have Email.
                //uses a function that put all the updatable new parameters in the instance.
                currentRelationship = relationship;
                console.log(relationship);
                if (updateSchema == false) Utils.getUniqueInstance().recursivelySetUpdatedKeysForSameSchema(item, relationship);
                else Utils.getUniqueInstance().recursivelySetUpdatedKeysForSchema(updateSchema, item, relationship);
                relkeys = CampusXCompanyXUserServiceUtils.getPrimaryKey(relationship.CampusName, relationship.CompanyName, relationship.Email)
            }
            else {
                let relationship: CampusXCompany = deserialize(rel, CampusXCompany);
                currentRelationship = relationship;
                console.log(relationship);
                if (updateSchema == false) Utils.getUniqueInstance().recursivelySetUpdatedKeysForSameSchema(item, relationship);
                else Utils.getUniqueInstance().recursivelySetUpdatedKeysForSchema(updateSchema, item, relationship);
                relkeys = CampusXCompanyServiceUtils.getPrimaryKey(relationship.CampusName, relationship.CompanyName);
            }

            const objParams = {
                Update: {
                    TableName: Resources.IP_TABLE,
                    Key: relkeys,
                    UpdateExpression: Utils.getUniqueInstance().getUpdateExpression(currentRelationship),
                    ExpressionAttributeValues: Utils.getUniqueInstance().getExpressionAttributeValues(currentRelationship)
                }
            };
            if (Object.keys(objParams.Update.ExpressionAttributeValues).length != 0) updateObjects.push(objParams);
        }

        //put the company info record to update
        const companyKeys: DynamoDBKeySchemaInterface = {
            'PK': "#COMPANY<" + item.CompanyName + ">",
            'SK': "#COMPANY_INFO<" + item.CompanyName + ">"
        }
        const userParams = {
            Update: {
                TableName: Resources.IP_TABLE,
                Key: companyKeys,
                UpdateExpression: Utils.getUniqueInstance().getUpdateExpression(item),
                ExpressionAttributeValues: Utils.getUniqueInstance().getExpressionAttributeValues(item)
            }
        };
        updateObjects.push(userParams);
        return updateObjects;
    }
}