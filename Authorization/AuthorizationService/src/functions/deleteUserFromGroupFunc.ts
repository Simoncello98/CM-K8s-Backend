/*
  Created by Simone Scionti
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import { UserXGroup } from "../../../../shared/Models/QueryModels/UserXGroup";
import { AuthorizationServiceUtils } from "../Utils/AuthorizationServiceUtils";


export async function deleteUserFromGroup(event: Request, res: Response) : Promise<void> {
    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize
    let requestedUserXGroup: UserXGroup = deserialize(requestBody, UserXGroup);

    if (!requestedUserXGroup.enoughInfoForReadOrDelete()) {
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedUserXGroup.getReadAndDeleteExpectedBody()));
        return
    }

    let cognito = new CognitoIdentityServiceProvider({ signatureVersion: 'v4' });

    let params = AuthorizationServiceUtils.getCognitoParamsByUserAndGroup(requestedUserXGroup.Email, requestedUserXGroup.Group);

    try {
        const data = await cognito.adminRemoveUserFromGroup(params).promise();
        res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
        return
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
        return
    }
};
