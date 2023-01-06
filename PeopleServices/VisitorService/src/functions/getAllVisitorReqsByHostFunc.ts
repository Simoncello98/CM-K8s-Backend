/*
  Created by Simone Scionti
*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { DynamoDB } from "aws-sdk";
import { deserialize } from "typescript-json-serializer";
import { VisitorRequestStatus } from "../../../../shared/Utils/Enums/VisitorRequestStatus";
import { CampusXVisitorRequestHost } from "../../../../shared/Models/QueryModels/CampusXVisitorRequestHost";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export const getAllVisitorReqsByHost: APIGatewayProxyHandler = async (event, _context) => {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize
    let requestVisitors: CampusXVisitorRequestHost = deserialize(requestBody, CampusXVisitorRequestHost);
    requestVisitors.autoFillUndefinedImportantAttributes();

    if (!requestVisitors.enoughInfoForReadOrDelete()) {
        return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestVisitors.getReadAndDeleteExpectedBody());
    }

    //QUERY
    let params = requestVisitors.VisitorRequestStatus != VisitorRequestStatus.ALL
        ? VisitorRequestUtils.paramsForQueryByCampusHostEmailAndStatus(requestVisitors.CampusName, requestVisitors.HostEmail, requestVisitors.VisitorRequestStatus)
        : VisitorRequestUtils.paramsForQueryByCampusAndHostEmail(requestVisitors.CampusName, requestVisitors.HostEmail);

    let dynamo = new DynamoDB.DocumentClient();

    try {
        const data = await dynamo.queryGetAll(params);
        return Utils.getUniqueInstance().getDataResponse(data);
    } catch (error) {
        return Utils.getUniqueInstance().getErrorResponse(error, params);
    }

};

