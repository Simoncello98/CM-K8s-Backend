/*
  Created by Simone Scionti 
  Get all the deleted companies that are in a given Campus. it returns the relationships records. 
*/
'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { Campus } from "../../../../shared/Models/Campus";
import { deserialize } from "typescript-json-serializer";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyServiceUtils } from "../Utils/CampusXCompanyServiceUtils";


export async function getCampusDeletedCompanies(event: Request, res: Response) : Promise<void> {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize
  var requestedCampus: Campus = deserialize(requestBody, Campus);

  if (!requestedCampus.enoughInfoForReadOrDelete()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampus.getReadAndDeleteExpectedBody()));
    return
  }

  //QUERY
  const params = CampusXCompanyServiceUtils.paramsForQueryForCampusCompanies(requestedCampus.CampusName, EntityStatus.DELETED);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.query(params).promise();
    res.status(200).send(Utils.getUniqueInstance().getDataResponse(data.Items));
    return
  } catch (error) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
    return
  }
};