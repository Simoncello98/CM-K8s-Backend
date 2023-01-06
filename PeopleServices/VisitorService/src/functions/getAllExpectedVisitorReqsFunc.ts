/*
  Created by Simone Scionti
*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { CognitoIdentityServiceProvider, DynamoDB } from "aws-sdk";
import { deserialize } from "typescript-json-serializer";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";
import { VisitorRequestStatus } from "../../../../shared/Utils/Enums/VisitorRequestStatus";
import { StartDateEnum } from "../../../../shared/Utils/Enums/StartDateEnum";
import { CampusXVisitorRequestStatus } from "../../../../shared/Models/QueryModels/CampusXVisitorRequestStatus";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export const getAllExpectedVisitorReqs: APIGatewayProxyHandler = async (event, _context) => {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize - Campus
    let requestVisitors: CampusXVisitorRequestStatus = deserialize(requestBody, CampusXVisitorRequestStatus);

    if (!requestVisitors.enoughInfoForReadOrDelete()) {
        return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestVisitors.getReadAndDeleteExpectedBody());
    }

    requestVisitors.autoFillUndefinedImportantAttributes();

    //Deserialize - Log
    let startDate = Utils.getUniqueInstance().getCurrentDateTime().substring(0, StartDateEnum.Today);

    //Get Email
    let cognito = new CognitoIdentityServiceProvider();
    let email = await Utils.getUniqueInstance().getEmailFromSignature(event.requestContext.identity.cognitoAuthenticationProvider, cognito);

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
        return Utils.getUniqueInstance().getDataResponse(listVisitorRequests);
    } catch (error) {
        let mergedParams = {
            ...paramsForOtherVisitorRequests,
            ...paramsMyVisitorRequests
        }
        return Utils.getUniqueInstance().getErrorResponse(error, mergedParams);
    }

};
