/*
  Created by Simone Scionti 
  Get a campus - company relationship record. 
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { CampusXCompany } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompany";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyServiceUtils } from "../Utils/CampusXCompanyServiceUtils";


export async function getCampusXCompany(event: Request, res: Response) : Promise<void> {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize json in Company model and take the instance. 
  var requestedCampusXCompany: CampusXCompany = deserialize(requestBody, CampusXCompany);

  if (!requestedCampusXCompany.enoughInfoForReadOrDelete()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampusXCompany.getReadAndDeleteExpectedBody()));
  }

  //GET
  let params = CampusXCompanyServiceUtils.paramsToGetCampusXCompany(requestedCampusXCompany.CampusName, requestedCampusXCompany.CompanyName);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.get(params).promise();
    res.status(200).send(Utils.getUniqueInstance().getDataResponse(data.Item));
  } catch (error) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
  }
};