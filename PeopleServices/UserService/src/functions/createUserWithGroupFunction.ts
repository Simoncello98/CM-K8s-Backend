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
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { CognitoGroupsName } from "../../../../shared/Utils/Enums/CognitoGroupsName";
import { AuthorizationServiceUtils } from "../../../Authorization/AuthorizationService/Utils/AuthorizationServiceUtils";
import { ISRestResultCodes } from "../../../../shared/Utils/Enums/RestResultCodes";
import { Resources } from "../../../../shared/Utils/Resources";


export const createUserWithGroup: APIGatewayProxyHandler = async (event, _context) => {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize 
  let newUser: User = deserialize(requestBody, User);
  newUser.Email = newUser.Email.toLocaleLowerCase().replace(/\s/g, '');

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

  console.log("Email: " + newUser.Email);
  
  let errorValidate = UserServiceUtils.validateImportantAttributes(newUser.Email, newUser.SocialNumber);
  if (errorValidate) {
    return Utils.getUniqueInstance().getErrorResponse(null, { Error: errorValidate });
  }

  let dynamo = new DynamoDB.DocumentClient();
  let cognito = new CognitoIdentityServiceProvider();

  //Check if exist but disabled
  let paramsDeletedUser = UserServiceUtils.paramsToGetUser(newUser.Email);
  var flagDeleted: boolean = false;
  var oldGroupName: string = CognitoGroupsName.EMPLOYEE
  try {
    const dataDeletedUser = await dynamo.get(paramsDeletedUser).promise();
    let paramsCognitoIdentityGetUser = AuthorizationServiceUtils.getCognitoParamsByUser(newUser.Email);

    if (dataDeletedUser.Item) { // if user exist in dynamo
      await cognito.adminEnableUser(paramsCognitoIdentityGetUser).promise();
      flagDeleted = dataDeletedUser.Item.UserStatus === EntityStatus.DELETED;

      if (!newUser.CognitoGroupName) {
        const dataCognitoIdentityDeletedUser = await cognito.adminListGroupsForUser(paramsCognitoIdentityGetUser).promise();
        if (dataCognitoIdentityDeletedUser.Groups.length > 0) {
          oldGroupName = dataCognitoIdentityDeletedUser.Groups[0].GroupName;
        }
      }
    }
    // } else { // also check it in cognito
    //   try {
    //     const dataGetUserFromCognito = await cognito.adminGetUser(paramsCognitoIdentityGetUser).promise();
    //     if (dataGetUserFromCognito) {
    //       const dataCognitoIdentityDeletedUser = await cognito.adminListGroupsForUser(paramsCognitoIdentityGetUser).promise();
    //       if (dataCognitoIdentityDeletedUser.Groups && dataCognitoIdentityDeletedUser.Groups.length > 0) {
    //         oldAssociatedGroupName = dataCognitoIdentityDeletedUser.Groups[0].GroupName;
    //       }
    //       flagDeleted = true;
    //     }
    //   } catch (error) {
    //     console.log( Utils.getUniqueInstance().getErrorResponse(error, { Error: { message: "Error when get user from cognito" }}));
    //   }
    // }
  
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, { paramsDisabledUser: paramsDeletedUser });
  }

  if (newUser.TelephoneNumber) {
    if (!newUser.TelephoneNumber.match(/^\+?(\d\s?)*\d$/g)) {
      return Utils.getUniqueInstance().getErrorResponse(null, { Error: { message: "Invalid Thelephone number!" } }, ISRestResultCodes.BadRequest)
    }
  }

  if (flagDeleted && newUser.CognitoGroupName) {
    let paramsRemoveUserFromGroup = AuthorizationServiceUtils.getCognitoParamsByUserAndGroup(newUser.Email, oldGroupName);
    try {
      await cognito.adminRemoveUserFromGroup(paramsRemoveUserFromGroup).promise();
    } catch (error) {
      return Utils.getUniqueInstance().getErrorResponse(null, {paramsRemovewUserFromGroup: paramsRemoveUserFromGroup, message: "Remove User from Group in Cognito encountered an error." });
    }
  }

  //Associate User to Group
  if (!newUser.CognitoGroupName) {
    newUser.CognitoGroupName = oldGroupName as CognitoGroupsName;
  }
  let cognitoAssociateGroupParams = UserServiceUtils.paramsForAssociateUserToGroupParams(newUser.Email, newUser.CognitoGroupName);
  
  newUser.removeCognitoParams();

  //PUT in dynamodb
  let params = flagDeleted ? UserServiceUtils.paramsToOverwriteDeletedUser(newUser) : UserServiceUtils.paramsToCreateUser(newUser);

  try {
    let data = await dynamo.put(params).promise();
    let cognitoCreateUserData = flagDeleted ? {} : await cognito.adminCreateUser(paramsForCreateUserInCognito).promise();
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
