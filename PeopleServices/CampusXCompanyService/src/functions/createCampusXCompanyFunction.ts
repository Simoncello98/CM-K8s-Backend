/*
  Created by Simone Scionti 
  
  Create the Relatioship record between a Campus and a Company, specifying all the relatioship attributes
  
  So it means that it inserts a company in a Campus. 

  All the attributes except Primary Key are just in this relationship and not in the Company or Campus Info, so we have to ask for them to the client. 
  See CampusXCompany model and AvailableSerrvice for instance. 

  The client has to be careful passing parameters because it does not check if a Campus exists, so the CampusName must 
  be correct, otherwise the relationships will be not consistent.

*/

'use strict';


import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { CampusXCompany } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompany";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyServiceUtils } from "../Utils/CampusXCompanyServiceUtils";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { Request, Response } from "express";


export async function createCampusXCompany(event: Request, res: Response) : Promise<void> {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize
  let newCampusXCompany: CampusXCompany = deserialize(requestBody, CampusXCompany);

  if (!newCampusXCompany.enoughInfoForCreate()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, newCampusXCompany.getCreateExpectedBody()));
    return
  }

  let dynamo = new DynamoDB.DocumentClient();

  let paramsGetRelationship = CampusXCompanyServiceUtils.paramsToGetCampusXCompany(newCampusXCompany.CampusName, newCampusXCompany.CompanyName);
  let flagDeleted: boolean = false;
  try {
    const data = await dynamo.get(paramsGetRelationship).promise();
    if (data.Item) {
      let rel = deserialize(data.Item, CampusXCompany);
      flagDeleted = rel.RelationshipStatus === EntityStatus.DELETED;
    }
  } catch (error) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, paramsGetRelationship));
    return
  }

  //PUT
  newCampusXCompany.createGSIAttributes();
  newCampusXCompany.autoFillUndefinedImportantAttributes();

  let params = flagDeleted ? CampusXCompanyServiceUtils.paramsToOverwriteDeletedCampusXCompany(newCampusXCompany) : CampusXCompanyServiceUtils.paramsToCreateCampusXCompany(newCampusXCompany);

  try {
    const data = await dynamo.put(params).promise();
    res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
    return
  } catch (error) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
    return
  }
};