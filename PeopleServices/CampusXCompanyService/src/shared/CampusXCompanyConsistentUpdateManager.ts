/*
  Created by Simone Scionti 
    manager for consistent update of campusXCompany service.


*/

import { Utils } from "../../../../shared/Utils/Utils";
import { DynamoDBKeySchemaInterface } from "../../../../shared/Utils/Interfaces/DynamoDBKeySchemaInterface";
import { CampusXCompanyXUser } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompanyXUser";
import { deserialize } from "typescript-json-serializer";
import { ConsistentUpdateManager } from "../../../../shared/SupportClasses/AbstractClasses/ConsistentUpdateManagerClass";
import { CampusXCompany } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompany";
import { Resources } from "../../../../shared/Utils/Resources";


export class CampusXCompanyConsistentUpdateManager extends ConsistentUpdateManager {

    public static getUniqueInstance() {
        if (!CampusXCompanyConsistentUpdateManager.obj) CampusXCompanyConsistentUpdateManager.obj = new CampusXCompanyConsistentUpdateManager();
        return this.obj;
    }
    //get all the given user's relatioships, active and not.
    public async getRels(item: CampusXCompany): Promise<any> {
        const params = {
            TableName: Resources.IP_TABLE,
            IndexName: "GSI1",
            ProjectionExpression: "Email,CampusName,CompanyName",
            KeyConditionExpression: "#pk = :pk and #sk = :sk ",
            ExpressionAttributeNames: {
                "#pk": "GSI1PK",
                "#sk": "PK"
            },
            ExpressionAttributeValues: {
                ":pk": "#USER#X#COMPANY<" + item.CompanyName + ">",
                ":sk": "#USER#X#CAMPUS<" + item.CampusName + ">"
            }
        };;
        const data = await this.dynamo.query(params).promise();
        return data.Items;
    }

    //build the transactUpdate object array.
    public getUpdateObjects(rels: any[], item: CampusXCompany, updateSchema: any): any[] {
        let updateObjects: any[] = [];
        //put all rerlationships objects to update
        for (let rel of rels) {
            let relationship: CampusXCompanyXUser = deserialize(rel, CampusXCompanyXUser);
            if (updateSchema == false) Utils.getUniqueInstance().recursivelySetUpdatedKeysForSameSchema(item, relationship);
            else Utils.getUniqueInstance().recursivelySetUpdatedKeysForSchema(updateSchema, item, relationship);
            const relkeys: DynamoDBKeySchemaInterface = {
                PK: "#USER#X#CAMPUS<" + relationship.CampusName + ">",
                SK: "#USER<" + relationship.Email + ">#COMPANY<" + relationship.CompanyName + ">"
            }
            const objParams = {
                Update: {
                    TableName: Resources.IP_TABLE,
                    Key: relkeys,
                    UpdateExpression: Utils.getUniqueInstance().getUpdateExpression(relationship),
                    ExpressionAttributeValues: Utils.getUniqueInstance().getExpressionAttributeValues(relationship)
                }
            };
            if (Object.keys(objParams.Update.ExpressionAttributeValues).length != 0) updateObjects.push(objParams);
        }
        //put the user info record to update
        const userkeys: DynamoDBKeySchemaInterface = {
            PK: "#CAMPUS<" + item.CampusName + ">",
            SK: "#COMPANY<" + item.CompanyName + ">"
        }
        const userParams = {
            Update: {
                TableName: Resources.IP_TABLE,
                Key: userkeys,
                UpdateExpression: Utils.getUniqueInstance().getUpdateExpression(item),
                ExpressionAttributeValues: Utils.getUniqueInstance().getExpressionAttributeValues(item)
            }
        };
        updateObjects.push(userParams);
        return updateObjects;
    }
}
