/*
  Created by Simone Scionti
*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { DynamoDB } from "aws-sdk";
import { deserialize } from "typescript-json-serializer";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";
import { StartDateEnum } from "../../../../shared/Utils/Enums/StartDateEnum";
import { CampusXVisitorRequestStatus } from "../../../../shared/Models/QueryModels/CampusXVisitorRequestStatus";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export const getAdminAllExpVisitorReqs: APIGatewayProxyHandler = async (event, _context) => {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize - Campus
    let requestVisitors: CampusXVisitorRequestStatus = deserialize(requestBody, CampusXVisitorRequestStatus);

    if (!requestVisitors.enoughInfoForReadOrDelete()) {
        return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestVisitors.getReadAndDeleteExpectedBody());
    }

    requestVisitors.autoFillUndefinedImportantAttributes();

    //Deserialize - Log
    let startDate = Utils.getUniqueInstance().getCurrentDateTime().substring(0, StartDateEnum.Today);

    //QUERY Today VisitorRequests
    let paramsForVisitorRequests = VisitorRequestUtils.paramsForQueryByCampusAllStatusStartDateAndLimitRecords(requestVisitors.CampusName, startDate);

    let dynamo = new DynamoDB.DocumentClient();

    try {
        const todayRequests = await dynamo.queryGetAll(paramsForVisitorRequests);
        return Utils.getUniqueInstance().getDataResponse(todayRequests);
    } catch (error) {
        let mergedParams = {
            ...paramsForVisitorRequests
        }
        return Utils.getUniqueInstance().getErrorResponse(error, mergedParams);
    }

};
