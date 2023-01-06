/*
  Created by Simone Scionti
*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { CognitoIdentityServiceProvider, DynamoDB } from "aws-sdk";
import { deserialize } from "typescript-json-serializer";
import { CampusXVisitorRequestHost } from "../../../../shared/Models/QueryModels/CampusXVisitorRequestHost";
import { VisitorRequestStatus } from "../../../../shared/Utils/Enums/VisitorRequestStatus";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";
import { ISRestResultCodes } from "../../../../shared/Utils/Enums/RestResultCodes";
import { VisitorRequest } from "../../../../shared/Models/VisitorRequest";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export const getAllMyCompVisReqsByHost: APIGatewayProxyHandler = async (event, _context) => {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize 
    let requestVisitors: CampusXVisitorRequestHost = deserialize(requestBody, CampusXVisitorRequestHost);

    if (!requestVisitors.enoughInfoForReadOrDelete()) {
        return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestVisitors.getReadAndDeleteExpectedBody());
    }

    requestVisitors.autoFillUndefinedImportantAttributes();

    let cognito = new CognitoIdentityServiceProvider();
    let dynamo = new DynamoDB.DocumentClient();

    //GetSignature
    let email = await Utils.getUniqueInstance().getEmailFromSignature(event.requestContext.identity.cognitoAuthenticationProvider, cognito);
    let companyList = await Utils.getUniqueInstance().getMyListOfCompanies(email, requestVisitors.CampusName, dynamo);

    if (companyList.length === 0) {
        return Utils.getUniqueInstance().getErrorResponse(null, { Error: { Message: "No Auth!" } }, ISRestResultCodes.NoAuth);
    }

    //QUERY
    let params = requestVisitors.VisitorRequestStatus != VisitorRequestStatus.ALL
        ? VisitorRequestUtils.paramsForQueryByCampusHostEmailAndStatus(requestVisitors.CampusName, requestVisitors.HostEmail, requestVisitors.VisitorRequestStatus)
        : VisitorRequestUtils.paramsForQueryByCampusAndHostEmail(requestVisitors.CampusName, requestVisitors.HostEmail);

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

        return Utils.getUniqueInstance().getDataResponse(listItems);
    } catch (error) {
        return Utils.getUniqueInstance().getErrorResponse(error, params);
    }

};

