/*
  Created by Simone Scionti 
*/
'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { User } from "../../../../shared/Models/User";
import { deserialize } from "typescript-json-serializer";
import { DynamoDB, CognitoIdentityServiceProvider } from "aws-sdk";
import { UserServiceUtils } from "../Utils/UserServiceUtils";
import { CognitoGroupsName } from "../../../../shared/Utils/Enums/CognitoGroupsName";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { AuthorizationServiceUtils } from "../../../Authorization/AuthorizationService/Utils/AuthorizationServiceUtils";
import { ISRestResultCodes } from "../../../../shared/Utils/Enums/RestResultCodes";
import { Resources } from "../../../../shared/Utils/Resources";


export const createUser: APIGatewayProxyHandler = async (event, _context) => {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize 
  let newUser: User = deserialize(requestBody, User);
  if(newUser.Email && newUser.Email.length > 0) newUser.Email.toLowerCase().replace(/\s/g, '');

  if (!newUser.enoughInfoForCreate()) {
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, newUser.getCreateExpectedBody());
  }

  //Validate
  if (newUser.SocialNumber) {
    newUser.SocialNumber = newUser.SocialNumber.toUpperCase();
  }

   //if user does not exist in dynamo
  //PUT in dynamo a new user
  newUser.autoFillUndefinedImportantAttributes();

  // Uncomment only test
  //let paramsForCreateUserInCognito = UserServiceUtils.getCognitoParams(newUser.Email, newUser.TemporaryPassword);
  // Fill Email
  let paramsForCreateUserInCognito: CognitoIdentityServiceProvider.AdminCreateUserRequest;
  var temporaryPasswordFilled = "";
  if (newUser.Email) {
    paramsForCreateUserInCognito = UserServiceUtils.getCognitoParams(newUser.Email, newUser.TemporaryPassword);
  } else {
    let error = newUser.autoFillEmailWithStandardDomain();
    if (error) {
      return Utils.getUniqueInstance().getErrorResponse(null, { Error: { Message: "An error occurred when try to fill standard email." } }, ISRestResultCodes.BadRequest);
    }
    temporaryPasswordFilled = Resources.DefaultPasswordForNewUsers;
    paramsForCreateUserInCognito = UserServiceUtils.getCognitoParamsWithoutSendingTheEmail(newUser.Email, temporaryPasswordFilled);
  }

  let errorValidate = UserServiceUtils.validateImportantAttributes(newUser.Email, newUser.SocialNumber);
  if (errorValidate != null) {
    return Utils.getUniqueInstance().getErrorResponse(null, { Error: errorValidate });
  }

  let dynamo = new DynamoDB.DocumentClient();
  let cognito = new CognitoIdentityServiceProvider();

  //Check if exist but disabled
  let paramsDisabledUser = UserServiceUtils.paramsToGetUser(newUser.Email);
  var flagDeleted: boolean = false;
  try {
    const dataDisabledUser = await dynamo.get(paramsDisabledUser).promise();
    let paramsCognitoIdentityGetUser = AuthorizationServiceUtils.getCognitoParamsByUser(newUser.Email);
    
    if (dataDisabledUser.Item) {
      await cognito.adminEnableUser(paramsCognitoIdentityGetUser).promise();
      flagDeleted = dataDisabledUser.Item.UserStatus === EntityStatus.DELETED;
    }
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, { paramsDisabledUser: paramsDisabledUser });
  }

  newUser.autoFillUndefinedImportantAttributes();

  if (newUser.TelephoneNumber) {
    if (!newUser.TelephoneNumber.match(/^\+?(\d\s?)*\d$/g)) {
      return Utils.getUniqueInstance().getErrorResponse(null, { Error: { message: "Invalid Thelephone number!" } }, ISRestResultCodes.BadRequest)
    }
  }

  //Associate User to Group
  let cognitoAssociateGroupParams = UserServiceUtils.paramsForAssociateUserToGroupParams(newUser.Email, CognitoGroupsName.EMPLOYEE);

  newUser.CognitoGroupName = CognitoGroupsName.EMPLOYEE;
  newUser.removeCognitoParams();

  //PUT in dynamodb
  let params = flagDeleted ? UserServiceUtils.paramsToOverwriteDeletedUser(newUser) : UserServiceUtils.paramsToCreateUser(newUser);

  try {
    let data = await dynamo.put(params).promise();
    let cognitoCreateUserData = await cognito.adminCreateUser(paramsForCreateUserInCognito).promise();
    let cognitoAssociateGroupData = await cognito.adminAddUserToGroup(cognitoAssociateGroupParams).promise();
    let result = {
      ...cognitoCreateUserData,
      ...cognitoAssociateGroupData,
      ...data,
      Email: newUser.Email,
      Password: temporaryPasswordFilled // returns default temporary password if necessary else empty string
    }
    return Utils.getUniqueInstance().getDataResponse(result);
  } catch (error) {
    let mergedParams = {
      ...paramsForCreateUserInCognito,
      ...cognitoAssociateGroupParams,
      ...params
    }
    return Utils.getUniqueInstance().getErrorResponse(error, mergedParams);
  }
};
