/*
  Created by Simone Scionti
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { VisitorRequest } from "../../../../shared/Models/VisitorRequest";
import { CognitoIdentityServiceProvider, DynamoDB } from "aws-sdk";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";
import { ISRestResultCodes } from "../../../../shared/Utils/Enums/RestResultCodes";


export async function expireMyCompVisitorRequest(event: Request, res: Response) : Promise<void>  {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize
    let visitorRequestToDelete: VisitorRequest = deserialize(requestBody, VisitorRequest);

    if (!visitorRequestToDelete.isPKDefined()) { //if not is PK defined
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, visitorRequestToDelete.getReadAndDeleteExpectedBody()));
    }

    //Get Email
    let cognito = new CognitoIdentityServiceProvider();
    let dynamo = new DynamoDB.DocumentClient();
    
    //GetSignature
    let email = await Utils.getUniqueInstance().getEmailFromSignature(event.requestContext.identity.cognitoAuthenticationProvider, cognito);
    let companyList = await Utils.getUniqueInstance().getMyListOfCompanies(email, visitorRequestToDelete.CampusName, dynamo);
    
    if (companyList.length === 0) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(null, { Error: { Message: "No Auth!" } }, ISRestResultCodes.NoAuth));
    }

    //DELETE
    if (!companyList.find(({CompanyName}) => CompanyName === visitorRequestToDelete.UserHostCompanyName)) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(null, { Error: { Message: "You cannot expire this request!" } }, ISRestResultCodes.NoAuth));
    }

    visitorRequestToDelete.expireVisitorRequest()
    let params = VisitorRequestUtils.paramsToDeleteVisitorRequest(visitorRequestToDelete);

    try {
        const data = await dynamo.delete(params).promise();
        res.status(200).send(Utils.getUniqueInstance().getDataResponse(data.Attributes));
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
    }
};

