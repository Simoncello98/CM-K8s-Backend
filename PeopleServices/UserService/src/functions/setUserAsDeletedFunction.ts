/*
  Created by Simone Scionti 
  
  provides a service for flag The USER_info record as deleted.
*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { UserConsistentUpdateManager } from "../shared/UserConsistentUpdateManagerClass";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { User } from "../../../../shared/Models/User";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import { AuthorizationServiceUtils } from "../../../Authorization/AuthorizationService/Utils/AuthorizationServiceUtils";


export const setUserAsDeleted: APIGatewayProxyHandler = async (event, _context) => {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize 
  let requestedUser: User = deserialize(requestBody, User);
  if (!requestedUser.isPKDefined()) {
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedUser.getReadAndDeleteExpectedBody());
  }

  //TODO: remove all other attributes passed from the client. for the update. THIS IS NOT AN UPDATE OPERATION.
  requestedUser.UserStatus = EntityStatus.DELETED; //Force the delete attr.

  let rels = await UserConsistentUpdateManager.getUniqueInstance().getRels(requestedUser);

  //the schema defined works as a bridge between two different models for different Attributes Names.
  let updateSchema = {
    UserStatus: "RelationshipStatus"
  }
  let updateObjects = UserConsistentUpdateManager.getUniqueInstance().getUpdateObjects(rels, requestedUser, updateSchema);

  // Transact
  let data = await UserConsistentUpdateManager.getUniqueInstance().transactUpdateRels(updateObjects);

  let cognito = new CognitoIdentityServiceProvider();
  let paramsCognitoIdentityGetUser = AuthorizationServiceUtils.getCognitoParamsByUser(requestedUser.Email);
  await cognito.adminDisableUser(paramsCognitoIdentityGetUser).promise();

  return Utils.getUniqueInstance().getDataResponse(data);
};