/*
  Created by Simone Scionti
*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { Campus } from "../../../../shared/Models/Campus";
import { deserialize } from "typescript-json-serializer";
import { CognitoIdentityServiceProvider, DynamoDB } from "aws-sdk";
import { CampusXCompanyServiceUtils } from "../Utils/CampusXCompanyServiceUtils";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";


export const getMyCampusCompanies: APIGatewayProxyHandler = async (event, _context) => {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

    //Deserialize 
    var requestedCampus: Campus = deserialize(requestBody, Campus);

    if (!requestedCampus.enoughInfoForReadOrDelete()) {
        return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampus.getReadAndDeleteExpectedBody());
    }

    //Get email CompanyAdmin
    let cognito = new CognitoIdentityServiceProvider();
    let emailCompanyAdmin = await Utils.getUniqueInstance().getEmailFromSignature(event.requestContext.identity.cognitoAuthenticationProvider, cognito);

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
        return Utils.getUniqueInstance().getDataResponse(listOfRels);
    } catch (error) {
        return Utils.getUniqueInstance().getErrorResponse(error, params);
    }
};
