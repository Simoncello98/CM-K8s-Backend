/*
  Created by Simone Scionti 
*/
'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { User } from "../../../../shared/Models/User";
import { deserialize } from "typescript-json-serializer";
import { DynamoDB } from "aws-sdk";
import { UserServiceUtils } from "../Utils/UserServiceUtils";


export const deleteUser: APIGatewayProxyHandler = async (event, _context) => {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize
  let requestedUser: User = deserialize(requestBody, User);
  if (!requestedUser.enoughInfoForReadOrDelete()) {
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedUser.getReadAndDeleteExpectedBody());
  }

  //DELETE
  let params = UserServiceUtils.paramsToDeleteUser(requestedUser);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.delete(params).promise();
    return Utils.getUniqueInstance().getDataResponse(data.Attributes);
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, params);
  }
};

