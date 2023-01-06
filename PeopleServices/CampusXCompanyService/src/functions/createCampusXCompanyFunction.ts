/*
  Created by Simone Scionti 
  
  Create the Relatioship record between a Campus and a Company, specifying all the relatioship attributes
  
  So it means that it inserts a company in a Campus. 

  All the attributes except Primary Key are just in this relationship and not in the Company or Campus Info, so we have to ask for them to the client. 
  See CampusXCompany model and AvailableSerrvice for instance. 

  The client has to be careful passing parameters because it does not check if a Campus exists, so the CampusName must 
  be correct, otherwise the relationships will be not consistent.

*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { CampusXCompany } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompany";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyServiceUtils } from "../Utils/CampusXCompanyServiceUtils";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";


export const createCampusXCompany: APIGatewayProxyHandler = async (event, _context) => {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize
  let newCampusXCompany: CampusXCompany = deserialize(requestBody, CampusXCompany);

  if (!newCampusXCompany.enoughInfoForCreate()) {
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, newCampusXCompany.getCreateExpectedBody());
  }

  let dynamo = new DynamoDB.DocumentClient();

  let paramsGetRelationship = CampusXCompanyServiceUtils.paramsToGetCampusXCompany(newCampusXCompany.CampusName, newCampusXCompany.CompanyName);
  let flagDeleted: boolean = false;
  try {
    const data = await dynamo.get(paramsGetRelationship).promise();
    if (data.Item) {
      let rel = deserialize(data.Item, CampusXCompany);
      flagDeleted = rel.RelationshipStatus === EntityStatus.DELETED;
    }
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, paramsGetRelationship);
  }

  //PUT
  newCampusXCompany.createGSIAttributes();
  newCampusXCompany.autoFillUndefinedImportantAttributes();

  let params = flagDeleted ? CampusXCompanyServiceUtils.paramsToOverwriteDeletedCampusXCompany(newCampusXCompany) : CampusXCompanyServiceUtils.paramsToCreateCampusXCompany(newCampusXCompany);

  try {
    const data = await dynamo.put(params).promise();
    return Utils.getUniqueInstance().getDataResponse(data);
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, params);
  }
};