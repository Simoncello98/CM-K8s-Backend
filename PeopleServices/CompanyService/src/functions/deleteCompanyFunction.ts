/*
  Created by Simone Scionti 

  Not used in production. We use setAsDeleted functions. 
*/

'use strict';

import { Utils } from "../../../../shared/Utils/Utils";
import { Company } from "../../../../shared/Models/Company";
import { deserialize } from "typescript-json-serializer";
import { DynamoDB } from "aws-sdk";
import { CompanyServiceUtils } from "../Utils/CompanyServiceUtils";
import { Request, Response } from "express";


export async function deleteCompany(event: Request, res: Response) : Promise<void> {
  
  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);
  
  //Deserialize 
  let companyToDelete: Company = deserialize(requestBody, Company);
  
  if (!companyToDelete.enoughInfoForReadOrDelete()) {
    res.send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, companyToDelete.getReadAndDeleteExpectedBody()));
  }
  
  //DELETE
  let params = CompanyServiceUtils.paramsToDeleteCompany(companyToDelete);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.delete(params).promise();
    res.send(Utils.getUniqueInstance().getDataResponse(data.Attributes));
  } catch (error) {
    res.send(Utils.getUniqueInstance().getErrorResponse(error, params));
  }
};