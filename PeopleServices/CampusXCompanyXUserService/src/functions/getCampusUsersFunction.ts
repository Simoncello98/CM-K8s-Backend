/*
  Created by Simone Scionti 

  Return all campus user related with the company in wich they are , so we will have duplicated 
  user records in case of the same user in more companies of the given campus, but the company 
  will be different in each record for sure. 
*/
'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { Campus } from "../../../../shared/Models/Campus";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyXUserServiceUtils } from "./Utils/CampusXCompanyXUserServiceUtils";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export const getCampusUsers: APIGatewayProxyHandler = async (event, _context) => {
  
  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);
  
  //Deserialize json in Company model and take the instance. 
  var requestedCampus: Campus = deserialize(requestBody, Campus);
  
  if (!requestedCampus.enoughInfoForReadOrDelete()) {
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampus.getReadAndDeleteExpectedBody());
  }

  //QUERY
  let params = CampusXCompanyXUserServiceUtils.paramsForQueryByCampus(requestedCampus.CampusName, EntityStatus.ACTIVE);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.queryGetAll(params);
    return Utils.getUniqueInstance().getDataResponse(data);
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, params);
  }
};