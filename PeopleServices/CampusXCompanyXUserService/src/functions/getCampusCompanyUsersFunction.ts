
/*
  Created by Simone Scionti 
  
  
  return all users in a given company and a given campus 
  ( relationship record  ). 

*/
'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { CampusXCompany } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompany";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyXUserServiceUtils } from "../Utils/CampusXCompanyXUserServiceUtils";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export async function getCampusCompanyUsers(event: Request, res: Response) : Promise<void>  {
  
  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);
  
  //Deserialize
  var requestedCampusXCompany: CampusXCompany = deserialize(requestBody, CampusXCompany);
  
  if (!requestedCampusXCompany.enoughInfoForReadOrDelete()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampusXCompany.getReadAndDeleteExpectedBody()));
    return
  }

  //QUERY
  let params = CampusXCompanyXUserServiceUtils.paramsForQueryByCampusAndCompany(requestedCampusXCompany.CompanyName, requestedCampusXCompany.CampusName, EntityStatus.ACTIVE);
  
  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.queryGetAll(params);
    res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
    return
  } catch (error) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
    return
  }
};