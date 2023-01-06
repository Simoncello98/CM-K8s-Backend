/*
  Created by Simone Scionti 

  Create a company instance, with all the attributes of Company info.

*/

'use strict';

import { Utils } from "../../../../shared/Utils/Utils";
import { Company } from "../../../../shared/Models/Company";
import { deserialize } from "typescript-json-serializer";
import { DynamoDB } from "aws-sdk";
import { CompanyServiceUtils } from "../Utils/CompanyServiceUtils";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { ISValidator } from "../../../../shared/Utils/Validator";
import { ISRestResultCodes } from "../../../../shared/Utils/Enums/RestResultCodes";
import { Request, Response } from "express";


export async function createCompany(event : Request, res: Response) : Promise<void> {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize 
  let newCompany: Company = deserialize(requestBody, Company);

  if (!newCompany.enoughInfoForCreate() || newCompany.CompanyName === "*") {
    res.send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, newCompany.getCreateExpectedBody()));
  }

  let dynamo = new DynamoDB.DocumentClient();

  let paramsGetRelationship = CompanyServiceUtils.paramsToGetCompany(newCompany.CompanyName);
  let flagDeleted: boolean = false;
  try {
    const data = await dynamo.get(paramsGetRelationship).promise();
    if (data.Item) {
      let record = deserialize(data.Item, Company);
      flagDeleted = record.CompanyStatus === EntityStatus.DELETED;
    }
  } catch (error) {
    res.send(Utils.getUniqueInstance().getErrorResponse(error, paramsGetRelationship));
  }

  //PUT
  newCompany.autoFillUndefinedImportantAttributes();

  //Validate
  let errorResponseValidate = ISValidator.getUniqueInstance().isValidVATNumber(newCompany.VATNumber);
  if (errorResponseValidate.Error == "") {
    newCompany.VATNumber = errorResponseValidate.VATNumber;
  } else {
    res.send(Utils.getUniqueInstance().getErrorResponse(null, errorResponseValidate.Error, ISRestResultCodes.BadRequest));
  }

  let params = flagDeleted ? CompanyServiceUtils.paramsToOverwriteDeletedCompany(newCompany) : CompanyServiceUtils.paramsToCreateCompany(newCompany);

  try {
    const data = await dynamo.put(params).promise();
    res.send(Utils.getUniqueInstance().getDataResponse(data));
  } catch (error) {
    res.send(Utils.getUniqueInstance().getErrorResponse(error, params));
  }

};