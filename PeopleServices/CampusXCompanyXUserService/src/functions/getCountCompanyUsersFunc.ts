/*
  Created by Simone Scionti
*/
'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { deserialize } from "typescript-json-serializer";
import { Campus } from "../../../../shared/Models/Campus";
import { CampusXCompanyXUser } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompanyXUser";
import { Utils } from "../../../../shared/Utils/Utils";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { CampusXCompanyXUserServiceUtils } from "./Utils/CampusXCompanyXUserServiceUtils";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export const getCountCompanyUsers: APIGatewayProxyHandler = async (event, _context) => {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize json in Campus model and take the instance. 
    var requestedCampus: Campus = deserialize(requestBody, Campus);

    if (!requestedCampus.enoughInfoForReadOrDelete()) {
        return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampus.getReadAndDeleteExpectedBody());
    }

    //QUERY - params
    let paramsGetCampusUsers = CampusXCompanyXUserServiceUtils.paramsForQueryByCampusUsers(requestedCampus.CampusName, EntityStatus.ACTIVE);

    let dynamo = new DynamoDB.DocumentClient();

    try {
        const dataCampusUsers = await dynamo.queryGetAll(paramsGetCampusUsers);

        let response = dataCampusUsers
            .map(item => deserialize(item, CampusXCompanyXUser))
            .reduce(
                (acc, curr) => {
                    var key = curr["CompanyName"];
                    if (!acc[key]) { 
                        acc[key] = 0
                    }
                    acc[key] = acc[key] + 1;
                    return acc
                },
                {}
            );

        return Utils.getUniqueInstance().getDataResponse(response);
    } catch (error) {
        return Utils.getUniqueInstance().getErrorResponse(error, paramsGetCampusUsers);
    }
};