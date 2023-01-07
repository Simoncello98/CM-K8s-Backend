/*
  Created by Simone Scionti 

  provides a service to flag The CampusXCompanyxUser relationship record as deleted.
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { CampusXCompanyXUser } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompanyXUser";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyXUserServiceUtils } from "../Utils/CampusXCompanyXUserServiceUtils";


export async function setCampXCompXUsrAsDel(event: Request, res: Response) : Promise<void>  {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize
  var requestedCampusXCompanyXUser: CampusXCompanyXUser = deserialize(requestBody, CampusXCompanyXUser);

  if (!requestedCampusXCompanyXUser.isPKDefined()) { //if not is PK defined
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampusXCompanyXUser.getReadAndDeleteExpectedBody()));
  }

  //UPDATE
  requestedCampusXCompanyXUser.RelationshipStatus = EntityStatus.DELETED;

  let params = CampusXCompanyXUserServiceUtils.paramsToUpdateCampusXCompanyXUser(requestedCampusXCompanyXUser);
  let dynamo = new DynamoDB.DocumentClient();

  try {
    const response = await dynamo.update(params).promise();
    res.status(200).send(Utils.getUniqueInstance().getDataResponse(response));
  } catch (error) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
  }
};