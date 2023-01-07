/*
Created by Simone Scionti
*/

import { deserialize } from "typescript-json-serializer";
import { CampusXCompanyXUser } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompanyXUser";
import { DynamoDBKeySchemaInterface } from "../../../../shared/Utils/Interfaces/DynamoDBKeySchemaInterface";
import { Resources } from "../../../../shared/Utils/Resources";
import { Utils } from "../../../../shared/Utils/Utils";


export class CampusXCompanyXUserServiceUtils {

    private static campusXCompanyXUserAttributes: CampusXCompanyXUser = deserialize({}, CampusXCompanyXUser);

    public static getPrimaryKey(campusName: string, companyName: string, email: string): DynamoDBKeySchemaInterface {
        let keys: DynamoDBKeySchemaInterface = {
            PK: "#USER#X#CAMPUS<" + campusName + ">",
            SK: "#USER<" + email + ">#COMPANY<" + companyName + ">"
        };

        return keys;
    }

    public static paramsToCreateCampusXCompanyXUser(campusXCompanyXUser: CampusXCompanyXUser): any {
        let keys = this.getPrimaryKey(campusXCompanyXUser.CampusName, campusXCompanyXUser.CompanyName, campusXCompanyXUser.Email);

        let params = {
            TableName: Resources.IP_TABLE,
            Item: Utils.getUniqueInstance().getNewItemToInsert(campusXCompanyXUser, keys),
            ConditionExpression: "attribute_not_exists(PK) and attribute_not_exists(SK)"
        };

        return params;
    }

    public static paramsToOverwriteDeletedCampusXCompanyXUser(campusXCompanyXUser: CampusXCompanyXUser): any {
        let keys = this.getPrimaryKey(campusXCompanyXUser.CampusName, campusXCompanyXUser.CompanyName, campusXCompanyXUser.Email);

        let params = {
            TableName: Resources.IP_TABLE,
            Item: Utils.getUniqueInstance().getNewItemToInsert(campusXCompanyXUser, keys)
        };

        return params;
    }

    public static paramsToUpdateCampusXCompanyXUser(campusXCompanyXUser: CampusXCompanyXUser): any {
        let keys = this.getPrimaryKey(campusXCompanyXUser.CampusName, campusXCompanyXUser.CompanyName, campusXCompanyXUser.Email);

        let params = {
            TableName: Resources.IP_TABLE,
            Key: keys,
            UpdateExpression: Utils.getUniqueInstance().getUpdateExpression(campusXCompanyXUser),
            ExpressionAttributeValues: Utils.getUniqueInstance().getExpressionAttributeValues(campusXCompanyXUser),
            ReturnValues: "UPDATED_NEW",
            ConditionExpression: "attribute_exists(PK) and attribute_exists(SK)"
        };

        return params;
    }

    public static paramsToDeleteCampusXCompanyXUser(campusXCompanyXUser: CampusXCompanyXUser): any {
        let keys = this.getPrimaryKey(campusXCompanyXUser.CampusName, campusXCompanyXUser.CompanyName, campusXCompanyXUser.Email);

        let params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(campusXCompanyXUser),
            Key: keys,
            ReturnValues: "ALL_OLD"
        };

        return params;
    }

    public static paramsToGetCampusXCompanyXUser(campusName: string, companyName: string, email: string): any {
        let keys = this.getPrimaryKey(campusName, companyName, email);

        let params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.campusXCompanyXUserAttributes),
            Key: keys
        };

        return params;
    }

    public static paramsToGetEmailFromCampusXCompanyXUser(campusName: string, companyName: string, email: string): any {
        let keys = this.getPrimaryKey(campusName, companyName, email);

        let params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: "Email",
            Key: keys
        };

        return params;
    }

    public static paramsForQueryByCampus(campusName: string, entityStatus: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            FilterExpression: "#rs = :rs",
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.campusXCompanyXUserAttributes),
            KeyConditionExpression: "#pk = :pk",
            ExpressionAttributeNames: {
                "#pk": "PK",
                "#rs": "RelationshipStatus",
            },
            ExpressionAttributeValues: {
                ":pk": "#USER#X#CAMPUS<" + campusName + ">",
                ":rs": entityStatus
            }
        };

        return params;
    }
    
    public static paramsForQueryByCampusUsers(campusName: string, entityStatus: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            FilterExpression: "#visitor = :visitor and #rs = :rs",
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.campusXCompanyXUserAttributes),
            KeyConditionExpression: "#pk = :pk",
            ExpressionAttributeNames: {
                "#pk": "PK",
                "#rs": "RelationshipStatus",
                "#visitor": "IsVisitor"
            },
            ExpressionAttributeValues: {
                ":pk": "#USER#X#CAMPUS<" + campusName + ">",
                ":rs": entityStatus,
                ":visitor": false
            }
        };

        return params;
    }
    
    public static paramsForQueryByCampusUsersByCompany(campusName: string, companyName: string, entityStatus: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            FilterExpression: "#company = :company and #visitor = :visitor and #rs = :rs",
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.campusXCompanyXUserAttributes),
            KeyConditionExpression: "#pk = :pk",
            ExpressionAttributeNames: {
                "#pk": "PK",
                "#rs": "RelationshipStatus",
                "#visitor": "IsVisitor",
                "#company": "CompanyName"
            },
            ExpressionAttributeValues: {
                ":pk": "#USER#X#CAMPUS<" + campusName + ">",
                ":rs": entityStatus,
                ":visitor": false,
                ":company": companyName
            }
        };

        return params;
    }

    public static paramsForQueryByCampusVisitors(campusName: string, entityStatus: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            FilterExpression: "#visitor = :visitor and #rs = :rs",
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.campusXCompanyXUserAttributes),
            KeyConditionExpression: "#pk = :pk",
            ExpressionAttributeNames: {
                "#pk": "PK",
                "#rs": "RelationshipStatus",
                "#visitor": "IsVisitor"
            },
            ExpressionAttributeValues: {
                ":pk": "#USER#X#CAMPUS<" + campusName + ">",
                ":rs": entityStatus,
                ":visitor": true
            }
        };

        return params;
    }

    public static paramsForQueryByCampusAndEmail(campusName: string, email: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.campusXCompanyXUserAttributes),
            KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk) ",
            ExpressionAttributeNames: {
                "#pk": "PK",
                "#sk": "SK"
            },
            ExpressionAttributeValues: {
                ":pk": "#USER#X#CAMPUS<" + campusName + ">",
                ":sk": "#USER<" + email + ">"
            }
        };

        return params;
    }

    public static paramsForQueryByCampusAndEmailWithStatus(campusName: string, email: string, entityStatus: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            FilterExpression: "#rs = :rs",
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.campusXCompanyXUserAttributes),
            KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk) ",
            ExpressionAttributeNames: {
                "#pk": "PK",
                "#sk": "SK",
                "#rs": "RelationshipStatus",
            },
            ExpressionAttributeValues: {
                ":pk": "#USER#X#CAMPUS<" + campusName + ">",
                ":sk": "#USER<" + email + ">",
                ":rs": entityStatus
            }
        };

        return params;
    }

    public static paramsForQueryByCampusAndCompany(campusName: string, companyName: string, entityStatus: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            IndexName: "GSI1",
            FilterExpression: "#rs = :rs",
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.campusXCompanyXUserAttributes),
            KeyConditionExpression: "#pk = :pk and #sk = :sk ",
            ExpressionAttributeNames: {
                "#pk": "GSI1PK",
                "#sk": "PK",
                "#rs": "RelationshipStatus",
            },
            ExpressionAttributeValues: {
                ":pk": "#USER#X#COMPANY<" + companyName + ">",
                ":sk": "#USER#X#CAMPUS<" + campusName + ">",
                ":rs": entityStatus
            }
        };

        return params;
    }

    public static paramsForQueryByCompany(companyName: string, entityStatus: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            IndexName: "GSI1",
            FilterExpression: "#rs = :rs",
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.campusXCompanyXUserAttributes),
            KeyConditionExpression: "#pk = :pk",
            ExpressionAttributeNames: {
                "#pk": "GSI1PK",
                "#rs": "RelationshipStatus",
            },
            ExpressionAttributeValues: {
                ":pk": "#USER#X#COMPANY<" + companyName + ">",
                ":rs": entityStatus
            }
        };

        return params;
    }

    public static paramsForQueryByEmail(email: string, entityStatus: string): any {
        let params = {
            TableName: Resources.IP_TABLE,
            IndexName: "GSI2",
            FilterExpression: "#rs = :rs",
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.campusXCompanyXUserAttributes),
            KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk) ",
            ExpressionAttributeNames: {
                "#pk": "GSI2PK",
                "#sk": "GSI2SK",
                "#rs": "RelationshipStatus"
            },
            ExpressionAttributeValues: {
                ":pk": "#CAMPUS#X#COMPANY#X#USER<" + email + ">",
                ":sk": "#CAMPUS",
                ":rs": entityStatus
            }
        };

        return params;
    }

    public static paramsToDeleteSingleTransactRelationship(campusXCompanyXUser: CampusXCompanyXUser): any {
        let keys = this.getPrimaryKey(
                                    campusXCompanyXUser.CampusName,
                                    campusXCompanyXUser.CompanyName,
                                    campusXCompanyXUser.Email );
        let params = {
            Delete: {
                TableName: Resources.IP_TABLE,
                ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.campusXCompanyXUserAttributes),
                Key: keys,
                ReturnValues: "ALL_OLD"
            }
        };

        return params;
    }

    public static paramsToUpdateSingleTransactRelationship(campusXCompanyXUser: CampusXCompanyXUser): any {
        let keys = this.getPrimaryKey(
                                    campusXCompanyXUser.CampusName,
                                    campusXCompanyXUser.CompanyName,
                                    campusXCompanyXUser.Email );
        let params = {
            Update: {
                TableName: Resources.IP_TABLE,
                Key: keys,
                UpdateExpression: Utils.getUniqueInstance().getUpdateExpression(campusXCompanyXUser),
                ExpressionAttributeValues: Utils.getUniqueInstance().getExpressionAttributeValues(campusXCompanyXUser),
                ReturnValues: "ALL_OLD"
            }
        };

        return params;
    }

    public static paramsToPutSingleTransactRelationship(campusXCompanyXUser: CampusXCompanyXUser): any {
        let keys = this.getPrimaryKey(
            campusXCompanyXUser.CampusName,
            campusXCompanyXUser.CompanyName,
            campusXCompanyXUser.Email );

        let params = {
            Put: {
                TableName: Resources.IP_TABLE,
                Item: Utils.getUniqueInstance().getNewItemToInsert(campusXCompanyXUser, keys)
            }
        };

        return params;
    }

}