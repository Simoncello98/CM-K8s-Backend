/*
  Created by Simone Scionti
*/
'use strict';

import { Request, Response } from "express";
import { DynamoDB } from "aws-sdk";
import { deserialize } from "typescript-json-serializer";
import { Campus } from "../../../../shared/Models/Campus";
import { CampusXCompanyXUser } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompanyXUser";
import { Utils } from "../../../../shared/Utils/Utils";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { CampusXCompanyXUserServiceUtils } from "../Utils/CampusXCompanyXUserServiceUtils";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export async function getCountCompanyUsers(event: Request, res: Response) : Promise<void>  {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize json in Campus model and take the instance. 
    var requestedCampus: Campus = deserialize(requestBody, Campus);

    if (!requestedCampus.enoughInfoForReadOrDelete()) {
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampus.getReadAndDeleteExpectedBody()));
        return
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

        res.status(200).send(Utils.getUniqueInstance().getDataResponse(response));
        return
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, paramsGetCampusUsers));
        return
    }
};