/*
  Created by Simone Scionti 
*/
'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { User } from "../../../../shared/Models/User";
import { deserialize } from "typescript-json-serializer";
import { DynamoDB, CognitoIdentityServiceProvider } from "aws-sdk";
import { UserServiceUtils } from "../Utils/UserServiceUtils";
import { CognitoGroupsName } from "../../../../shared/Utils/Enums/CognitoGroupsName";
import { ISRestResultCodes } from "../../../../shared/Utils/Enums/RestResultCodes";


export async function createUserForImport(event: Request, res: Response) : Promise<void>  {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize 
  let newUser: User = deserialize(requestBody, User);
  newUser.Email = newUser.Email.toLocaleLowerCase().replace(/\s/g, '');

  if (!newUser.enoughInfoForCreate()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, newUser.getCreateExpectedBody()));
  }

  //Validate
  if (newUser.SocialNumber) {
    newUser.SocialNumber = newUser.SocialNumber.toUpperCase();
  }
  let errorValidate = UserServiceUtils.validateImportantAttributes(newUser.Email, newUser.SocialNumber);
  if (errorValidate != null) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(null, { Error: errorValidate }));
  }

  let dynamo = new DynamoDB.DocumentClient();
  let cognito = new CognitoIdentityServiceProvider();

  newUser.autoFillUndefinedImportantAttributes();

  if (newUser.TelephoneNumber) {
    if (!newUser.TelephoneNumber.match(/^\+?(\d\s?)*\d$/g)) {
      res.status(500).send(Utils.getUniqueInstance().getErrorResponse(null, { Error: { message: "Invalid Thelephone number!" } }, ISRestResultCodes.BadRequest))
    }
  }

  //PUT in cognito - New User
  let cognitoCreateUserParams = UserServiceUtils.getCognitoParamsWithoutSendingTheEmail(newUser.Email, "CMPSW123");

  //Associate User to Group
  let cognitoAssociateGroupParams = UserServiceUtils.paramsForAssociateUserToGroupParams(newUser.Email, CognitoGroupsName.EMPLOYEE);

  newUser.CognitoGroupName = CognitoGroupsName.EMPLOYEE;
  newUser.removeCognitoParams();

  //PUT in dynamodb
  let params = UserServiceUtils.paramsToCreateUser(newUser);

  try {
    let data = await dynamo.put(params).promise();
    let cognitoCreateUserData = await cognito.adminCreateUser(cognitoCreateUserParams).promise();
    let cognitoAssociateGroupData = await cognito.adminAddUserToGroup(cognitoAssociateGroupParams).promise();
    let result = {
      ...cognitoCreateUserData,
      ...cognitoAssociateGroupData,
      ...data
    }
    res.status(200).send(Utils.getUniqueInstance().getDataResponse(result));
  } catch (error) {
    let mergedParams = {
      ...cognitoCreateUserParams,
      ...cognitoAssociateGroupParams,
      ...params
    }
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, mergedParams));
  }
};
