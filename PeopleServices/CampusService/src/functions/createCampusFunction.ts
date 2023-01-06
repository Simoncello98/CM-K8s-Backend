/*
  Created by Simone Scionti 

  Provide a service to create a Campus info record.


//interaction diagram per i flussi di dati 

*/
'use strict';

import { Utils } from "../../../../shared/Utils/Utils";
import { Campus } from "../../../../shared/Models/Campus";
import { deserialize } from "typescript-json-serializer";
import { DynamoDB } from "aws-sdk";
import { CampusServiceUtils } from "../Utils/CampusServiceUtils";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { Request, Response } from "express";

export async function createCampus(event: Request, res: Response) : Promise<void> {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize
  let requestedCampus: Campus = deserialize(requestBody, Campus);

  if (!requestedCampus.enoughInfoForCreate()) {
    res.send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampus.getCreateExpectedBody()));
  }
  
  let dynamo = new DynamoDB.DocumentClient();

  let paramsGetRelationship = CampusServiceUtils.paramsToGetCampus(requestedCampus.CampusName);
  let flagDeleted: boolean = false;
  try {
    const data = await dynamo.get(paramsGetRelationship).promise();
    if (data.Item) {
      let record = deserialize(data.Item, Campus);
      flagDeleted = record.CampusStatus === EntityStatus.DELETED;
    }
  } catch (error) {
    res.send(Utils.getUniqueInstance().getErrorResponse(error, paramsGetRelationship));
  }

  //PUT
  requestedCampus.autoFillUndefinedImportantAttributes();

  let params = flagDeleted ? CampusServiceUtils.paramsToOverwriteDeletedCampus(requestedCampus) : CampusServiceUtils.paramsToCreateCampus(requestedCampus);

  try {
    const data = await dynamo.put(params).promise();
    res.send(Utils.getUniqueInstance().getDataResponse(data));
  } catch (error) {
    res.send(Utils.getUniqueInstance().getErrorResponse(error, params));
  }
};
