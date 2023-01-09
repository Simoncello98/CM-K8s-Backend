/*
  Created by Simone Scionti 

  update the user and all the relationships record using a transaction.
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { User } from "../../../../shared/Models/User";
import { DynamoDB } from "aws-sdk";
import { ISRestResultCodes } from "../../../../shared/Utils/Enums/RestResultCodes";
import { UserServiceUtils } from "../Utils/UserServiceUtils";


export async function updateUserTelephoneNumber(event: Request, res: Response) : Promise<void>  {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize
  let requestedUser: User = deserialize(requestBody, User);
  if (!requestedUser.isPKDefined()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedUser.getUpdateExpectedBody()));
    return
  }

  if (!requestedUser.enoughInfoForUpdate()) {
    res.status(400).send(Utils.getUniqueInstance().getNothingToDoErrorResponse(requestBody, requestedUser.getUpdateExpectedBody()));
    return
  }

  if (!requestedUser.TelephoneNumber) {
    res.status(400).send(Utils.getUniqueInstance().getNothingToDoErrorResponse(requestBody, requestedUser.TelephoneNumber));
    return
  }

  if (requestedUser.TelephoneNumber) {
    if (!requestedUser.TelephoneNumber.match(/^\+?(\d\s?)*\d$/g)) {
      res.status(500).send(Utils.getUniqueInstance().getErrorResponse(null, { Error: { message: "Invalid Thelephone number!" } }, ISRestResultCodes.BadRequest))
      return
    }
  }


  //Critical attributes
  delete requestedUser.FName;
  delete requestedUser.LName;
  delete requestedUser.IsVisitor;
  delete requestedUser.UserStatus;
  delete requestedUser.CardID;
  delete requestedUser.LicenseNumber;
  delete requestedUser.SocialNumber;
  delete requestedUser.PlaceOfResidence;
  delete requestedUser.PlaceOfBirth;
  delete requestedUser.DateOfBirth;
  delete requestedUser.SignedRegulations;
  delete requestedUser.UserPhoto;
  delete requestedUser.DCCExpirationDate;


  //UPDATE
  let params = UserServiceUtils.paramsToUpdateUser(requestedUser);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.update(params).promise();
    res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
  } catch (error) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
  }
};

