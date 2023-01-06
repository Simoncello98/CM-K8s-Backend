/*
  Created by Simone Scionti 
  NOT used in production. we use setAsDeleted functions.
*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { CampusXCompany } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompany";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyServiceUtils } from "../Utils/CampusXCompanyServiceUtils";


export const deleteCampusXCompany: APIGatewayProxyHandler = async (event, _context) => {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize json in Company model and take the instance. 
  let campusXCompanyToDelete: CampusXCompany = deserialize(requestBody, CampusXCompany);

  if (!campusXCompanyToDelete.enoughInfoForReadOrDelete()) {
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, campusXCompanyToDelete.getReadAndDeleteExpectedBody());
  }

  //DELETE
  let params = CampusXCompanyServiceUtils.paramsToDeleteCampusXCompany(campusXCompanyToDelete);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.delete(params).promise();
    return Utils.getUniqueInstance().getDataResponse(data.Attributes);
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, params);
  }
};
