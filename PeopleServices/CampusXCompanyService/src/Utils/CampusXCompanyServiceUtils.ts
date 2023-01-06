/*
    Created by Simone Scionti
*/

import { deserialize } from "typescript-json-serializer";
import { CampusXCompany } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompany";
import { DynamoDBKeySchemaInterface } from "../../../../shared/Utils/Interfaces/DynamoDBKeySchemaInterface";
import { Resources } from "../../../../shared/Utils/Resources";
import { Utils } from "../../../../shared/Utils/Utils";


export class CampusXCompanyServiceUtils {

    private static campusXCompanyAttributes: CampusXCompany = deserialize({}, CampusXCompany);

    public static getPrimaryKey(campusName: string, companyName: string): DynamoDBKeySchemaInterface {
        let keys: DynamoDBKeySchemaInterface = {
            PK: "#CAMPUS<" + campusName + ">",
            SK: "#COMPANY<" + companyName + ">"
        };

        return keys;
    }

    public static paramsToCreateCampusXCompany(newCampusXCompany: CampusXCompany): any {
        let keys = this.getPrimaryKey(newCampusXCompany.CampusName, newCampusXCompany.CompanyName);

        let params = {
            TableName: Resources.IP_TABLE,
            Item: Utils.getUniqueInstance().getNewItemToInsert(newCampusXCompany, keys),
            ConditionExpression: "attribute_not_exists(PK) and attribute_not_exists(SK)"
        };

        return params;
    }

    public static paramsToOverwriteDeletedCampusXCompany(newCampusXCompany: CampusXCompany): any {
        let keys = this.getPrimaryKey(newCampusXCompany.CampusName, newCampusXCompany.CompanyName);

        let params = {
            TableName: Resources.IP_TABLE,
            Item: Utils.getUniqueInstance().getNewItemToInsert(newCampusXCompany, keys)
        };

        return params;
    }

    public static paramsToDeleteCampusXCompany(campusXCompanyToDelete: CampusXCompany): any {
        let keys = this.getPrimaryKey(campusXCompanyToDelete.CampusName, campusXCompanyToDelete.CompanyName);

        const params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.campusXCompanyAttributes),
            Key: keys,
            ReturnValues: "ALL_OLD"
        };

        return params;
    }

    public static paramsToUpdateCampusXCompany(campusXCompanyToUpdate: CampusXCompany): any {
        let keys = this.getPrimaryKey(campusXCompanyToUpdate.CampusName, campusXCompanyToUpdate.CompanyName);

        const params = {
            TableName: Resources.IP_TABLE,
            Key: keys,
            UpdateExpression: Utils.getUniqueInstance().getUpdateExpression(campusXCompanyToUpdate),
            ExpressionAttributeValues: Utils.getUniqueInstance().getExpressionAttributeValues(campusXCompanyToUpdate),
            ReturnValues: "UPDATED_NEW",
            ConditionExpression: "attribute_exists(PK) and attribute_exists(SK)"
        };

        return params;
    }

    public static paramsToGetCampusXCompany(campusName: string, companyName: string): any {
        let keys = this.getPrimaryKey(campusName, companyName);

        const params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.campusXCompanyAttributes),
            Key: keys
        };

        return params;
    }

    public static paramsForQueryForCampusCompanies(campusName: string, entityStatus: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.campusXCompanyAttributes),
            FilterExpression: "#rs = :rs",
            KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)",
            ExpressionAttributeNames: {
                "#pk": "PK",
                "#sk": "SK",
                "#rs": "RelationshipStatus",
            },
            ExpressionAttributeValues: {
                ":pk": "#CAMPUS<" + campusName + ">",
                ":sk": "#COMPANY",
                ":rs": entityStatus
            }
        };

        return params;
    }

    public static paramsForQueryForCompanyParentCampuses(companyName: string, entityStatus: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            IndexName: "GSI1",
            FilterExpression: "#rs = :rs",
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.campusXCompanyAttributes),
            KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)",
            ExpressionAttributeNames: {
                "#pk": "GSI1PK",
                "#sk": "PK",
                "#rs": "RelationshipStatus",
            },
            ExpressionAttributeValues: {
                ":pk": "#COMPANY<" + companyName + ">",
                ":sk": "#CAMPUS",
                ":rs": entityStatus
            }
        };

        return params;
    }

    public static paramsForQueryForCompanyParentCampusesWithoutRelationshipStatus(companyName: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            IndexName: "GSI1",
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.campusXCompanyAttributes),
            KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)",
            ExpressionAttributeNames: {
                "#pk": "GSI1PK",
                "#sk": "PK"
            },
            ExpressionAttributeValues: {
                ":pk": "#COMPANY<" + companyName + ">",
                ":sk": "#CAMPUS"
            }
        };

        return params;
    }

    public static paramsToUpdateSingleTransactRecord(item: CampusXCompany): any {
        let keys = this.getPrimaryKey(item.CampusName, item.CompanyName);

        let params = {
            Update: {
                TableName: Resources.IP_TABLE,
                Key: keys,
                UpdateExpression: Utils.getUniqueInstance().getUpdateExpression(item),
                ExpressionAttributeValues: Utils.getUniqueInstance().getExpressionAttributeValues(item),
                ConditionExpression: "attribute_exists(PK) and attribute_exists(SK)"
            }
        };

        return params;
    }

    public static paramsToPutTransactWrite(itemsToTransact: any[]): any {
        let params = {
            ReturnConsumedCapacity: "TOTAL",
            ReturnItemCollectionMetrics: "SIZE",
            TransactItems: itemsToTransact
        };

        return params;
    }
}