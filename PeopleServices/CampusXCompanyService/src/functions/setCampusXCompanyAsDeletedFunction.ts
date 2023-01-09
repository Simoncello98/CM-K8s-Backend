/*
  Created by Simone Scionti 

  provides a service for flag The CampusXCompany relationship record as deleted.
  Uses a transaction to flag as deleted all users in that campus and that company.

  */

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { CampusXCompany } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompany";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { CampusXCompanyConsistentUpdateManager } from "../shared/CampusXCompanyConsistentUpdateManager";


export async function setCampusXCompanyAsDeleted(event: Request, res: Response) : Promise<void> {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize json in Company model and take the instance. 
  var campusXCompanyToUpdate: CampusXCompany = deserialize(requestBody, CampusXCompany);

  if (!campusXCompanyToUpdate.isPKDefined()) { //if not is PK defined
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, campusXCompanyToUpdate.getReadAndDeleteExpectedBody()));
    return
  }

  campusXCompanyToUpdate.RelationshipStatus = EntityStatus.DELETED;
  let rels = await CampusXCompanyConsistentUpdateManager.getUniqueInstance().getRels(campusXCompanyToUpdate);
  
  //the schema defined works as a bridge between two different models for different Attributes Names.

  /*we can also don't pass any schema, and pass false, nbut passing a schema is more secure because
  if in the future we will have attributes with same names in CampusXCompany record and CampusXCompanyXUser 
  record, we will consider only the RelationshipStatus attribute. Passing false as updateSchema means to link 
  all attributes with same names in the two records.*/

  let updateSchema = {
    RelationshipStatus: "RelationshipStatus"
  }
  let updateObjects = CampusXCompanyConsistentUpdateManager.getUniqueInstance().getUpdateObjects(rels, campusXCompanyToUpdate, updateSchema);
  let data = await CampusXCompanyConsistentUpdateManager.getUniqueInstance().transactUpdateRels(updateObjects);

  res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
  return
};

