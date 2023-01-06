/*
  Created by Simone Scionti
*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { DynamoDB } from "aws-sdk";
import { VisitorRequest } from "../../../../shared/Models/VisitorRequest";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";


export const getVisitorRequest: APIGatewayProxyHandler = async (event, _context) => {
    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize 
    let requestedVisitor: VisitorRequest = deserialize(requestBody, VisitorRequest);

    if (!requestedVisitor.enoughInfoForReadOrDelete()) {
        return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedVisitor.getReadAndDeleteExpectedBody());
    }

    //GET
    let params = VisitorRequestUtils.paramsToGetVisitorRequest(requestedVisitor.CampusName, requestedVisitor.VisitorEmail, requestedVisitor.VisitorRequestID);

    let dynamo = new DynamoDB.DocumentClient();
    
    try {
        const data = await dynamo.get(params).promise();
        return Utils.getUniqueInstance().getDataResponse(data.Item);
    } catch (error) {
        return Utils.getUniqueInstance().getErrorResponse(error, params);
    }
};

