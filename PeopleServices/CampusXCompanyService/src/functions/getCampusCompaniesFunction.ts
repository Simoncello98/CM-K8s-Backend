/*
  Created by Simone Scionti 
  Get all the companies that are in a given Campus. it returns the relationships records. 

*/
'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { Campus } from "../../../../shared/Models/Campus";
import { deserialize } from "typescript-json-serializer";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyServiceUtils } from "../Utils/CampusXCompanyServiceUtils";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";


export async function getCampusCompanies(event: Request, res: Response) : Promise<void> {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize json in Campus model and take the instance. 
  var requestedCampus: Campus = deserialize(requestBody, Campus);

  if (!requestedCampus.enoughInfoForReadOrDelete()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampus.getReadAndDeleteExpectedBody()));
    return
  }

  //QUERY
  let params = CampusXCompanyServiceUtils.paramsForQueryForCampusCompanies(requestedCampus.CampusName, EntityStatus.ACTIVE);

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
