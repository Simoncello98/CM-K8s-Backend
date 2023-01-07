/*
    Created By Simone Scionti
*/

import { deserialize } from "typescript-json-serializer";
import { AuthorizedFunctionalities } from "../../../../shared/Models/RelationshipsRecordModels/Permissions/AuthorizedFunctionalities";
import { RootNavigationItem } from "../../../../shared/Models/RelationshipsRecordModels/Permissions/RootNavigationItem";
import { DynamoDBKeySchemaInterface } from "../../../../shared/Utils/Interfaces/DynamoDBKeySchemaInterface";
import { Resources } from "../../../../shared/Utils/Resources";
import { Utils } from "../../../../shared/Utils/Utils";


export class AuthorizationServiceUtils {

    private static functionalityAttributes: AuthorizedFunctionalities = deserialize({}, AuthorizedFunctionalities);
    private static navigationAttributes: RootNavigationItem = deserialize({}, RootNavigationItem);

    public static getPrimaryKeyFunctionality(groupName: string, apiMethod: string, apiPath: string): DynamoDBKeySchemaInterface {
        let keys: DynamoDBKeySchemaInterface = {
            PK: "#FUNCTIONALITY#GROUP<" + groupName + ">",
            SK: "#METHOD<" + apiMethod + ">#PATH<" + apiPath + ">"
        };

        return keys;
    }

    public static getPrimaryKeyNavigation(groupName: string, navigationTemplate: string): DynamoDBKeySchemaInterface {
        let keys: DynamoDBKeySchemaInterface = {
            PK: "#NAVIGATION#GROUP<" + groupName + ">",
            SK: "#TEMPLATE<" + navigationTemplate + ">"
        };

        return keys;
    }

    public static paramsToCreateFunctionality(newFunctionality: AuthorizedFunctionalities): any {
        let keys = this.getPrimaryKeyFunctionality(newFunctionality.GroupName, newFunctionality.APIMethod, newFunctionality.APIPath);

        let params = {
            TableName: Resources.IA_TABLE,
            Item: Utils.getUniqueInstance().getNewItemToInsert(newFunctionality, keys)
        };

        return params;
    }

    public static paramsToCreateNavigation(newNavigation: RootNavigationItem): any {
        let keys = this.getPrimaryKeyNavigation(newNavigation.GroupName, newNavigation.NavigationTemplate);

        let params = {
            TableName: Resources.IA_TABLE,
            Item: Utils.getUniqueInstance().getNewItemToInsert(newNavigation, keys)
        };

        return params;
    }

    public static paramsToGetNavigation(groupName: string, navigationTemplate: string): any {
        let keys = this.getPrimaryKeyNavigation(groupName, navigationTemplate);

        let params = {
            TableName: Resources.IA_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.navigationAttributes),
            Key: keys
        };

        return params;
    }

    public static getCognitoParamsByUserAndGroup(email: string, groupName: string): any {
        let params = {
            UserPoolId: Resources.USERPOOL_ID,
            GroupName: groupName,
            Username: email
        };

        return params;
    }

    public static getCognitoParamsByUser(email: string): any {
        let params = {
            UserPoolId: Resources.USERPOOL_ID,
            Username: email
        };

        return params;
    }

    public static getCognitoParamsByCognitoClientID(): any {
        let params = {
            UserPoolId: Resources.USERPOOL_ID
        };

        return params;
    }

    public static paramsToPutSingleTransactFunctionality(newFunctionality: AuthorizedFunctionalities): any {
        let keys = this.getPrimaryKeyFunctionality(newFunctionality.GroupName, newFunctionality.APIMethod, newFunctionality.APIPath);

        let params = {
            Put: {
                TableName: Resources.IA_TABLE,
                Item: Utils.getUniqueInstance().getNewItemToInsert(newFunctionality, keys)
            }
        };

        return params;
    }

    public static paramsToPutSingleTransactNavigation(newNavigation: RootNavigationItem): any {
        let keys = this.getPrimaryKeyNavigation(newNavigation.GroupName, newNavigation.NavigationTemplate);

        let params = {
            Put: {
                TableName: Resources.IA_TABLE,
                Item: Utils.getUniqueInstance().getNewItemToInsert(newNavigation, keys)
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

    public static paramsForQueryByGroupName(groupName: string): any {
        let params = {
            TableName: Resources.IA_TABLE,
            ProjectionExpression: Utils.getUniqueInstance().getAllJsonAttributesProjectionExpression(this.functionalityAttributes),
            KeyConditionExpression: "#pk = :pk",
            ExpressionAttributeNames: {
                "#pk": "PK"
            },
            ExpressionAttributeValues: {
                ":pk": "#FUNCTIONALITY#GROUP<" + groupName + ">"
            }
        };

        return params;
    }

}