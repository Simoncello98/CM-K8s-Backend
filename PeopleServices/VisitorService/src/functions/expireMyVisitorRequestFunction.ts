/*
  Created by Simone Scionti
*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { VisitorRequest } from "../../../../shared/Models/VisitorRequest";
import { CognitoIdentityServiceProvider, DynamoDB } from "aws-sdk";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";


export const expireMyVisitorRequest: APIGatewayProxyHandler = async (event, _context) => {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize
    let visitorRequestToDelete: VisitorRequest = deserialize(requestBody, VisitorRequest);

    if (!visitorRequestToDelete.isPKDefined()) { //if not is PK defined
        return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, visitorRequestToDelete.getReadAndDeleteExpectedBody());
    }

    //Get Email
    let cognito = new CognitoIdentityServiceProvider();
    let email = await Utils.getUniqueInstance().getEmailFromSignature(event.requestContext.identity.cognitoAuthenticationProvider, cognito);

    if(visitorRequestToDelete.UserHostEmail !== email) {
        return Utils.getUniqueInstance().getErrorResponse(null, { Error: { message: "You can not delete this request." } });
    }

    //DELETE
    visitorRequestToDelete.expireVisitorRequest()
    let params = VisitorRequestUtils.paramsToDeleteVisitorRequest(visitorRequestToDelete);

    let dynamo = new DynamoDB.DocumentClient();

    try {
        const data = await dynamo.delete(params).promise();
        return Utils.getUniqueInstance().getDataResponse(data.Attributes);
    } catch (error) {
        return Utils.getUniqueInstance().getErrorResponse(error, params);
    }
};

