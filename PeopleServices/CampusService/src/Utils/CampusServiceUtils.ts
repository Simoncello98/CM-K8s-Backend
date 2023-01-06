/*
    Created By Simone Scionti
*/

import { deserialize } from "typescript-json-serializer";
import { Campus } from "../../../../shared/Models/Campus";
import { CampusRegulations } from "../../../../shared/Models/CampusRegulations";
import { DynamoDBKeySchemaInterface } from "../../../../shared/Utils/Interfaces/DynamoDBKeySchemaInterface";
import { Resources } from "../../../../shared/Utils/Resources";
import { Utils } from "../../../../shared/Utils/Utils";


export class CampusServiceUtils {
    private static campusAttributes: Campus = deserialize({}, Campus);
    private static campusRegulationsAttributes: CampusRegulations = deserialize({}, CampusRegulations);

    public static getPrimaryKey(campusName: string): DynamoDBKeySchemaInterface {
        let keys: DynamoDBKeySchemaInterface = {
            PK: "#CAMPUS",
            SK: "#CAMPUS_INFO<" + campusName + ">"
        };

        return keys;
    }

    public static getCampusRegulationsPrimaryKey(campusName: string, regulationTitle: string): DynamoDBKeySchemaInterface {
        let keys: DynamoDBKeySchemaInterface = {
            PK: "#REGULATIONS#CAMPUS<" + campusName + ">",
            SK: "#TITLE<" + regulationTitle + ">"
        };

        return keys;
    }

    public static paramsToCreateCampus(campus: Campus): any {
        let keys = this.getPrimaryKey(campus.CampusName);

        let params = {
            TableName: Resources.IP_TABLE,
            Item: Utils.getUniqueInstance().getNewItemToInsert(campus, keys),
            ConditionExpression: "attribute_not_exists(PK) and attribute_not_exists(SK)"
        };

        return params;
    }

    public static paramsToOverwriteDeletedCampus(campus: Campus): any {
        let keys = this.getPrimaryKey(campus.CampusName);

        let params = {
            TableName: Resources.IP_TABLE,
            Item: Utils.getUniqueInstance().getNewItemToInsert(campus, keys)
        };

        return params;
    }

    public static paramsToDeleteCampus(campus: Campus): any {
        let keys = this.getPrimaryKey(campus.CampusName);

        let params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(campus),
            Key: keys,
            ReturnValues: "ALL_OLD"
        };

        return params;
    }

    public static paramsToGetCampus(campusName: string): any {
        let keys = this.getPrimaryKey(campusName);

        let params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.campusAttributes),
            Key: keys
        };

        return params;
    }

    public static paramsToUpdateCampus(campus: Campus): any {
        let keys = this.getPrimaryKey(campus.CampusName);

        let params = {
            TableName: Resources.IP_TABLE,
            Key: keys,
            UpdateExpression: Utils.getUniqueInstance().getUpdateExpression(campus),
            ExpressionAttributeValues: Utils.getUniqueInstance().getExpressionAttributeValues(campus),
            ReturnValues: "UPDATED_NEW",
            ConditionExpression: "attribute_exists(PK) and attribute_exists(SK)"
        };

        return params;
    }

    public static paramsForQueryForAllRecordsWithStatus(entityStatus: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            FilterExpression: "#rs = :rs",
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.campusAttributes),
            KeyConditionExpression: "#pk = :pk",
            ExpressionAttributeNames: {
              "#pk": "PK",
              "#rs": "CampusStatus"
            },
            ExpressionAttributeValues: {
              ":pk": "#CAMPUS",
              ":rs": entityStatus
            }
        };

        return params;
    }

    public static paramsForQueryForAllCampusRegulations(campusName: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.campusRegulationsAttributes),
            KeyConditionExpression: "#pk = :pk",
            ExpressionAttributeNames: {
              "#pk": "PK"
            },
            ExpressionAttributeValues: {
              ":pk": "#REGULATIONS#CAMPUS<" + campusName + ">"
            }
        };

        return params;
    }

    public static paramsToGetURL(key: string, expirationTime: number = 180): any {
        let params = {
            Bucket: Resources.S3_BUCKET,
            Key: key,
            Expires: expirationTime
        };

        return params;
    }

    public static paramsToPutS3BucketKey(key: string, contentType: string, body: any): any {
        let params = {
            Bucket: Resources.S3_BUCKET,
            Key: key,
            Body: body,
            ContentType: contentType
        };

        return params;
    }

}