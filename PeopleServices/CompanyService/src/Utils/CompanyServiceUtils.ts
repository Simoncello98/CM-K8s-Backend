/*
    Created By Simone Scionti
*/

import { deserialize } from "typescript-json-serializer";
import { Company } from "../../../../shared/Models/Company";
import { DynamoDBKeySchemaInterface } from "../../../../shared/Utils/Interfaces/DynamoDBKeySchemaInterface";
import { Resources } from "../../../../shared/Utils/Resources";
import { Utils } from "../../../../shared/Utils/Utils";


export class CompanyServiceUtils {
    private static companyAttributes: Company = deserialize({}, Company);

    public static getPrimaryKey(companyName: string): DynamoDBKeySchemaInterface {
        let keys: DynamoDBKeySchemaInterface = {
            PK: "#COMPANY<" + companyName + ">",
            SK: "#COMPANY_INFO<" + companyName + ">"
        };

        return keys;
    }

    public static paramsToCreateCompany(newCompany: Company): any {
        let keys = this.getPrimaryKey(newCompany.CompanyName);

        let params = {
            TableName: Resources.IP_TABLE,
            Item: Utils.getUniqueInstance().getNewItemToInsert(newCompany, keys),
            ConditionExpression: "attribute_not_exists(PK) and attribute_not_exists(SK)"
        };

        return params;
    }

    public static paramsToOverwriteDeletedCompany(newCompany: Company): any {
        let keys = this.getPrimaryKey(newCompany.CompanyName);

        let params = {
            TableName: Resources.IP_TABLE,
            Item: Utils.getUniqueInstance().getNewItemToInsert(newCompany, keys)
        };

        return params;
    }

    public static paramsToDeleteCompany(companyToDelete: Company): any {
        let keys = this.getPrimaryKey(companyToDelete.CompanyName);

        let params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.companyAttributes),
            Key: keys,
            ReturnValues: "ALL_OLD"
        };

        return params;
    }

    public static paramsToGetCompany(companyName: string): any {
        let keys = this.getPrimaryKey(companyName);

        let params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.companyAttributes),
            Key: keys
        };

        return params;
    }

    public static paramsToUpdateCompany(companyToUpdate: Company): any {
        let keys = this.getPrimaryKey(companyToUpdate.CompanyName);

        let params = {
            TableName: Resources.IP_TABLE,
            Key: keys,
            UpdateExpression: Utils.getUniqueInstance().getUpdateExpression(companyToUpdate),
            ExpressionAttributeValues: Utils.getUniqueInstance().getExpressionAttributeValues(companyToUpdate),
            ReturnValues: "UPDATED_NEW",
            ConditionExpression: "attribute_exists(PK) and attribute_exists(SK)"
        };

        return params;
    }

    public static parmasToGetURL(key: string, expirationTime: number = 180): any {
        let params = {
            Bucket: Resources.S3_BUCKET,
            Key: key,
            Expires: expirationTime
        };

        return params;
    }

    public static parmasToPutS3BucketKey(key: string, contentType: string, body: any): any {
        let params = {
            Bucket: Resources.S3_BUCKET,
            Key: key,
            Body: body,
            ContentType: contentType
        };

        return params;
    }

}