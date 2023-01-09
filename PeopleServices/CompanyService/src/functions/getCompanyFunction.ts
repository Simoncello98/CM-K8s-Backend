/*
  Created by Simone Scionti 
  Return a company specifying its Primary Key. 

*/
'use strict';

import { Utils } from "../../../../shared/Utils/Utils";
import { Company } from "../../../../shared/Models/Company";
import { deserialize } from "typescript-json-serializer";
import { DynamoDB } from "aws-sdk";
import { CompanyServiceUtils } from "../Utils/CompanyServiceUtils";
import { Request, Response } from "express";


export async function getCompany(event: Request, res: Response) : Promise<void> {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize 
  let requestedCompany: Company = deserialize(requestBody, Company);

  if (!requestedCompany.enoughInfoForReadOrDelete()) {
    res.status(500).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCompany.getReadAndDeleteExpectedBody()));
    return
  }

  //GET
  let params = CompanyServiceUtils.paramsToGetCompany(requestedCompany.CompanyName);

  var dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.get(params).promise();
    res.send(Utils.getUniqueInstance().getDataResponse(data.Item));
  } catch (error) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
  }
};

