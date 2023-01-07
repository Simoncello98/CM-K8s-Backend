/*
  Created by Simone Scionti 
  
  provides a service for flag The USER_info record as deleted.
*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { UserConsistentUpdateManager } from "../shared/UserConsistentUpdateManagerClass";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { User } from "../../../../shared/Models/User";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import { AuthorizationServiceUtils } from "../../../../Authorization/AuthorizationService/src/Utils/AuthorizationServiceUtils";



export async function setUserAsDeleted(event: Request, res: Response) : Promise<void>  {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize 
  let requestedUser: User = deserialize(requestBody, User);
  if (!requestedUser.isPKDefined()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedUser.getReadAndDeleteExpectedBody()));
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

  res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
};