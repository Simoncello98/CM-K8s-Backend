/*
  Created by Simone Scionti 

  Return all campus user related with the company in wich they are , so we will have duplicated 
  user records in case of the same user in more companies of the given campus, but the company 
  will be different in each record for sure. 
*/
'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { Campus } from "../../../../shared/Models/Campus";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyXUserServiceUtils } from "../Utils/CampusXCompanyXUserServiceUtils";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export async function getCampusUsers(event: Request, res: Response) : Promise<void>  {
  
  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);
  
  //Deserialize json in Company model and take the instance. 
  var requestedCampus: Campus = deserialize(requestBody, Campus);
  
  if (!requestedCampus.enoughInfoForReadOrDelete()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampus.getReadAndDeleteExpectedBody()));
  }

  //QUERY
  let params = CampusXCompanyXUserServiceUtils.paramsForQueryByCampus(requestedCampus.CampusName, EntityStatus.ACTIVE);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.queryGetAll(params);
    res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
  } catch (error) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
  }
};