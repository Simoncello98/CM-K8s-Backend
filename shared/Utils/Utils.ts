/*
  Created by Simone Scionti 

  Utils class that define all the methods commonly used by each lambda function.
*/
import { Request } from 'express'
import { Response } from "./Interfaces/ResponseInterface";
import { DataErrorInterface } from "./Interfaces/DataErrorInterface";
import { Model } from "../Models/AbstractClasses/Model";
import { DynamoDBKeySchemaInterface } from "./Interfaces/DynamoDBKeySchemaInterface";
import { ModelNecessaryQueryInfoInterface } from "../Models/Interfaces/ModelNecessaryQueryInfoInterface";
import { ISRestResultCodes } from "./Enums/RestResultCodes";
import { Resources } from "./Resources";
import { CognitoIdentityServiceProvider, DynamoDB, S3 } from "aws-sdk";
import { EntityStatus } from "./Statics/EntityStatus";

export class Utils {
    private static obj: Utils = null;

    private constructor() { }

    public static getUniqueInstance() {
        if (!Utils.obj) Utils.obj = new Utils();
        return this.obj;
    }

    public getDataResponse(data: Object) {
        let response = this.getResponse(ISRestResultCodes.Ok, {});
        if ((typeof data) === "object") {
            response.statusCode = ISRestResultCodes.Ok;
            let dataResponse = data as DataErrorInterface;
            if (dataResponse.errorType != undefined) response.body = dataResponse.errorMessage;
            else response.body = JSON.stringify(data);
        }
        else response.statusCode = ISRestResultCodes.NotFound;
        return response;
    }

    /** Used to reply with an error message to the client */
    public getErrorResponse(errorBody: Error, params: Object, errorCode: ISRestResultCodes = ISRestResultCodes.Error) {
        let response = this.getResponse(errorCode, {});
        response.statusCode = errorCode;

        var trace: { stack?: any } = {};
        Error.captureStackTrace(trace);
        response.body = JSON.stringify({
            Error: errorBody.toString(),
            Params: params,
            Trace: trace.stack
        });
        return response;
    }

    public getValidationErrorResponse(requestBody, expectedBody) {
        const body = {
            Error: {
                Reason: "ValidationException",
                expectedRequestBody: expectedBody,
                receivedRequestBody: requestBody
            }
        }
        return this.getResponse(ISRestResultCodes.BadRequest, body);
    }

    public getNothingToDoErrorResponse(requestBody, expectedBody) {
        const body = {
            Error: {
                Reason: "Nothing to do",
                Description: "At least one of optional values has to be included in the update request body",
                expectedRequestBody: expectedBody,
                receivedRequestBody: requestBody
            }
        }
        return this.getResponse(ISRestResultCodes.BadRequest, body);
    }

    private getResponse(statusCode: number, body: any): Response {
        const response = {} as Response;
        response.headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
            //TODO you probably need to add : "Access-Control-Allow-Credentials" : true
        };
        response.statusCode = statusCode;
        response.body = JSON.stringify(body);
        return response;
    }

    //TODO: pass also a requestType parameters for security reasons. 
    //Example: if in an update(PUT) operation the client passes alla parameters trough queryStringParameters right now it converts all parameters in the body so it works(but it's not good).
    public validateRequestObject(event: Request): Object {
        if (!event) return {};
        let bodyString: string = "";
        if (!event.body) { //lambda direct calls and step functions payload has no body and no queryStringParameters.
            if (typeof event == "object") bodyString = JSON.stringify(event); //lambda direct call has object payload.
            else return {}; //nothing received.
        }
        else if (event.body != undefined) bodyString = event.body;
        //else if (event.queryStringParameters != undefined) bodyString = this.getObjectStringFromDictionary(event.queryStringParameters);
        let bodyRequest: Object;
        try {
            bodyRequest = JSON.parse(bodyString);
        }
        catch {
            return {};
        }
        return bodyRequest;
    }


    public getNewItemToInsert(newObj: Model, keys: DynamoDBKeySchemaInterface): Object {
        let item = newObj.toJson(true); //remove undefined properties
        Object.assign(item, keys);
        return item;
    }


    public getUpdateExpression(item: Model): string {
        return this.recursivelyGetUpdateExpression(item, "", "", "set ");
    }

    private recursivelyGetUpdateExpression(item: Model, parentPath: string, parentValuePath: string, expression: string): string {
        let sourceKeysArray = item.updateOptionalAtLeastOneAttributes;
        for (let index in sourceKeysArray) {
            let key = sourceKeysArray[index];
            let value = item[key];
            if (typeof (value) != "object" || Array.isArray(value)) { //this object attributes - base recursive case
                if (value != undefined && value != null) {
                    if (expression != "set ") expression += " , ";
                    if (parentPath != "") expression += parentPath + "." + key + " = :" + parentValuePath + key; //nested child attribute
                    else expression += key + " = :" + key; //top level object attribute
                }
            }
            else if(value !== null) { //nested child
                let currentParentPath = parentPath;
                let currentParentValuePath = parentValuePath;
                if (parentPath == "") parentPath += key; //first child , it doesn't need any dot
                else parentPath += "." + key; //build the path with dot notation to write to the correct attribute of the map object in the database.
                parentValuePath = parentValuePath + key;
                let nestedObjectExpression = this.recursivelyGetUpdateExpression(item[key], parentValuePath, parentPath, expression);
                parentPath = currentParentPath;
                parentValuePath = currentParentValuePath;
                expression = nestedObjectExpression;
            }
        }
        return expression;
    }


    public getExpressionAttributeValues(item: Model): Object {
        return this.recursivelyGetExpressionAttributeValues(item, "");
    }


    private recursivelyGetExpressionAttributeValues(item: Model, parentPath: string): Object {
        var obj = {};
        let sourceKeysArray = item.updateOptionalAtLeastOneAttributes;
        for (let index in sourceKeysArray) {
            let key = sourceKeysArray[index];
            let value = item[key];
            if (typeof (value) != "object" || Array.isArray(value)) { //this object attributes - base recursive case
                if (value != undefined && value != null) {
                    let expressionKey = ":" + parentPath + key;
                    obj[expressionKey] = value;
                }
            }
            else if(value != null){ //nested child
                let currentPath = parentPath;
                parentPath += key;
                let nestedObjectAttributeValues = this.recursivelyGetExpressionAttributeValues(item[key], parentPath);
                parentPath = currentPath;
                Object.assign(obj, nestedObjectAttributeValues); //append into the obj the attribute-values found in the nested obj.
            }
        }

        //console.log("Values:");
        //console.log(JSON.stringify(obj));
        return obj;
    }


    public getAllJsonAttributesProjectionExpression(item: Model): string {
        let expression = "";
        let keys = Object.keys(item.toJson(false));
        let i = 0;
        for (let key of keys) {
            if (!key.startsWith("GSI")) {
                if (i != keys.length - 1) {
                    expression += key + ",";
                    i++;
                } else {
                    expression += key;
                }
            } else {
                i++;
            }
        }
        if (expression.endsWith(",")) {
            expression = expression.substr(0, expression.length - 1)
        }
        return expression;
    }

    //TODO:  test the function updating a nested object. it should work.
    //we need to have the same dependent keys in base model and dependentModel.
    //it could be a model or a nestedObject so use the interface ModelNecessaryQueryInfoInterface
    //TODO: check value != null
    public recursivelySetUpdatedKeysForSameSchema(actualBaseItem: ModelNecessaryQueryInfoInterface, itemToUpdate: ModelNecessaryQueryInfoInterface) {
        let sourceKeysArray = actualBaseItem.updateOptionalAtLeastOneAttributes;
        for (let index in sourceKeysArray) {
            let key = sourceKeysArray[index];
            let value = actualBaseItem[key]; //value of the updatable key 
            //this if is inverted because if we found a defined attribute in the top level object, we can say that at least one is defined and don't check in nested childs. 
            if ((typeof (value) != "object" && value != undefined) || Array.isArray(value)) { //this object attributes - base recursive case
                //change prop in the objToUpdate
                itemToUpdate[key] = value;
            }
            else if (value != undefined) { //nested child object
                this.recursivelySetUpdatedKeysForSameSchema(actualBaseItem[key], itemToUpdate[key]);
            }
        }
    }

    //TODO: test the function deleting some in the nested object ( if its possible ). it works for top level object for sure
    //TODO: check value != null
    public recursivelySetUpdatedKeysForSchema(schema: any, actualBaseItem: ModelNecessaryQueryInfoInterface, itemToUpdate: ModelNecessaryQueryInfoInterface) {
        for (let baseItemKey in schema) {
            let itemToUpdateKey = schema[baseItemKey];
            let baseValue = actualBaseItem[baseItemKey];
            //this if is inverted because if we found a defined attribute in the top level object, we can say that at least one is defined and don't check in nested childs. 
            if ((typeof (baseValue) != "object" && baseValue != undefined) || Array.isArray(baseValue)) { //this object attributes - base recursive case
                //change prop in the objToUpdate
                itemToUpdate[itemToUpdateKey] = baseValue;
            }
            else if (baseValue != undefined) { //nested child object
                this.recursivelySetUpdatedKeysForSameSchema(actualBaseItem[baseValue], itemToUpdate[itemToUpdateKey]);
            }
        }
    }


    public getCurrentDateTime(): string {
        var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
        return localISOTime;
    }

    public isValidDate(stringDate: any): boolean {
        let parsedDate = Date.parse(stringDate);

        if (isNaN(stringDate) && !isNaN(parsedDate)) {
            return true;
        }

        return false;
    }


    public async getEmailFromSignature(cognitoAuthenticationProvider: string, cognito: CognitoIdentityServiceProvider): Promise<string> {
        const sub = cognitoAuthenticationProvider.split(':')[2];
        const cognitoParams = {
            UserPoolId: Resources.USERPOOL_ID,
            Username: sub
        };
        //Get Email
        try {
            let cognitoData = await cognito.adminGetUser(cognitoParams).promise();
            return cognitoData.UserAttributes.find((item) => item.Name == "email").Value;
        } catch (error) {
            return "" + error;
        }
    }

    public async getGroupFromSignature(cognitoAuthenticationProvider: string, cognito: CognitoIdentityServiceProvider): Promise<string> {
        const sub = cognitoAuthenticationProvider.split(':')[2];
        const cognitoParams = {
            UserPoolId: Resources.USERPOOL_ID,
            Username: sub
        };
        //Get Group
        try {
            let cognitoData = await cognito.adminListGroupsForUser(cognitoParams).promise();
            return cognitoData.Groups[0].GroupName;
        } catch (error) {
            return "" + error;
        }
    }

    public async getMyListOfCompanies(companyEmailAdmin: string, campusName: string, dynamo: DynamoDB.DocumentClient): Promise<DynamoDB.DocumentClient.ItemList> {
        const companiesAdminParams = {
            TableName: Resources.IP_TABLE,
            IndexName: "GSI2",
            FilterExpression: "#campusName = :campusName and #companyRole = :companyRole and #rs = :rs",
            ProjectionExpression: "CompanyName",
            KeyConditionExpression: "#pk = :pk",
            ExpressionAttributeNames: {
                "#pk": "GSI2PK",
                "#rs": "RelationshipStatus",
                "#companyRole": "CompanyRole",
                "#campusName": "CampusName"
            },
            ExpressionAttributeValues: {
                ":pk": "#CAMPUS#X#COMPANY#X#USER<" + companyEmailAdmin + ">",
                ":rs": EntityStatus.ACTIVE,
                ":companyRole": "Admin",
                ":campusName": campusName
            }
        };

        try {
            let companiesAdminData = await dynamo.query(companiesAdminParams).promise();
            return companiesAdminData.Items
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    public async getMyListOfCompaniesForEmployee(companyEmailAdmin: string, campusName: string, dynamo: DynamoDB.DocumentClient): Promise<DynamoDB.DocumentClient.ItemList> {
        const companiesAdminParams = {
            TableName: Resources.IP_TABLE,
            IndexName: "GSI2",
            FilterExpression: "#campusName = :campusName and #rs = :rs",
            ProjectionExpression: "CompanyName",
            KeyConditionExpression: "#pk = :pk",
            ExpressionAttributeNames: {
                "#pk": "GSI2PK",
                "#rs": "RelationshipStatus",
                "#campusName": "CampusName"
            },
            ExpressionAttributeValues: {
                ":pk": "#CAMPUS#X#COMPANY#X#USER<" + companyEmailAdmin + ">",
                ":rs": EntityStatus.ACTIVE,
                ":campusName": campusName
            }
        };

        try {
            let companiesAdminData = await dynamo.query(companiesAdminParams).promise();
            return companiesAdminData.Items
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    public async emptyBucket(prefix: string, s3: S3) {
        let bucketName = Resources.S3_BUCKET;

        let paramsToDelete = {
            Bucket: bucketName,
            Delete: {
                Objects: []
            }
        };

        let paramsToListObjects = {
            Bucket: bucketName,
            Prefix: prefix
        };

        const listObjects = await s3.listObjectsV2(paramsToListObjects).promise();

        if (listObjects.Contents.length === 0) {
            return;
        }

        listObjects.Contents.forEach(({ Key }) => {
            paramsToDelete.Delete.Objects.push({ Key });
        });

        await s3.deleteObjects(paramsToDelete).promise();

        if (listObjects.IsTruncated) {
            await this.emptyBucket(prefix, s3);
        }
    }

    public checkContentType(contentType: string): string {
        if (contentType === "png" || contentType === "jpg" || contentType === "jpeg") {
            return "";
        }

        return "Unsupported Media Type";
    }

    public generateTemporaryPassword(): string {
        return "CMPSW123";
    }
}