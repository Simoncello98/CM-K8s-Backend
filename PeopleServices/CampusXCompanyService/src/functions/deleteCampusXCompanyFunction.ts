/*
  Created by Simone Scionti 
  NOT used in production. we use setAsDeleted functions.
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { CampusXCompany } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompany";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyServiceUtils } from "../Utils/CampusXCompanyServiceUtils";


export async function deleteCampusXCompany(event: Request, res: Response) : Promise<void> {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize json in Company model and take the instance. 
  let campusXCompanyToDelete: CampusXCompany = deserialize(requestBody, CampusXCompany);

  if (!campusXCompanyToDelete.enoughInfoForReadOrDelete()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, campusXCompanyToDelete.getReadAndDeleteExpectedBody()));
  }

  //DELETE
  let params = CampusXCompanyServiceUtils.paramsToDeleteCampusXCompany(campusXCompanyToDelete);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.delete(params).promise();
    res.status(200).send(Utils.getUniqueInstance().getDataResponse(data.Attributes));
  } catch (error) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
  }
};
