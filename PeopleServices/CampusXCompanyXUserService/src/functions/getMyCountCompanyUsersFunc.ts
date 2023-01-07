/*
  Created by Simone Scionti
*/
'use strict';

import { Request, Response } from "express";
import { CognitoIdentityServiceProvider, DynamoDB } from "aws-sdk";
import { deserialize } from "typescript-json-serializer";
import { Campus } from "../../../../shared/Models/Campus";
import { CampusXCompanyXUser } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompanyXUser";
import { Utils } from "../../../../shared/Utils/Utils";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { CampusXCompanyXUserServiceUtils } from "../Utils/CampusXCompanyXUserServiceUtils";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export async function getMyCountCompanyUsers(event: Request, res: Response) : Promise<void>  {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize json in Campus model and take the instance. 
    var requestedCampus: Campus = deserialize(requestBody, Campus);

    if (!requestedCampus.enoughInfoForReadOrDelete()) {
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampus.getReadAndDeleteExpectedBody()));
    }

    let dynamo = new DynamoDB.DocumentClient();

    //Get email CompanyAdmin
    let cognito = new CognitoIdentityServiceProvider();
    let emailCompanyAdmin = await Utils.getUniqueInstance().getEmailFromSignature(event.requestContext.identity.cognitoAuthenticationProvider, cognito);

    //Get list of my companies
    let companyAdminItems = await Utils.getUniqueInstance().getMyListOfCompanies(emailCompanyAdmin, requestedCampus.CampusName, dynamo);
    
    try {
        let response = {}
        let datas: DynamoDB.DocumentClient.ItemList = [];
        const companies = companyAdminItems.map(item => "" + item.CompanyName)

        for (let companyName of companies) {
            //QUERY - params
            let paramsGetCampusUsers = CampusXCompanyXUserServiceUtils.paramsForQueryByCampusUsersByCompany(requestedCampus.CampusName, companyName, EntityStatus.ACTIVE);
            const dataCompanyUsers = await dynamo.queryGetAll(paramsGetCampusUsers);

            datas.push(...dataCompanyUsers);
        }


        response = datas
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
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, requestedCampus));
    }
};