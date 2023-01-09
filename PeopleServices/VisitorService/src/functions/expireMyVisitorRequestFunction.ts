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


export async function expireMyVisitorRequest(event: Request, res: Response) : Promise<void>  {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize
    let visitorRequestToDelete: VisitorRequest = deserialize(requestBody, VisitorRequest);

    if (!visitorRequestToDelete.isPKDefined()) { //if not is PK defined
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, visitorRequestToDelete.getReadAndDeleteExpectedBody()));
    }

    //Get Email
    let cognito = new CognitoIdentityServiceProvider();
    let email = await Utils.getUniqueInstance().getEmailFromSignature(event.headers.authorization, cognito);

    if(visitorRequestToDelete.UserHostEmail !== email) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(null, { Error: { message: "You can not delete this request." } }));
    }

    //DELETE
    visitorRequestToDelete.expireVisitorRequest()
    let params = VisitorRequestUtils.paramsToDeleteVisitorRequest(visitorRequestToDelete);

    let dynamo = new DynamoDB.DocumentClient();

    try {
        const data = await dynamo.delete(params).promise();
        res.status(200).send(Utils.getUniqueInstance().getDataResponse(data.Attributes));
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
    }
};

