/*
  Created by Simone Scionti 

  Get all the Campuses in which there is a given Company.
  It returns the relationship records.

*/
'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { Company } from "../../../../shared/Models/Company";
import { deserialize } from "typescript-json-serializer";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyServiceUtils } from "../Utils/CampusXCompanyServiceUtils";


export const getCompanyParentCampuses: APIGatewayProxyHandler = async (event, _context) => {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize
  var requestedCompany: Company = deserialize(requestBody, Company);

  if (!requestedCompany.enoughInfoForReadOrDelete()) {
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCompany.getReadAndDeleteExpectedBody());
  }

  //QUERY
  let params = CampusXCompanyServiceUtils.paramsForQueryForCompanyParentCampuses(requestedCompany.CompanyName, EntityStatus.ACTIVE);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.query(params).promise();
    return Utils.getUniqueInstance().getDataResponse(data.Items);
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, params);
  }
};
