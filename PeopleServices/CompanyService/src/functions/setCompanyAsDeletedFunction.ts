/*
  Created by Simone Scionti 

  provides a service for flag The COMPANY_info record as deleted and all his relationship records. 
  It uses a transaction to update all the relationships record in wich the company appears ( CampusXCompany - CampusXCompanyXUser)

  NB.
  It's the worst case because it uses 2 queries for all relationships and one transaction for updating all. 

*/

'use strict';

import { Utils } from "../../../../shared/Utils/Utils";
import { Company } from "../../../../shared/Models/Company";
import { deserialize } from "typescript-json-serializer";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { CompanyConsistentUpdateManager } from "../shared/CompanyConsistentUpdateManager";
import { Request, Response } from "express";


export async function setCompanyAsDeleted(event: Request, res : Response) : Promise<void> {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize json in Company model and take the instance. 
  var companyToUpdate: Company = deserialize(requestBody, Company);

  if (!companyToUpdate.isPKDefined()) { //if not is PK defined
    res.status(500).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, companyToUpdate.getReadAndDeleteExpectedBody()));
  }

  companyToUpdate.CompanyStatus = EntityStatus.DELETED;
  let rels = await CompanyConsistentUpdateManager.getUniqueInstance().getRels(companyToUpdate);

  //the schema defined works as a bridge between two different models for different Attributes Names.
  let updateSchema = {
    CompanyStatus: "RelationshipStatus"
  }
  let updateObjects = CompanyConsistentUpdateManager.getUniqueInstance().getUpdateObjects(rels, companyToUpdate, updateSchema);  
  let data = await CompanyConsistentUpdateManager.getUniqueInstance().transactUpdateRels(updateObjects);

  res.send(Utils.getUniqueInstance().getDataResponse(data));
};

