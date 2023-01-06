/*
  Created by Simone Scionti
*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { VisitorRequest } from "../../../../shared/Models/VisitorRequest";
import { deserialize } from "typescript-json-serializer";
import { DynamoDB } from "aws-sdk";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";
import { v4 as uuidv4 } from "uuid";
import { User } from "../../../../shared/Models/User";
import { ISRestResultCodes } from "../../../../shared/Utils/Enums/RestResultCodes";



export const createVisitorRequest: APIGatewayProxyHandler = async (event, _context) => {
    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize
    let newVisitorRequest: VisitorRequest = deserialize(requestBody, VisitorRequest);

    if (!newVisitorRequest.enoughInfoForCreate()) {
        return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, newVisitorRequest.getCreateExpectedBody());
    }

    let dynamo = new DynamoDB.DocumentClient();
 
    //PUT
    newVisitorRequest.autoFillUndefinedImportantAttributes();
    newVisitorRequest.createGSIAttributes();
    newVisitorRequest.VisitorRequestID = uuidv4();

    let visitorWithInfo: User = await VisitorRequestUtils.getUserInfoNames(newVisitorRequest.VisitorEmail, dynamo);
    if (visitorWithInfo) {
        newVisitorRequest.VisitorFName = visitorWithInfo.FName;
        newVisitorRequest.VisitorLName = visitorWithInfo.LName;
    }

    let hostWithInfo: User = await VisitorRequestUtils.getUserInfoNames(newVisitorRequest.UserHostEmail, dynamo);
    if (hostWithInfo) {
        newVisitorRequest.UserHostFName = hostWithInfo.FName;
        newVisitorRequest.UserHostLName = hostWithInfo.LName;
    }

    if (newVisitorRequest.UserHostTelephoneNumber) {
        if (!newVisitorRequest.UserHostTelephoneNumber.match(/^\+?(\d\s?)*\d$/g)) {
            return Utils.getUniqueInstance().getErrorResponse(null, { Error: { message: "Invalid Userhost Thelephone number!" } }, ISRestResultCodes.BadRequest)
        }
    }

    if (newVisitorRequest.VisitorTelephoneNumber) {
        if (!newVisitorRequest.VisitorTelephoneNumber.match(/^\+?(\d\s?)*\d$/g)) {
            return Utils.getUniqueInstance().getErrorResponse(null, { Error: { message: "Invalid Visitor Thelephone number!" } }, ISRestResultCodes.BadRequest)
        }
    }


    let params = VisitorRequestUtils.paramsToCreateVisitorRequest(newVisitorRequest);

    try {
        const data = await dynamo.put(params).promise();
        return Utils.getUniqueInstance().getDataResponse(data);
    } catch (error) {
        return Utils.getUniqueInstance().getErrorResponse(error, params);
    }
};

