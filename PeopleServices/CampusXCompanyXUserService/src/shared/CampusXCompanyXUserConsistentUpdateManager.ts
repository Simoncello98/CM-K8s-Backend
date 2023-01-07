
/*
  Created by Simone Scionti 
    manager for consistent update of campusXCompanyXUser service.


*/
import { Utils } from "../../../../shared/Utils/Utils";
import { DynamoDBKeySchemaInterface } from "../../../../shared/Utils/Interfaces/DynamoDBKeySchemaInterface";
import { CampusXCompanyXUser } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompanyXUser";
import { deserialize } from "typescript-json-serializer";
import { ConsistentUpdateManager } from "../../../../shared/SupportClasses/AbstractClasses/ConsistentUpdateManagerClass";
import { Resources } from "../../../../shared/Utils/Resources";


export class CampusXCompanyXUserConsistentUpdateManager extends ConsistentUpdateManager {

    public static getUniqueInstance() {
        if (!CampusXCompanyXUserConsistentUpdateManager.obj) CampusXCompanyXUserConsistentUpdateManager.obj = new CampusXCompanyXUserConsistentUpdateManager();
        return this.obj;
    }

    //get all the given user's relatioships, active and not.
    public async getRels(item: CampusXCompanyXUser): Promise<any> {
        const params = {
            TableName: Resources.IP_TABLE,
            IndexName: "GSI2",
            ProjectionExpression: "Email,CampusName,CompanyName",
            KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk) ",
            ExpressionAttributeNames: {
                "#pk": "GSI2PK",
                "#sk": "GSI2SK"
            },
            ExpressionAttributeValues: {
                ":pk": "#CAMPUS#X#COMPANY#X#USER<" + item.Email + ">",
                ":sk": "#CAMPUS",
            }
        };
        const data = await this.dynamo.query(params).promise();
        return data.Items;
    }

    //build the transactUpdate object array.
    public getUpdateObjects(rels: any[], item: CampusXCompanyXUser, updateSchema: any): any[] {
        let updateObjects: any[] = [];
        //put all rerlationships objects to update
        for (let rel of rels) {
            let relationship: CampusXCompanyXUser = deserialize(rel, CampusXCompanyXUser);
            //use a function that put all the updatable new parameters in the instance.
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

            /*I do this check because i don't want to put inside the array also the record that is the one from wich the update started. Because maybe the client 
            requested an update of more attributes, so i need to use the "item" object passed in the function that has all the attributes filled as the client wanted
             from the payload. */
            if (relationship.CompanyName != item.CompanyName) {
                if (Object.keys(objParams.Update.ExpressionAttributeValues).length != 0) updateObjects.push(objParams);
            }
        }
        //put the item object now
        const keys: DynamoDBKeySchemaInterface = {
            PK: "#USER#X#CAMPUS<" + item.CampusName + ">",
            SK: "#USER<" + item.Email + ">#COMPANY<" + item.CompanyName + ">"
        }
        const userParams = {
            Update: {
                TableName: Resources.IP_TABLE,
                Key: keys,
                UpdateExpression: Utils.getUniqueInstance().getUpdateExpression(item),
                ExpressionAttributeValues: Utils.getUniqueInstance().getExpressionAttributeValues(item)
            }
        };
        updateObjects.push(userParams);

        console.log(updateObjects);
        return updateObjects;
    }
}
