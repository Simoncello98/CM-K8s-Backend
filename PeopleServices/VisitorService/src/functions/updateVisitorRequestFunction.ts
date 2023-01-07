/*
  Created by Simone Scionti
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { VisitorRequest } from "../../../../shared/Models/VisitorRequest";
import { DynamoDB } from "aws-sdk";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";
import { VisitorRequestStatus } from "../../../../shared/Utils/Enums/VisitorRequestStatus";


export async function updateVisitorRequest(event: Request, res: Response) : Promise<void>  {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize
    let visitorRequestToUpdate: VisitorRequest = deserialize(requestBody, VisitorRequest);

    if (!visitorRequestToUpdate.isPKDefined()) { //if not is PK defined
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, visitorRequestToUpdate.getUpdateExpectedBody()));
    }

    if (!visitorRequestToUpdate.enoughInfoForUpdate()) {
        res.status(400).send(Utils.getUniqueInstance().getNothingToDoErrorResponse(requestBody, visitorRequestToUpdate.getUpdateExpectedBody()));
    }

    //UPDATE
    if(visitorRequestToUpdate.VisitorRequestStatus) {
        if(visitorRequestToUpdate.VisitorRequestStatus == VisitorRequestStatus.EXPIRED) {
            visitorRequestToUpdate.expireVisitorRequest();
        } else {
            visitorRequestToUpdate.changeVisitorStatus(visitorRequestToUpdate.VisitorRequestStatus);
        }
    }
    let params = VisitorRequestUtils.paramsToUpdateVisitorRequest(visitorRequestToUpdate);

    let dynamo = new DynamoDB.DocumentClient();

    try {
        const data = await dynamo.update(params).promise();
        res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
    }
};

