/*
  Created by Simone Scionti 

  delete a specified User#X#Company  Relatioship record.

  Not used in production. We use setAsDeleted functions

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

  //DELETE
  let params = CampusXCompanyXUserServiceUtils.paramsToDeleteCampusXCompanyXUser(requestedCampusXCompanyXUser);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.delete(params).promise();
    return Utils.getUniqueInstance().getDataResponse(data.Attributes);
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, params);
  }
};