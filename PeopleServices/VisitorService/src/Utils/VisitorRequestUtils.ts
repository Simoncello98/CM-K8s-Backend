/*
    Created by Simone Scionti
*/

import { VisitorRequest } from "../../../../shared/Models/VisitorRequest";
import { DynamoDBKeySchemaInterface } from "../../../../shared/Utils/Interfaces/DynamoDBKeySchemaInterface";
import { Resources } from "../../../../shared/Utils/Resources";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { DynamoDB } from "aws-sdk";
import { User } from "../../../../shared/Models/User";
import { UserServiceUtils } from "../../UserService/src/Utils/UserServiceUtils";
import { VisitorRequestStatus } from "../../../../shared/Utils/Enums/VisitorRequestStatus";



export class VisitorRequestUtils {

    private static visitorAttributes = deserialize({}, VisitorRequest);

    public static getPrimaryKey(campusName: string, visitorEmail: string, idRequest: string): DynamoDBKeySchemaInterface {
        let keys: DynamoDBKeySchemaInterface = {
            PK: "#VISITOR#CAMPUS<" + campusName + ">",
            SK: "#VISITOR<" + visitorEmail + ">#ID<" + idRequest + ">"
        };

        return keys;
    }

    public static paramsToCreateVisitorRequest(newVisitorRequest: VisitorRequest): any {
        let keys = this.getPrimaryKey(newVisitorRequest.CampusName, newVisitorRequest.VisitorEmail, newVisitorRequest.VisitorRequestID);

        let params = {
            TableName: Resources.IP_TABLE,
            Item: Utils.getUniqueInstance().getNewItemToInsert(newVisitorRequest, keys),
            ConditionExpression: "attribute_not_exists(PK) and attribute_not_exists(SK)"
        };

        return params;
    }

    public static paramsToGetVisitorRequest(campusName: string, visitorEmail: string, idRequest: string): any {
        let keys = this.getPrimaryKey(campusName, visitorEmail, idRequest);

        let params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.visitorAttributes),
            Key: keys
        };

        return params;
    }

    public static paramsToQueryByVisitor(campusName: string, visitorEmail: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.visitorAttributes),
            KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)",
            ExpressionAttributeNames: {
                "#pk": "PK",
                "#sk": "SK"
            },
            ExpressionAttributeValues: {
                ":pk": "#VISITOR#CAMPUS<" + campusName + ">",
                ":sk": "#VISITOR<"+visitorEmail+">"
            }
            
        };

        return params;
    }

    public static paramsToUpdateVisitorRequest(visitorRequestToUpdate: VisitorRequest): any {
        let keys = this.getPrimaryKey(visitorRequestToUpdate.CampusName, visitorRequestToUpdate.VisitorEmail, visitorRequestToUpdate.VisitorRequestID);

        let params = {
            TableName: Resources.IP_TABLE,
            Key: keys,
            UpdateExpression: Utils.getUniqueInstance().getUpdateExpression(visitorRequestToUpdate),
            ExpressionAttributeValues: Utils.getUniqueInstance().getExpressionAttributeValues(visitorRequestToUpdate),
            ReturnValues: "UPDATED_NEW",
            ConditionExpression: "attribute_exists(PK) and attribute_exists(SK)"
        };

        return params;
    }

    public static paramsToDeleteVisitorRequest(visitorRequestToDelete: VisitorRequest): any {
        let keys = this.getPrimaryKey(visitorRequestToDelete.CampusName, visitorRequestToDelete.VisitorEmail, visitorRequestToDelete.VisitorRequestID);

        let params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.visitorAttributes),
            Key: keys,
            ReturnValues: "ALL_OLD"
        };

        return params;
    }

    public static paramsForQueryByCampusAndHostEmail(campusName: string, hostEmail: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.visitorAttributes),
            KeyConditionExpression: "#pk = :pk",
            ExpressionAttributeNames: {
                "#pk": "PK",
                "#host": "UserHostEmail"
            },
            ExpressionAttributeValues: {
                ":pk": "#VISITOR#CAMPUS<" + campusName + ">",
                ":host": hostEmail
            },
            FilterExpression: "#host = :host"
        };

        return params;
    }

    public static paramsForQueryByCampusHostEmailAndStatus(campusName: string, hostEmail: string, status: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            IndexName: "GSI2",
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.visitorAttributes),
            KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)",
            ExpressionAttributeNames: {
                "#pk": "GSI2PK",
                "#sk": "GSI2SK",
                "#host": "UserHostEmail"
            },
            ExpressionAttributeValues: {
                ":pk": "#VISITOR#CAMPUS<" + campusName + ">",
                ":sk": "#" + status,
                ":host": hostEmail
            },
            FilterExpression: "#host = :host"
        };

        return params;
    }

    public static paramsForQueryByCampus(campusName: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.visitorAttributes),
            KeyConditionExpression: "#pk = :pk",
            ExpressionAttributeNames: {
                "#pk": "PK"
            },
            ExpressionAttributeValues: {
                ":pk": "#VISITOR#CAMPUS<" + campusName + ">"
            }
        };

        return params;
    }

    public static paramsForQueryByCampusAndStatus(campusName: string, status: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            IndexName: "GSI2",
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.visitorAttributes),
            KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)",
            ExpressionAttributeNames: {
                "#pk": "GSI2PK",
                "#sk": "GSI2SK"
            },
            ExpressionAttributeValues: {
                ":pk": "#VISITOR#CAMPUS<" + campusName + ">",
                ":sk": "#" + status
            }
        };

        return params;
    }

    public static paramsForQueryForExpectedVisitorsByCampus(campusName: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.visitorAttributes),
            KeyConditionExpression: "#pk = :pk",
            ExpressionAttributeNames: {
                "#pk": "PK",
                "#status": "VisitorRequestStatus"
            },
            ExpressionAttributeValues: {
                ":pk": "#VISITOR#CAMPUS<" + campusName + ">"
            },
            FilterExpression: "#status = " + VisitorRequestStatus.ACCEPTED + "or #status = " + VisitorRequestStatus.PENDING 
        };

        return params;
    }

    public static paramsForQueryByCampusStatusStartDateAndLimitRecords(campusName: string, status: string, today: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            IndexName: "GSI2",
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.visitorAttributes),
            KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)",
            ExpressionAttributeNames: {
                "#pk": "GSI2PK",
                "#sk": "GSI2SK",
                //"#DateOfArrival": "EstimatedDateOfArrival",
                "#DateOfRelease": "EstimatedReleaseDate"
            },
            ExpressionAttributeValues: {
                ":pk": "#VISITOR#CAMPUS<" + campusName + ">",
                ":sk": "#" + status,
                //":startDate": startDate + "T23:59:59.999",
                ":endDate": today + "T00:00:00.000"
            },
            //FilterExpression: "#DateOfArrival <= :startDate and #DateOfRelease >= :endDate",
            FilterExpression: "#DateOfRelease >= :endDate"
        };

        return params;
    }

    public static paramsForQueryByCampusAllStatusStartDateAndLimitRecords(campusName: string, today: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.visitorAttributes),
            KeyConditionExpression: "#pk = :pk",
            ExpressionAttributeNames: {
                "#pk": "PK",
                //"#DateOfArrival": "EstimatedDateOfArrival",
                "#DateOfRelease": "EstimatedReleaseDate"
            },
            ExpressionAttributeValues: {
                ":pk": "#VISITOR#CAMPUS<" + campusName + ">",
                //":startDate": startDate + "T23:59:59.999",
                ":endDate": today
            },
            //FilterExpression: "#DateOfArrival <= :startDate and #DateOfRelease >= :endDate",
            FilterExpression: "#DateOfRelease >= :endDate"
        };

        return params;
    }

    //get the user with just the pk defined and returns a user with FName and LName taken from the db.
    public static async getUserInfoNames(fromEmail: string, dynamo: DynamoDB.DocumentClient): Promise<User> {
        let params = UserServiceUtils.paramsToGetUser(fromEmail);
        const data = await dynamo.get(params).promise();
        let existingUser = deserialize(data.Item, User);
        return existingUser;
    }

}