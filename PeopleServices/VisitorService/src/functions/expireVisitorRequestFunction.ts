/*
  Created by Simone Scionti
*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { VisitorRequest } from "../../../../shared/Models/VisitorRequest";
import { DynamoDB } from "aws-sdk";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";


export const expireVisitorRequest: APIGatewayProxyHandler = async (event, _context) => {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize
    let visitorRequestToUpdate: VisitorRequest = deserialize(requestBody, VisitorRequest);

    if (!visitorRequestToUpdate.isPKDefined()) { //if not is PK defined
        return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, visitorRequestToUpdate.getReadAndDeleteExpectedBody());
    }

    //DELETE
    visitorRequestToUpdate.expireVisitorRequest()
    let params = VisitorRequestUtils.paramsToDeleteVisitorRequest(visitorRequestToUpdate);

    let dynamo = new DynamoDB.DocumentClient();

    try {
        const data = await dynamo.delete(params).promise();
        return Utils.getUniqueInstance().getDataResponse(data.Attributes);
    } catch (error) {
        return Utils.getUniqueInstance().getErrorResponse(error, params);
    }
};

