
/*
  Created by Simone Scionti 
  
  
  return all users in a given company and a given campus 
  ( relationship record  ). 

*/
'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { CampusXCompany } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompany";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyXUserServiceUtils } from "./Utils/CampusXCompanyXUserServiceUtils";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export const getCampusCompanyUsers: APIGatewayProxyHandler = async (event, _context) => {
  
  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);
  
  //Deserialize
  var requestedCampusXCompany: CampusXCompany = deserialize(requestBody, CampusXCompany);
  
  if (!requestedCampusXCompany.enoughInfoForReadOrDelete()) {
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampusXCompany.getReadAndDeleteExpectedBody());
  }

  //QUERY
  let params = CampusXCompanyXUserServiceUtils.paramsForQueryByCampusAndCompany(requestedCampusXCompany.CompanyName, requestedCampusXCompany.CampusName, EntityStatus.ACTIVE);
  
  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.queryGetAll(params);
    return Utils.getUniqueInstance().getDataResponse(data);
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, params);
  }
};