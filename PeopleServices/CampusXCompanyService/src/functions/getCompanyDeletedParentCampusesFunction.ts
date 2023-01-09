/*
  Created by Simone Scionti 

  Get all the deleted Campuses in which there is a given Company.
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


export async function getCompanyDelParentCamp(event: Request, res: Response) : Promise<void> {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize
  let requestedCompany: Company = deserialize(requestBody, Company);

  if (!requestedCompany.enoughInfoForReadOrDelete()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCompany.getReadAndDeleteExpectedBody()));
    return
  }

  //QUERY
  let params = CampusXCompanyServiceUtils.paramsForQueryForCompanyParentCampuses(requestedCompany.CompanyName, EntityStatus.DELETED);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.query(params).promise();
    res.status(200).send( Utils.getUniqueInstance().getDataResponse(data.Items));
    return
  } catch (error) {
    res.status(400).send(Utils.getUniqueInstance().getErrorResponse(error, params));
    return
  }
};
