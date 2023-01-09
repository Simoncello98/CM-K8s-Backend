/*
  Created by Simone Scionti
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { CognitoIdentityServiceProvider, DynamoDB } from "aws-sdk";
import { deserialize } from "typescript-json-serializer";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";
import { VisitorRequestStatus } from "../../../../shared/Utils/Enums/VisitorRequestStatus";
import { StartDateEnum } from "../../../../shared/Utils/Enums/StartDateEnum";
import { CampusXVisitorRequestStatus } from "../../../../shared/Models/QueryModels/CampusXVisitorRequestStatus";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export async function getAllExpectedVisitorReqs(event: Request, res: Response) : Promise<void>  {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize - Campus
    let requestVisitors: CampusXVisitorRequestStatus = deserialize(requestBody, CampusXVisitorRequestStatus);

    if (!requestVisitors.enoughInfoForReadOrDelete()) {
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestVisitors.getReadAndDeleteExpectedBody()));
    }

    requestVisitors.autoFillUndefinedImportantAttributes();

    //Deserialize - Log
    let startDate = Utils.getUniqueInstance().getCurrentDateTime().substring(0, StartDateEnum.Today);

    //Get Email
    let cognito = new CognitoIdentityServiceProvider();
    let email = await Utils.getUniqueInstance().getEmailFromSignature(event.headers.authorization, cognito);

    //QUERY Other VisitorRequests
    let paramsForOtherVisitorRequests = VisitorRequestUtils.paramsForQueryByCampusStatusStartDateAndLimitRecords(requestVisitors.CampusName, VisitorRequestStatus.ACCEPTED, startDate);

    let paramsMyVisitorRequests = requestVisitors.VisitorRequestStatus != VisitorRequestStatus.ALL
        ? VisitorRequestUtils.paramsForQueryByCampusHostEmailAndStatus(requestVisitors.CampusName, email, requestVisitors.VisitorRequestStatus)
        : VisitorRequestUtils.paramsForQueryByCampusAndHostEmail(requestVisitors.CampusName, email);

    let dynamo = new DynamoDB.DocumentClient();

    try {
        const dataOtherRequests = await dynamo.queryGetAll(paramsForOtherVisitorRequests);
        const dataMyRequests = await dynamo.queryGetAll(paramsMyVisitorRequests);

        let listVisitorRequests = dataMyRequests;
        var flag = false;

        for (var i = 0; i < dataOtherRequests.length; i++) {
            console.log("my: ", dataOtherRequests[i]);
            flag = false;
            for (var j = 0; j < dataMyRequests.length; j++) {
                console.log("other: ", dataMyRequests[j]);
                if (dataOtherRequests[i].VisitorRequestID === dataMyRequests[j].VisitorRequestID) {
                    flag = true;
                    j = dataMyRequests.length + 1;
                }
            }
            if (!flag) {
                listVisitorRequests.push(dataOtherRequests[i]);
            }
        }
        res.status(200).send(Utils.getUniqueInstance().getDataResponse(listVisitorRequests));
    } catch (error) {
        let mergedParams = {
            ...paramsForOtherVisitorRequests,
            ...paramsMyVisitorRequests
        }
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, mergedParams));
    }

};
