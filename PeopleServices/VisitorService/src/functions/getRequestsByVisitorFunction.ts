/*
  Created by Simone Scionti
*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { DynamoDB } from "aws-sdk";
import { deserialize } from "typescript-json-serializer";
import { VisitorRequestUtils } from "../Utils/VisitorRequestUtils";
import { CampusXUser } from "../../../../shared/Models/QueryModels/CampusXUser";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export const getByVisitor: APIGatewayProxyHandler = async (event, _context) => {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize
    let requestedCampus: CampusXUser = deserialize(requestBody, CampusXUser);

    if (!requestedCampus.enoughInfoForReadOrDelete()) {
        return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampus.getReadAndDeleteExpectedBody());
    }

    //QUERY
    let params = VisitorRequestUtils.paramsToQueryByVisitor(requestedCampus.CampusName, requestedCampus.Email);

    let dynamo = new DynamoDB.DocumentClient();

    try {
        const data = await dynamo.queryGetAll(params);
        return Utils.getUniqueInstance().getDataResponse(data);
    } catch (error) {
        return Utils.getUniqueInstance().getErrorResponse(error, params);
    }
};

