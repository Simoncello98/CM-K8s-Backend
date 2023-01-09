/*
  Created by Simone Scionti
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { DynamoDB } from "aws-sdk";
import { AuthorizationServiceUtils } from "../Utils/AuthorizationServiceUtils";
import { RootNavigationItem } from "../../../../shared/Models/RelationshipsRecordModels/Permissions/RootNavigationItem";
import { ISRestResultCodes } from "../../../../shared/Utils/Enums/RestResultCodes";


export async function performToTransactWriteNavig(event: Request, res: Response) : Promise<void> {
    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);
    
    let dynamo = new DynamoDB.DocumentClient();
    
    let itemsToTransact: any[] = [];

    for (var i = 0; i < Object.keys(requestBody).length; i++) {
        //Deserialize
        let navigationItem: RootNavigationItem = deserialize(requestBody[i], RootNavigationItem);
        if (!navigationItem.enoughInfoForCreate()) {
            res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody[i], navigationItem.getCreateExpectedBody()));
        }
        navigationItem.autoFillUndefinedImportantAttributes();

        let item = AuthorizationServiceUtils.paramsToPutSingleTransactNavigation(navigationItem);
        itemsToTransact.push(item);

        if (i > 0 && i % 24 == 0) {
            let params = AuthorizationServiceUtils.paramsToPutTransactWrite(itemsToTransact);
            try {
                await dynamo.transactWrite(params).promise();
            } catch (error) {
                res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
            }
            itemsToTransact = [];
        }
    }

    if (itemsToTransact.length > 0) {
        let params = AuthorizationServiceUtils.paramsToPutTransactWrite(itemsToTransact);
        try {
            await dynamo.transactWrite(params).promise();
        } catch (error) {
            res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
        }
    }

    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(null, { "NumberOfItems: ": Object.keys(requestBody).length }, ISRestResultCodes.Ok));
};
