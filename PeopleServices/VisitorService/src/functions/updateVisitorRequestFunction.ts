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
import { VisitorRequestStatus } from "../../../../shared/Utils/Enums/VisitorRequestStatus";


export const updateVisitorRequest: APIGatewayProxyHandler = async (event, _context) => {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize
    let visitorRequestToUpdate: VisitorRequest = deserialize(requestBody, VisitorRequest);

    if (!visitorRequestToUpdate.isPKDefined()) { //if not is PK defined
        return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, visitorRequestToUpdate.getUpdateExpectedBody());
    }

    if (!visitorRequestToUpdate.enoughInfoForUpdate()) {
        return Utils.getUniqueInstance().getNothingToDoErrorResponse(requestBody, visitorRequestToUpdate.getUpdateExpectedBody());
    }

    //UPDATE
    if(visitorRequestToUpdate.VisitorRequestStatus) {
        if(visitorRequestToUpdate.VisitorRequestStatus == VisitorRequestStatus.EXPIRED) {
            visitorRequestToUpdate.expireVisitorRequest();
        } else {
            visitorRequestToUpdate.changeVisitorStatus(visitorRequestToUpdate.VisitorRequestStatus);
        }
    }
    let params = VisitorRequestUtils.paramsToUpdateVisitorRequest(visitorRequestToUpdate);

    let dynamo = new DynamoDB.DocumentClient();

    try {
        const data = await dynamo.update(params).promise();
        return Utils.getUniqueInstance().getDataResponse(data);
    } catch (error) {
        return Utils.getUniqueInstance().getErrorResponse(error, params);
    }
};

