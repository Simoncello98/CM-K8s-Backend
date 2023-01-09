/*
  Created by Simone Scionti
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { DynamoDBKeySchemaInterface } from "../../../../shared/Utils/Interfaces/DynamoDBKeySchemaInterface";
import { Resources } from "../../../../shared/Utils/Resources";
import { DynamoDB } from "aws-sdk";
import { AuthorizedFunctionalities } from "../../../../shared/Models/RelationshipsRecordModels/Permissions/AuthorizedFunctionalities";
import { v4 as uuidv4 } from "uuid";

var dynamo = new DynamoDB.DocumentClient();

export async function createPermModule(event: Request, res: Response) : Promise<void> {
    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize json in User model and take the instance. 
    var newPermission: AuthorizedFunctionalities = deserialize(requestBody, AuthorizedFunctionalities);

    if (!newPermission.enoughInfoForCreate()) {
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, newPermission.getCreateExpectedBody()));
    }

    newPermission.APIMethod = newPermission.APIMethod.toUpperCase();

    const keys: DynamoDBKeySchemaInterface = {
        PK: "#MODULE#GROUP<" + newPermission.GroupName + ">",
        SK: uuidv4()
    }

    const params = {
        TableName: Resources.IP_TABLE,
        Item: Utils.getUniqueInstance().getNewItemToInsert(newPermission, keys)
    };

    try {
        const data = await dynamo.put(params).promise();
        res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
    }
};
