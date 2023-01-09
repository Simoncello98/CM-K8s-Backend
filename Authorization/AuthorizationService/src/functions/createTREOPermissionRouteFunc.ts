/*
  Created by Simone Scionti
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { DynamoDB } from "aws-sdk";
import { RootNavigationItem } from "../../../../shared/Models/RelationshipsRecordModels/Permissions/RootNavigationItem";
import { AuthorizationServiceUtils } from "../Utils/AuthorizationServiceUtils";


export async function createTREOPermissionRoute(event: Request, res: Response) : Promise<void> {
    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize
    let newNavigation: RootNavigationItem = deserialize(requestBody, RootNavigationItem);

    if (!newNavigation.enoughInfoForCreate()) {
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, newNavigation.getCreateExpectedBody()));
        return
    }

    newNavigation.autoFillUndefinedImportantAttributes();

    //CREATE
    let dynamo = new DynamoDB.DocumentClient();

    let params = AuthorizationServiceUtils.paramsToCreateNavigation(newNavigation);

    try {
        const data = await dynamo.put(params).promise();
        res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
        return
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
        return
    }
};
