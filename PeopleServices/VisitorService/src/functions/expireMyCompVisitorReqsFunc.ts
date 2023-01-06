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
import { ISRestResultCodes } from "../../../../shared/Utils/Enums/RestResultCodes";


export const expireMyVisitorRequest: APIGatewayProxyHandler = async (event, _context) => {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize
    let visitorRequestToDelete: VisitorRequest = deserialize(requestBody, VisitorRequest);

    if (!visitorRequestToDelete.isPKDefined()) { //if not is PK defined
        return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, visitorRequestToDelete.getReadAndDeleteExpectedBody());
    }

    //Get Email
    let cognito = new CognitoIdentityServiceProvider();
    let dynamo = new DynamoDB.DocumentClient();
    
    //GetSignature
    let email = await Utils.getUniqueInstance().getEmailFromSignature(event.requestContext.identity.cognitoAuthenticationProvider, cognito);
    let companyList = await Utils.getUniqueInstance().getMyListOfCompanies(email, visitorRequestToDelete.CampusName, dynamo);
    
    if (companyList.length === 0) {
        return Utils.getUniqueInstance().getErrorResponse(null, { Error: { Message: "No Auth!" } }, ISRestResultCodes.NoAuth);
    }

    //DELETE
    if (!companyList.find(({CompanyName}) => CompanyName === visitorRequestToDelete.UserHostCompanyName)) {
        return Utils.getUniqueInstance().getErrorResponse(null, { Error: { Message: "You cannot expire this request!" } }, ISRestResultCodes.NoAuth);
    }

    visitorRequestToDelete.expireVisitorRequest()
    let params = VisitorRequestUtils.paramsToDeleteVisitorRequest(visitorRequestToDelete);

    try {
        const data = await dynamo.delete(params).promise();
        return Utils.getUniqueInstance().getDataResponse(data.Attributes);
    } catch (error) {
        return Utils.getUniqueInstance().getErrorResponse(error, params);
    }
};

