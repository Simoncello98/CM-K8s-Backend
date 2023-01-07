/*
  Created by Simone Scionti
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { DynamoDB } from "aws-sdk";
import { deserialize } from "typescript-json-serializer";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";
import { CampusXUser } from "../../../../shared/Models/QueryModels/CampusXUser";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export async function getByVisitor(event: Request, res: Response) : Promise<void>  {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize
    let requestedCampus: CampusXUser = deserialize(requestBody, CampusXUser);

    if (!requestedCampus.enoughInfoForReadOrDelete()) {
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampus.getReadAndDeleteExpectedBody()));
    }

    //QUERY
    let params = VisitorRequestUtils.paramsToQueryByVisitor(requestedCampus.CampusName, requestedCampus.Email);

    let dynamo = new DynamoDB.DocumentClient();

    try {
        const data = await dynamo.queryGetAll(params);
        res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
    }
};

