/*
  Created by Simone Scionti
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { DynamoDB } from "aws-sdk";
import { AuthorizedFunctionalities } from "../../../../shared/Models/RelationshipsRecordModels/Permissions/AuthorizedFunctionalities";
import { AuthorizationServiceUtils } from "../Utils/AuthorizationServiceUtils";


export async function createPermissionFunc(event: Request, res: Response) : Promise<void> {
    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize
    let newFunctionality: AuthorizedFunctionalities = deserialize(requestBody, AuthorizedFunctionalities);

    if (!newFunctionality.enoughInfoForCreate()) {
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, newFunctionality.getCreateExpectedBody()));
    }

    newFunctionality.APIMethod = newFunctionality.APIMethod.toUpperCase();

    //CREATE
    let dynamo = new DynamoDB.DocumentClient();
    let params = AuthorizationServiceUtils.paramsToCreateFunctionality(newFunctionality);

    try {
        const data = await dynamo.put(params).promise();
        res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
    }
};
