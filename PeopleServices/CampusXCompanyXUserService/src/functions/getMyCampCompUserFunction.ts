
/*
  Created by Simone Scionti 

  return all users in a given company and a given campus that were flagged as deleted 
  ( relationship record flagged as deleted ). 

*/
'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { CognitoIdentityServiceProvider, DynamoDB } from "aws-sdk";
import { Campus } from "../../../../shared/Models/Campus";
import { CampusXCompanyXUserServiceUtils } from "../Utils/CampusXCompanyXUserServiceUtils";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export async function getMyCampCompUser(event: Request, res: Response) : Promise<void>  {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize json in Company model and take the instance. 
  let requestedCampus: Campus = deserialize(requestBody, Campus);

  if (!requestedCampus.enoughInfoForReadOrDelete()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampus.getReadAndDeleteExpectedBody()));
  }

  //GET - email from signature
  let cognito = new CognitoIdentityServiceProvider();
  let email = await Utils.getUniqueInstance().getEmailFromSignature(event.requestContext.identity.cognitoAuthenticationProvider, cognito);

  //QUERY
  let params = CampusXCompanyXUserServiceUtils.paramsForQueryByCampusAndEmailWithStatus(requestedCampus.CampusName, email, EntityStatus.ACTIVE);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.queryGetAll(params);
    res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
  } catch (error) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
  }
};