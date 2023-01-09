/*
  Created by Simone Scionti
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { CognitoIdentityServiceProvider, DynamoDB } from "aws-sdk";
import { deserialize } from "typescript-json-serializer";
import { CampusXVisitorRequestStatus } from "../../../../shared/Models/QueryModels/CampusXVisitorRequestStatus";
import { VisitorRequestStatus } from "../../../../shared/Utils/Enums/VisitorRequestStatus";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";
import { ISRestResultCodes } from "../../../../shared/Utils/Enums/RestResultCodes";
import { VisitorRequest } from "../../../../shared/Models/VisitorRequest";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export async function getAllMyCompVisReqs(event: Request, res: Response) : Promise<void>  {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize 
    let requestVisitors: CampusXVisitorRequestStatus = deserialize(requestBody, CampusXVisitorRequestStatus);

    if (!requestVisitors.enoughInfoForReadOrDelete()) {
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestVisitors.getReadAndDeleteExpectedBody()));
        return
    }

    requestVisitors.autoFillUndefinedImportantAttributes();

    let cognito = new CognitoIdentityServiceProvider();
    let dynamo = new DynamoDB.DocumentClient();

    //GetSignature
    let email = await Utils.getUniqueInstance().getEmailFromSignature(event.get("JWTAuthorization"), cognito);
    let companyList = await Utils.getUniqueInstance().getMyListOfCompanies(email, requestVisitors.CampusName, dynamo);

    if (companyList.length === 0) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(null, { Error: { Message: "No Auth!" } }, ISRestResultCodes.NoAuth));
        return
    }

    //QUERY
    let params = requestVisitors.VisitorRequestStatus != VisitorRequestStatus.ALL
        ? VisitorRequestUtils.paramsForQueryByCampusAndStatus(requestVisitors.CampusName, requestVisitors.VisitorRequestStatus)
        : VisitorRequestUtils.paramsForQueryByCampus(requestVisitors.CampusName);

    try {
        const data = await dynamo.queryGetAll(params);

        let listItems = data.map(x => {
            let visitorReuqest: VisitorRequest = deserialize(x, VisitorRequest);
            if (companyList.find(({ CompanyName }) => CompanyName === visitorReuqest.UserHostCompanyName)) {
                return visitorReuqest;
            } else {
                return null;
            }
        }).filter(z => (z != null));

        res.status(200).send(Utils.getUniqueInstance().getDataResponse(listItems));
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
    }

};

