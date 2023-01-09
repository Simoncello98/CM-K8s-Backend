/*
  Created by Simone Scionti
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import { User } from "../../../../shared/Models/User";
import { AuthorizationServiceUtils } from "../Utils/AuthorizationServiceUtils";


export async function listGroupsFromUser(event: Request, res: Response) : Promise<void> {
    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize 
    let requestedUser: User = deserialize(requestBody, User);

    if (!requestedUser.enoughInfoForReadOrDelete()) {
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedUser.getReadAndDeleteExpectedBody()));
    }

    let cognito = new CognitoIdentityServiceProvider({ signatureVersion: 'v4' });
    
    let params = AuthorizationServiceUtils.getCognitoParamsByUser(requestedUser.Email);

    try {
        const data = await cognito.adminListGroupsForUser(params).promise();
        res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
    }
};
