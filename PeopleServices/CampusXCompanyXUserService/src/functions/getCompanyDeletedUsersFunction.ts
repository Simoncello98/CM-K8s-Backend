/*
  Created by Simone Scionti 

  Return all the users of a given company (in all campuses in wich is the company), that were flagged as deleted ( Relationships records ). 


*/
'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { CognitoIdentityServiceProvider, DynamoDB } from "aws-sdk";
import { CampusXCompanyXUserServiceUtils } from "../Utils/CampusXCompanyXUserServiceUtils";
import { Campus } from "../../../../shared/Models/Campus";
import "../../../../shared/Extensions/DynamoDBClientExtension";


export async function getCompanyDeletedUsers(event: Request, res: Response) : Promise<void>  {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize
  let requestedCampus: Campus = deserialize(requestBody, Campus);

  if (!requestedCampus.enoughInfoForReadOrDelete()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedCampus.getReadAndDeleteExpectedBody()));
    return
  }

  //GET - email from signature
  let cognito = new CognitoIdentityServiceProvider();
  let email = await Utils.getUniqueInstance().getEmailFromSignature(event.get("JWTAuthorization"), cognito);

  //GET - list of Companies
  let dynamo = new DynamoDB.DocumentClient();
  let companiesAdminItems = await Utils.getUniqueInstance().getMyListOfCompanies(email, requestedCampus.CampusName, dynamo);

  //QUERY all User
  var listOfUser: DynamoDB.DocumentClient.ItemList = [];

  for (let rel of companiesAdminItems) {
    let params = CampusXCompanyXUserServiceUtils.paramsForQueryByCompany(rel.CompanyName, EntityStatus.DELETED);

    try {
      const data = await dynamo.queryGetAll(params);
      listOfUser = listOfUser.concat(data);
    } catch (error) {
      res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
      return
    }

  }

  res.status(200).send(Utils.getUniqueInstance().getDataResponse(listOfUser));
  return
};