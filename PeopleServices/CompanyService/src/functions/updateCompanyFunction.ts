/*
  Created by Simone Scionti 

  Update the Company_INFO record in the DB. 

  -- It might be useful to do an utility to recover deleted relationships and eccetera that allows the admin to select what to recover to Active.
*/

'use strict';


import { Utils } from "../../../../shared/Utils/Utils";
import { Company } from "../../../../shared/Models/Company";
import { deserialize } from "typescript-json-serializer";
import { DynamoDB } from "aws-sdk";
import { CompanyServiceUtils } from "../Utils/CompanyServiceUtils";
import { Request, Response } from "express";


export async function updateCompany(event: Request, res: Response) : Promise<void> {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize 
  let companyToUpdate: Company = deserialize(requestBody, Company);

  if (!companyToUpdate.isPKDefined()) { //if not is PK defined
    res.status(403).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, companyToUpdate.getUpdateExpectedBody()));
  }

  if (!companyToUpdate.enoughInfoForUpdate()) {
    res.status(403).send(Utils.getUniqueInstance().getNothingToDoErrorResponse(requestBody, companyToUpdate.getUpdateExpectedBody()));
  }

  //UPDATE
  let params = CompanyServiceUtils.paramsToUpdateCompany(companyToUpdate);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.update(params).promise();
    res.send(Utils.getUniqueInstance().getDataResponse(data));
  } catch (error) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
  }
};

