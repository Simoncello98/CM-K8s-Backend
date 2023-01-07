/*
  Created by Simone Scionti 

  Get all the Campuses in which there is a given Company.
  It returns the relationship records.

*/
'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { Company } from "../../../../shared/Models/Company";
import { deserialize } from "typescript-json-serializer";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyServiceUtils } from "../Utils/CampusXCompanyServiceUtils";


export async function getCompanyParentCampuses(event: Request, res: Response) : Promise<void> {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize
  var requestedCompany: Company = deserialize(requestBody, Company);

  if (!requestedCompany.enoughInfoForReadOrDelete()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCompany.getReadAndDeleteExpectedBody()));
  }

  //QUERY
  let params = CampusXCompanyServiceUtils.paramsForQueryForCompanyParentCampuses(requestedCompany.CompanyName, EntityStatus.ACTIVE);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.query(params).promise();
    res.status(200).send(Utils.getUniqueInstance().getDataResponse(data.Items));
  } catch (error) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
  }
};
