/*
  Created by Simone Scionti
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { DynamoDB } from "aws-sdk";
import { deserialize } from "typescript-json-serializer";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";
import { StartDateEnum } from "../../../../shared/Utils/Enums/StartDateEnum";
import { CampusXVisitorRequestStatus } from "../../../../shared/Models/QueryModels/CampusXVisitorRequestStatus";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export async function getAdminAllExpVisitorReqs(event: Request, res: Response) : Promise<void>  {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize - Campus
    let requestVisitors: CampusXVisitorRequestStatus = deserialize(requestBody, CampusXVisitorRequestStatus);

    if (!requestVisitors.enoughInfoForReadOrDelete()) {
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestVisitors.getReadAndDeleteExpectedBody()))
        return
    }

    requestVisitors.autoFillUndefinedImportantAttributes();

    //Deserialize - Log
    let startDate = Utils.getUniqueInstance().getCurrentDateTime().substring(0, StartDateEnum.Today);

    //QUERY Today VisitorRequests
    let paramsForVisitorRequests = VisitorRequestUtils.paramsForQueryByCampusAllStatusStartDateAndLimitRecords(requestVisitors.CampusName, startDate);

    let dynamo = new DynamoDB.DocumentClient();

    try {
        const todayRequests = await dynamo.queryGetAll(paramsForVisitorRequests);
        res.status(200).send(Utils.getUniqueInstance().getDataResponse(todayRequests));
    } catch (error) {
        let mergedParams = {
            ...paramsForVisitorRequests
        }
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, mergedParams));
    }

};
