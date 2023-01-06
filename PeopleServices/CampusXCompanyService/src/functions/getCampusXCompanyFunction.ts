/*
  Created by Simone Scionti 
  Get a campus - company relationship record. 
*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { CampusXCompany } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompany";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyServiceUtils } from "../Utils/CampusXCompanyServiceUtils";


export const getCampusXCompany: APIGatewayProxyHandler = async (event, _context) => {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize json in Company model and take the instance. 
  var requestedCampusXCompany: CampusXCompany = deserialize(requestBody, CampusXCompany);

  if (!requestedCampusXCompany.enoughInfoForReadOrDelete()) {
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampusXCompany.getReadAndDeleteExpectedBody());
  }

  //GET
  let params = CampusXCompanyServiceUtils.paramsToGetCampusXCompany(requestedCampusXCompany.CampusName, requestedCampusXCompany.CompanyName);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.get(params).promise();
    return Utils.getUniqueInstance().getDataResponse(data.Item);
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, params);
  }
};