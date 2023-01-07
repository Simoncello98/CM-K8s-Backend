/*
  Created by Simone Scionti
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { DynamoDB } from "aws-sdk";
import { VisitorRequest } from "../../../../shared/Models/VisitorRequest";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";


export async function getVisitorRequest(event: Request, res: Response) : Promise<void>  {
    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize 
    let requestedVisitor: VisitorRequest = deserialize(requestBody, VisitorRequest);

    if (!requestedVisitor.enoughInfoForReadOrDelete()) {
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedVisitor.getReadAndDeleteExpectedBody()));
    }

    //GET
    let params = VisitorRequestUtils.paramsToGetVisitorRequest(requestedVisitor.CampusName, requestedVisitor.VisitorEmail, requestedVisitor.VisitorRequestID);

    let dynamo = new DynamoDB.DocumentClient();
    
    try {
        const data = await dynamo.get(params).promise();
        res.status(200).send(Utils.getUniqueInstance().getDataResponse(data.Item));
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
    }
};

