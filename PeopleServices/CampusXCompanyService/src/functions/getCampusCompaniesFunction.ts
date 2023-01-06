/*
  Created by Simone Scionti 
  Get all the companies that are in a given Campus. it returns the relationships records. 

*/
'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { Campus } from "../../../../shared/Models/Campus";
import { deserialize } from "typescript-json-serializer";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyServiceUtils } from "../Utils/CampusXCompanyServiceUtils";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";


export const getCampusCompanies: APIGatewayProxyHandler = async (event, _context) => {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize json in Campus model and take the instance. 
  var requestedCampus: Campus = deserialize(requestBody, Campus);

  if (!requestedCampus.enoughInfoForReadOrDelete()) {
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampus.getReadAndDeleteExpectedBody());
  }

  //QUERY
  let params = CampusXCompanyServiceUtils.paramsForQueryForCampusCompanies(requestedCampus.CampusName, EntityStatus.ACTIVE);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.query(params).promise();
    return Utils.getUniqueInstance().getDataResponse(data.Items);
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, params);
  }
};
