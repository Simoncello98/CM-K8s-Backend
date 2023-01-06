/*
  Created by Simone Scionti 

  get an user using the given id ( Email ).

*/
'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { User } from "../../../../shared/Models/User";
import { DynamoDB } from "aws-sdk";
import { UserServiceUtils } from "../Utils/UserServiceUtils";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { ISRestResultCodes } from "../../../../shared/Utils/Enums/RestResultCodes";


export const getUser: APIGatewayProxyHandler = async (event, _context) => {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize 
  let requestedUser: User = deserialize(requestBody, User);
  if (!requestedUser.enoughInfoForReadOrDelete()) {
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedUser.getReadAndDeleteExpectedBody());
  }

  //GET
  let params = UserServiceUtils.paramsToGetUser(requestedUser.Email);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.get(params).promise();

    if (data.Item && data.Item.UserStatus == EntityStatus.ACTIVE) {
      return Utils.getUniqueInstance().getDataResponse(data.Item);
    } else {
      return Utils.getUniqueInstance().getErrorResponse(null, {Error: { message: "User deleted." } }, ISRestResultCodes.NotFound);
    }
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, params);
  }
};