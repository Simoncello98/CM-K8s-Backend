/*
  Created by Simone Scionti
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { DynamoDB } from "aws-sdk";
import { deserialize } from "typescript-json-serializer";
import { VisitorRequestStatus } from "../../../../shared/Utils/Enums/VisitorRequestStatus";
import { CampusXVisitorRequestHost } from "../../../../shared/Models/QueryModels/CampusXVisitorRequestHost";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export async function getAllVisitorReqsByHost(event: Request, res: Response) : Promise<void>  {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize
    let requestVisitors: CampusXVisitorRequestHost = deserialize(requestBody, CampusXVisitorRequestHost);
    requestVisitors.autoFillUndefinedImportantAttributes();

    if (!requestVisitors.enoughInfoForReadOrDelete()) {
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestVisitors.getReadAndDeleteExpectedBody()));
        return
    }

    //QUERY
    let params = requestVisitors.VisitorRequestStatus != VisitorRequestStatus.ALL
        ? VisitorRequestUtils.paramsForQueryByCampusHostEmailAndStatus(requestVisitors.CampusName, requestVisitors.HostEmail, requestVisitors.VisitorRequestStatus)
        : VisitorRequestUtils.paramsForQueryByCampusAndHostEmail(requestVisitors.CampusName, requestVisitors.HostEmail);

    let dynamo = new DynamoDB.DocumentClient();

    try {
        const data = await dynamo.queryGetAll(params);
        res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
    }

};

