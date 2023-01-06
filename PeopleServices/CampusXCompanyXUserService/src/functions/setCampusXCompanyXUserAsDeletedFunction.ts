/*
  Created by Simone Scionti 

  provides a service to flag The CampusXCompanyxUser relationship record as deleted.
*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { CampusXCompanyXUser } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompanyXUser";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyXUserServiceUtils } from "./Utils/CampusXCompanyXUserServiceUtils";


export const setCampXCompXUsrAsDel: APIGatewayProxyHandler = async (event, _context) => {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize
  var requestedCampusXCompanyXUser: CampusXCompanyXUser = deserialize(requestBody, CampusXCompanyXUser);

  if (!requestedCampusXCompanyXUser.isPKDefined()) { //if not is PK defined
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampusXCompanyXUser.getReadAndDeleteExpectedBody());
  }

  //UPDATE
  requestedCampusXCompanyXUser.RelationshipStatus = EntityStatus.DELETED;

  let params = CampusXCompanyXUserServiceUtils.paramsToUpdateCampusXCompanyXUser(requestedCampusXCompanyXUser);
  let dynamo = new DynamoDB.DocumentClient();

  try {
    const response = await dynamo.update(params).promise();
    return Utils.getUniqueInstance().getDataResponse(response);
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, params);
  }
};