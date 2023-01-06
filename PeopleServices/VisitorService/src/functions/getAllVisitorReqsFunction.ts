/*
  Created by Simone Scionti
*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { DynamoDB } from "aws-sdk";
import { deserialize } from "typescript-json-serializer";
import { Campus } from "../../../../shared/Models/Campus";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export const getAllVisitorRequest: APIGatewayProxyHandler = async (event, _context) => {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize
    let requestedCampus: Campus = deserialize(requestBody, Campus);

    if (!requestedCampus.enoughInfoForReadOrDelete()) {
        return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampus.getReadAndDeleteExpectedBody());
    }

    //QUERY
    let params = VisitorRequestUtils.paramsForQueryByCampus(requestedCampus.CampusName)

    let dynamo = new DynamoDB.DocumentClient();

    try {
        const data = await dynamo.queryGetAll(params);
        return Utils.getUniqueInstance().getDataResponse(data);
    } catch (error) {
        return Utils.getUniqueInstance().getErrorResponse(error, params);
    }
};

