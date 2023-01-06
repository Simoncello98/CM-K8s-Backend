/*
  Created by Simone Scionti 
  Return all the users of a given company (in all campuses in wich is the company). 


*/
'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { DynamoDB, CognitoIdentityServiceProvider } from "aws-sdk";
import { Campus } from "../../../../shared/Models/Campus";
import { CampusXCompanyXUserServiceUtils } from "./Utils/CampusXCompanyXUserServiceUtils";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export const getCompanyUsers: APIGatewayProxyHandler = async (event, _context) => {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize
  let requestedCampus: Campus = deserialize(requestBody, Campus);

  if (!requestedCampus.enoughInfoForReadOrDelete()) {
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampus.getReadAndDeleteExpectedBody());
  }

  //GET - email from signature
  let cognito = new CognitoIdentityServiceProvider();
  let email = await Utils.getUniqueInstance().getEmailFromSignature(event.requestContext.identity.cognitoAuthenticationProvider, cognito);

  //GET - list of Companies
  let dynamo = new DynamoDB.DocumentClient();
  let companiesAdminItems = await Utils.getUniqueInstance().getMyListOfCompanies(email, requestedCampus.CampusName, dynamo);

  //QUERY all User
  var listOfUser: DynamoDB.DocumentClient.ItemList = [];

  for (let rel of companiesAdminItems) {
    let params = CampusXCompanyXUserServiceUtils.paramsForQueryByCompany(rel.CompanyName, EntityStatus.ACTIVE);

    try {
      const data = await dynamo.queryGetAll(params);
      listOfUser = listOfUser.concat(data);
    } catch (error) {
      return Utils.getUniqueInstance().getErrorResponse(error, params);
    }

  }

  return Utils.getUniqueInstance().getDataResponse(listOfUser);
};