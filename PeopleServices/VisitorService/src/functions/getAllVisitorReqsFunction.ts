/*
  Created by Simone Scionti
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { DynamoDB } from "aws-sdk";
import { deserialize } from "typescript-json-serializer";
import { Campus } from "../../../../shared/Models/Campus";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export async function getAllVisitorRequest(event: Request, res: Response) : Promise<void>  {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize
    let requestedCampus: Campus = deserialize(requestBody, Campus);

    if (!requestedCampus.enoughInfoForReadOrDelete()) {
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampus.getReadAndDeleteExpectedBody()));
        return
    }

    //QUERY
    let params = VisitorRequestUtils.paramsForQueryByCampus(requestedCampus.CampusName)

    let dynamo = new DynamoDB.DocumentClient();

    try {
        const data = await dynamo.queryGetAll(params);
        res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
    }
};

