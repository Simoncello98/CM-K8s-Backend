/*
  Created by Simone Scionti
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { MyVisitorRequest } from "../../../../shared/Models/MyVisitorRequest";
import { deserialize } from "typescript-json-serializer";
import { DynamoDBKeySchemaInterface } from "../../../../shared/Utils/Interfaces/DynamoDBKeySchemaInterface";
import { Resources } from "../../../../shared/Utils/Resources";
import { CognitoIdentityServiceProvider, DynamoDB } from "aws-sdk";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";
import { v4 as uuidv4 } from "uuid";
import { User } from "../../../../shared/Models/User";
//import { StartDateEnum } from "../../../../shared/Utils/Enums/StartDateEnum";
import { ISRestResultCodes } from "../../../../shared/Utils/Enums/RestResultCodes";


export async function createMyVisitorRequest(event: Request, res: Response) : Promise<void>  {
    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize VisitorRequest. 
    let newVisitorRequest: MyVisitorRequest = deserialize(requestBody, MyVisitorRequest);

    if (!newVisitorRequest.enoughInfoForCreate()) {
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, newVisitorRequest.getCreateExpectedBody()));
    }


    //New Specification: employee can create visitor request also for today. 
    // let today = Utils.getUniqueInstance().getCurrentDateTime().substr(0, StartDateEnum.Today);
    // if (newVisitorRequest.EstimatedDateOfArrival.substr(0, StartDateEnum.Today) === today) {
    //     res.status(500).send(Utils.getUniqueInstance().getErrorResponse(null, { Error: { message: "You can't create visit requests with today's date." } }, ISRestResultCodes.BadRequest);
    // }

    //Get Host
    let cognito = new CognitoIdentityServiceProvider();
    let hostEmail = await Utils.getUniqueInstance().getEmailFromSignature(event.headers.authorization, cognito);

    //GET - TelephoneNumber
    const keysHost: DynamoDBKeySchemaInterface = {
        PK: "#USER<" + hostEmail + ">",
        SK: "#USER_INFO<" + hostEmail + ">"
    };

    const paramsHost = {
        TableName: Resources.IP_TABLE,
        ProjectionExpression: "TelephoneNumber",
        Key: keysHost
    };

    let telephoneNumber: string = "";

    let dynamo = new DynamoDB.DocumentClient();

    try {
        const data = await dynamo.get(paramsHost).promise();
        telephoneNumber = data.Item ? data.Item.TelephoneNumber : "";
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, paramsHost));
    }

    if (telephoneNumber === "" && newVisitorRequest.UserHostTelephoneNumber) {
        if (!newVisitorRequest.UserHostTelephoneNumber.match(/^\+?(\d\s?)*\d$/g)) {
            res.status(500).send(Utils.getUniqueInstance().getErrorResponse(null, { Error: { message: "Invalid Userhost Thelephone number!" } }, ISRestResultCodes.BadRequest))
        } else {
            telephoneNumber = newVisitorRequest.UserHostTelephoneNumber;
        }
    }

    if (!telephoneNumber) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(null, { Error: { hostEmail: hostEmail, message: "TelephoneNumber is empty." } }))
    }

    if (newVisitorRequest.VisitorTelephoneNumber) {
        if (!newVisitorRequest.VisitorTelephoneNumber.match(/^\+?(\d\s?)*\d$/g)) {
            res.status(500).send(Utils.getUniqueInstance().getErrorResponse(null, { Error: { message: "Invalid Visitor Thelephone number!" } }, ISRestResultCodes.BadRequest))
        }
    }

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

    //PUT
    newVisitorRequest.autoFillUndefinedImportantAttributes();
    newVisitorRequest.createGSIAttributes();
    newVisitorRequest.VisitorRequestID = uuidv4();
    newVisitorRequest.setHost(hostEmail, telephoneNumber, newVisitorRequest.UserHostCompanyName);
    let params = VisitorRequestUtils.paramsToCreateVisitorRequest(newVisitorRequest);

    try {
        const data = await dynamo.put(params).promise();
        res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
    }
};
