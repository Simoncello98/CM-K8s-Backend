/*
  Created by Simone Scionti 
    manager for consistent update of user service. 


*/

import { User } from "../../../../shared/Models/User";
import { Utils } from "../../../../shared/Utils/Utils";
import { DynamoDBKeySchemaInterface } from "../../../../shared/Utils/Interfaces/DynamoDBKeySchemaInterface";
import { CampusXCompanyXUser } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompanyXUser";
import { deserialize } from "typescript-json-serializer";
import { ConsistentUpdateManager } from "../../../../shared/SupportClasses/AbstractClasses/ConsistentUpdateManagerClass";
import { Resources } from "../../../../shared/Utils/Resources";


export class UserConsistentUpdateManager extends ConsistentUpdateManager {

    public static getUniqueInstance() {
        if (!UserConsistentUpdateManager.obj) UserConsistentUpdateManager.obj = new UserConsistentUpdateManager();
        return this.obj;
    }

    //get all the given user's relatioships, active and not.
    public async getRels(item: User): Promise<any> {
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
    public getUpdateObjects(rels: any[], item: User, updateSchema: any): any[] {
        let updateObjects: any[] = [];
        //put all rerlationships objects to update
        for (let rel of rels) {
            let relationship: CampusXCompanyXUser = deserialize(rel, CampusXCompanyXUser);
            //TODO use a function that put all the updatable new parameters in the instance.
            //relationship.FName = childUser.FName;
            //relationship.LName = childUser.LName;
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
            PK: "#USER<" + item.Email + ">",
            SK: "#USER_INFO<" + item.Email + ">"
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
