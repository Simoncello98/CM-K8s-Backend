/*
  Created by Simone Scionti 

  get a specified User#X#Company relatioship record 
  with all the relationship attributes like CompanyEmailAlias or CompanyRole

*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { CampusXCompanyXUser } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompanyXUser";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyXUserServiceUtils } from "../Utils/CampusXCompanyXUserServiceUtils";


export async function getCampusXCompanyXUser(event: Request, res: Response) : Promise<void>  {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize
  let requestedCampusXCompanyXUser: CampusXCompanyXUser = deserialize(requestBody, CampusXCompanyXUser);

  if (!requestedCampusXCompanyXUser.enoughInfoForReadOrDelete()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampusXCompanyXUser.getReadAndDeleteExpectedBody()));
  }

  //GET
  let params = CampusXCompanyXUserServiceUtils.paramsToGetCampusXCompanyXUser(requestedCampusXCompanyXUser.CampusName, requestedCampusXCompanyXUser.CompanyName, requestedCampusXCompanyXUser.Email);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.get(params).promise();
    res.status(200).send(Utils.getUniqueInstance().getDataResponse(data.Item));
  } catch (error) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
  }
};