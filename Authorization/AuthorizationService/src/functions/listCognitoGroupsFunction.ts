/*
  Created by Simone Scionti
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import { AuthorizationServiceUtils } from "../Utils/AuthorizationServiceUtils";


export async function listCognitoGroups(_event: Request, res: Response) : Promise<void> {

    let cognito = new CognitoIdentityServiceProvider({ signatureVersion: 'v4' });

    let params = AuthorizationServiceUtils.getCognitoParamsByCognitoClientID();

    let listGroupsName: any[] = [];

    try {
        const data = await cognito.listGroups(params).promise();

        for(let group of data.Groups) {
            listGroupsName.push({CognitoGroupName: group.GroupName});
        }

        res.status(200).send(Utils.getUniqueInstance().getDataResponse(listGroupsName));
        return
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
        return
    }
};
