/*
  Created by Simone Scionti 

  Provides a service for updating information about the relationship between a Campus 
  and a Company, like the active services fot the company in that campus. 

  */

'use strict';


import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { CampusXCompany } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompany";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyServiceUtils } from "../Utils/CampusXCompanyServiceUtils";


export const updateCampusXCompany: APIGatewayProxyHandler = async (event, _context) => {
  
  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);
  
  //Deserialize
  var campusXCompanyToUpdate: CampusXCompany = deserialize(requestBody, CampusXCompany);
  
  if (!campusXCompanyToUpdate.isPKDefined()) { //if not is PK defined
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, campusXCompanyToUpdate.getUpdateExpectedBody());
  }
  
  if (!campusXCompanyToUpdate.enoughInfoForUpdate()) {
    return Utils.getUniqueInstance().getNothingToDoErrorResponse(requestBody, campusXCompanyToUpdate.getUpdateExpectedBody());
  }

  //UPDATE
  let params = CampusXCompanyServiceUtils.paramsToUpdateCampusXCompany(campusXCompanyToUpdate);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.update(params).promise();
    return Utils.getUniqueInstance().getDataResponse(data);
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, params);
  }
};

