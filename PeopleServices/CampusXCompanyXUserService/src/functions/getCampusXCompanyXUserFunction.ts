/*
  Created by Simone Scionti 

  get a specified User#X#Company relatioship record 
  with all the relationship attributes like CompanyEmailAlias or CompanyRole

*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { CampusXCompanyXUser } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompanyXUser";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyXUserServiceUtils } from "./Utils/CampusXCompanyXUserServiceUtils";


export const getCampusXCompanyXUser: APIGatewayProxyHandler = async (event, _context) => {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize
  let requestedCampusXCompanyXUser: CampusXCompanyXUser = deserialize(requestBody, CampusXCompanyXUser);

  if (!requestedCampusXCompanyXUser.enoughInfoForReadOrDelete()) {
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampusXCompanyXUser.getReadAndDeleteExpectedBody());
  }

  //GET
  let params = CampusXCompanyXUserServiceUtils.paramsToGetCampusXCompanyXUser(requestedCampusXCompanyXUser.CampusName, requestedCampusXCompanyXUser.CompanyName, requestedCampusXCompanyXUser.Email);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.get(params).promise();
    return Utils.getUniqueInstance().getDataResponse(data.Item);
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, params);
  }
};