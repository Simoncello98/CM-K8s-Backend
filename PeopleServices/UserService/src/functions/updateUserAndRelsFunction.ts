/*
  Created by Simone Scionti 

  update the user and all the relationships record using a transaction.
*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { User } from "../../../../shared/Models/User";
import { UserConsistentUpdateManager } from "../shared/UserConsistentUpdateManagerClass";
import { CognitoIdentityServiceProvider, DynamoDB } from "aws-sdk";
import { UserServiceUtils } from "../Utils/UserServiceUtils";
import { AuthorizationServiceUtils } from "../../../Authorization/AuthorizationService/Utils/AuthorizationServiceUtils";
import { ISRestResultCodes } from "../../../../shared/Utils/Enums/RestResultCodes";


export const updateUserAndRels: APIGatewayProxyHandler = async (event, _context) => {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize 
  let userData: User = deserialize(requestBody, User);
  if (!userData.isPKDefined()) {
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, userData.getUpdateExpectedBody());
  }

  //Update params
  let params = UserServiceUtils.paramsToGetUser(userData.Email);

  let dynamo = new DynamoDB.DocumentClient();
  let cognito = new CognitoIdentityServiceProvider();

  if (userData.CognitoGroupName) {
    try {
      const currentUserData = await dynamo.get(params).promise();
      let userToUpdate = deserialize(currentUserData.Item, User);

      if (userToUpdate?.CognitoGroupName && userToUpdate?.CognitoGroupName != userData.CognitoGroupName) {
        let paramsRemoveUserFromGroup = AuthorizationServiceUtils.getCognitoParamsByUserAndGroup(userToUpdate.Email, userToUpdate.CognitoGroupName);
        try {
          await cognito.adminRemoveUserFromGroup(paramsRemoveUserFromGroup).promise();
        } catch (error) {
          return Utils.getUniqueInstance().getErrorResponse(error, paramsRemoveUserFromGroup);
        }
      }

      let paramsAddUserToGroup = UserServiceUtils.paramsForAssociateUserToGroupParams(userToUpdate.Email, userData.CognitoGroupName);
      try {
        await cognito.adminAddUserToGroup(paramsAddUserToGroup).promise();
      } catch (error) {
        return Utils.getUniqueInstance().getErrorResponse(error, paramsAddUserToGroup);
      }

    } catch (error) {
      return Utils.getUniqueInstance().getErrorResponse(error, params);
    }
  }

  //UPDATE
  if (!userData.enoughInfoForUpdate()) {
    return Utils.getUniqueInstance().getNothingToDoErrorResponse(requestBody, userData.getUpdateExpectedBody());
  }

  if (userData.TelephoneNumber) {
    if (!userData.TelephoneNumber.match(/^\+?(\d\s?)*\d$/g)) {
      return Utils.getUniqueInstance().getErrorResponse(null, { Error: { message: "Invalid Thelephone number!" } }, ISRestResultCodes.BadRequest)
    }
  }

  let rels = await UserConsistentUpdateManager.getUniqueInstance().getRels(userData);
  //no schema defined because both models has same Update properties names(except Relationship status but it does not matter).
  //NB. IF YOU WANT TO CHANGE THE USERSTATUS IN A CONSISTENCE WAY, YOU NEED TO SPECIFY THE UPDATESCHEMA PARAMETER.
  let updateObjects = UserConsistentUpdateManager.getUniqueInstance().getUpdateObjects(rels, userData, false);
  let data = await UserConsistentUpdateManager.getUniqueInstance().transactUpdateRels(updateObjects);
  return Utils.getUniqueInstance().getDataResponse(data);
};

