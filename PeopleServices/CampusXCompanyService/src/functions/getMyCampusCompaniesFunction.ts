/*
  Created by Simone Scionti
*/

'use strict';
import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { Campus } from "../../../../shared/Models/Campus";
import { deserialize } from "typescript-json-serializer";
import { CognitoIdentityServiceProvider, DynamoDB } from "aws-sdk";
import { CampusXCompanyServiceUtils } from "../Utils/CampusXCompanyServiceUtils";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";


export async function getMyCampusCompanies(event: Request, res: Response) : Promise<void> {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize 
    var requestedCampus: Campus = deserialize(requestBody, Campus);

    if (!requestedCampus.enoughInfoForReadOrDelete()) {
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampus.getReadAndDeleteExpectedBody()));
        return
    }

    //Get email CompanyAdmin
    let cognito = new CognitoIdentityServiceProvider();
    let emailCompanyAdmin = await Utils.getUniqueInstance().getEmailFromSignature(event.get("JWTAuthorization"), cognito);

    //Get list of my companies
    let dynamo = new DynamoDB.DocumentClient();
    let companyAdminItems = await Utils.getUniqueInstance().getMyListOfCompanies(emailCompanyAdmin, requestedCampus.CampusName, dynamo);

    //QUERY
    let params = CampusXCompanyServiceUtils.paramsForQueryForCampusCompanies(requestedCampus.CampusName, EntityStatus.ACTIVE);

    try {
        const data = await dynamo.query(params).promise();

        var listOfRels: DynamoDB.DocumentClient.ItemList = [];
        for (let company of companyAdminItems) {
            for (var i = 0; i < data.Items.length; i++) {
                if (company.CompanyName === data.Items[i].CompanyName) {
                    listOfRels.push(data.Items[i]);
                    i = data.Items.length;
                }
            }
        }
        res.status(200).send(Utils.getUniqueInstance().getDataResponse(listOfRels));
        return
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
        return
    }
};
