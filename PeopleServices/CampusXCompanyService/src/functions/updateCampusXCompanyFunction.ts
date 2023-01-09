/*
  Created by Simone Scionti 

  Provides a service for updating information about the relationship between a Campus 
  and a Company, like the active services fot the company in that campus. 

  */

'use strict';


import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { CampusXCompany } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompany";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyServiceUtils } from "../Utils/CampusXCompanyServiceUtils";


export async function updateCampusXCompany(event: Request, res: Response) : Promise<void> {
  
  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);
  
  //Deserialize
  var campusXCompanyToUpdate: CampusXCompany = deserialize(requestBody, CampusXCompany);
  
  if (!campusXCompanyToUpdate.isPKDefined()) { //if not is PK defined
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, campusXCompanyToUpdate.getUpdateExpectedBody()));
    return
  }
  
  if (!campusXCompanyToUpdate.enoughInfoForUpdate()) {
    res.status(400).send(Utils.getUniqueInstance().getNothingToDoErrorResponse(requestBody, campusXCompanyToUpdate.getUpdateExpectedBody()));
    return
  }

  //UPDATE
  let params = CampusXCompanyServiceUtils.paramsToUpdateCampusXCompany(campusXCompanyToUpdate);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.update(params).promise();
    res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
    return
  } catch (error) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
    return
  }
};

