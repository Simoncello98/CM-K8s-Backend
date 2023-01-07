/*
  Created by Simone Scionti 

  get All the relationships record CampusXCompanyXUser in wich appear a given user.
  Works for flagged as deleted records.

*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { User } from "../../../../shared/Models/User";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyXUserServiceUtils } from "../Utils/CampusXCompanyXUserServiceUtils";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export async function getUserDelParCompsCamps(event: Request, res: Response) : Promise<void>  {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize json in Company model and take the instance. 
  var requestedUser: User = deserialize(requestBody, User);

  if (!requestedUser.enoughInfoForReadOrDelete()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedUser.getReadAndDeleteExpectedBody()));
  }

  //QUERY
  let params = CampusXCompanyXUserServiceUtils.paramsForQueryByEmail(requestedUser.Email, EntityStatus.DELETED);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.queryGetAll(params);
    res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
  } catch (error) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
  }
};