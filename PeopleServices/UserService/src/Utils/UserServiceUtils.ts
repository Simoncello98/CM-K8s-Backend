/*
    Created by Simone Scionti
*/

import { CognitoIdentityServiceProvider } from "aws-sdk";
import { deserialize } from "typescript-json-serializer";
import { User } from "../../../../shared/Models/User";
import { CognitoGroupsName } from "../../../../shared/Utils/Enums/CognitoGroupsName";
import { DynamoDBKeySchemaInterface } from "../../../../shared/Utils/Interfaces/DynamoDBKeySchemaInterface";
import { Resources } from "../../../../shared/Utils/Resources";
import { Utils } from "../../../../shared/Utils/Utils";
import { ISValidator } from "../../../../shared/Utils/Validator";


export class UserServiceUtils {

    private static userAttributes: User = deserialize({}, User);

    public static getPrimaryKey(email: string): DynamoDBKeySchemaInterface {
        let keys: DynamoDBKeySchemaInterface = {
            PK: "#USER<" + email + ">",
            SK: "#USER_INFO<" + email + ">"
        };

        return keys;
    }

    public static paramsToCreateUser(user: User): any {
        let keys = this.getPrimaryKey(user.Email);

        let params = {
            TableName: Resources.IP_TABLE,
            Item: Utils.getUniqueInstance().getNewItemToInsert(user, keys),
            ConditionExpression: "attribute_not_exists(PK) and attribute_not_exists(SK)"
        };

        return params;
    }

    public static paramsToOverwriteDeletedUser(user: User): any {
        let keys = this.getPrimaryKey(user.Email);

        let params = {
            TableName: Resources.IP_TABLE,
            Item: Utils.getUniqueInstance().getNewItemToInsert(user, keys)
        };

        return params;
    }

    public static paramsToDeleteUser(user: User): any {
        let keys = this.getPrimaryKey(user.Email);

        let params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.userAttributes),
            Key: keys,
            ReturnValues: "ALL_OLD"
        };

        return params;
    }

    public static paramsToUpdateUser(user: User): any {
        let keys = this.getPrimaryKey(user.Email);

        let params = {
            TableName: Resources.IP_TABLE,
            Key: keys,
            UpdateExpression: Utils.getUniqueInstance().getUpdateExpression(user),
            ExpressionAttributeValues: Utils.getUniqueInstance().getExpressionAttributeValues(user),
            ReturnValues: "UPDATED_NEW",
            ConditionExpression: "attribute_exists(PK) and attribute_exists(SK)"
        };

        return params;
    }

    public static paramsToUpdateUserPhoto(user: User): any {
        let keys = this.getPrimaryKey(user.Email);

        let params = {
            TableName: Resources.IP_TABLE,
            Key: keys,
            UpdateExpression: Utils.getUniqueInstance().getUpdateExpression(user),
            ExpressionAttributeValues: Utils.getUniqueInstance().getExpressionAttributeValues(user),
            ReturnValues: "UPDATED_OLD",
            ConditionExpression: "attribute_exists(PK) and attribute_exists(SK)"
        };

        return params;
    }

    public static paramsToGetUser(email: string): any {
        let keys = this.getPrimaryKey(email);

        let params = {
            TableName: Resources.IP_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.userAttributes),
            Key: keys
        };

        return params;
    }

    public static getCognitoParams(email: string, temporaryPassword: string): CognitoIdentityServiceProvider.Types.AdminCreateUserRequest {
        let cognitoParams: CognitoIdentityServiceProvider.Types.AdminCreateUserRequest = {
            UserPoolId: Resources.USERPOOL_ID,
            Username: email,
            TemporaryPassword: temporaryPassword,
            UserAttributes: [
                {
                    Name: "email_verified", // Necessary for Forgot Pwd
                    Value: "True"
                },
                {
                    Name: "email",
                    Value: email
                }
            ]
        };

        return cognitoParams;
    }

    public static getCognitoParamsWithoutSendingTheEmail(email: string, temporaryPassword: string): CognitoIdentityServiceProvider.Types.AdminCreateUserRequest {
        let cognitoParams: CognitoIdentityServiceProvider.Types.AdminCreateUserRequest = {
            UserPoolId: Resources.USERPOOL_ID,
            Username: email,
            TemporaryPassword: temporaryPassword,
            UserAttributes: [
                {
                    Name: "email_verified", // Necessary for Forgot Pwd
                    Value: "True"
                },
                {
                    Name: "email",
                    Value: email
                }
            ],
            MessageAction: "SUPPRESS"
        };

        return cognitoParams;
    }

    public static paramsForDeleteCognitoUserParams(email: string): any {
        let params = {
            UserPoolId: Resources.USERPOOL_ID,
            Username: email
        };

        return params;
    }

    public static paramsForAssociateUserToGroupParams(email: string, groupName: CognitoGroupsName): any {
        let params = {
            UserPoolId: Resources.USERPOOL_ID,
            GroupName: groupName,
            Username: email
        };

        return params;
    }

    public static validateImportantAttributes(email: string, socialNumber: string): { message } {
        //Validate email
        let resultValidateEmail = ISValidator.getUniqueInstance().isValidEmail(email);
        if (resultValidateEmail) {
            return { message: resultValidateEmail };
        }

        //Validate SocialNumber
        if (socialNumber) {
            if (socialNumber.length != 16) {
                return { message: "Thi social number is invalid! Insert a Social number with 16 character" }
            }
            if(!ISValidator.getUniqueInstance().isValidSocialNumber(socialNumber)) {
                return { message: "Thi social number is invalid!" };
            }
        }

        return null
    }

    public static paramsToDeleteSingleTransactUser(newUser: User): any {
        let keys = this.getPrimaryKey(newUser.Email);

        let params = {
            Delete: {
                TableName: Resources.IP_TABLE,
                ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.userAttributes),
                Key: keys,
                ReturnValues: "ALL_OLD"
            }
        };

        return params;
    }

    public static paramsToUpdateSingleTransactUser(newUser: User): any {
        let keys = this.getPrimaryKey(newUser.Email);

        let params = {
            Update: {
                TableName: Resources.IP_TABLE,
                Key: keys,
                UpdateExpression: Utils.getUniqueInstance().getUpdateExpression(newUser),
                ExpressionAttributeValues: Utils.getUniqueInstance().getExpressionAttributeValues(newUser),
                ReturnValues: "ALL_OLD"
            }
        };

        return params;
    }

    public static paramsToPutSingleTransactUser(newUser: User): any {
        let keys = this.getPrimaryKey(newUser.Email);

        let params = {
            Put: {
                TableName: Resources.IP_TABLE,
                Item: Utils.getUniqueInstance().getNewItemToInsert(newUser, keys)
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