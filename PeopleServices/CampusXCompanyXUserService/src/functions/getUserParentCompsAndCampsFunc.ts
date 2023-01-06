/*
  Created by Simone Scionti 

 get All the relationships record CampusXCompanyXUser in wich appear a given user.
  Works for flagged as deleted records.
*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { User } from "../../../../shared/Models/User";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { CampusXCompanyXUserServiceUtils } from "./Utils/CampusXCompanyXUserServiceUtils";
import { DynamoDB } from "aws-sdk";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export const getUserParentCompsAndCamps: APIGatewayProxyHandler = async (event, _context) => {
  
  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);
  
  //Deserialize json in Company model and take the instance. 
  var requestedUser: User = deserialize(requestBody, User);
  
  if (!requestedUser.enoughInfoForReadOrDelete()) {
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedUser.getReadAndDeleteExpectedBody());
  }

  //QUERY
  let params = CampusXCompanyXUserServiceUtils.paramsForQueryByEmail(requestedUser.Email, EntityStatus.ACTIVE);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.queryGetAll(params);
    return Utils.getUniqueInstance().getDataResponse(data);
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, params);
  }
};