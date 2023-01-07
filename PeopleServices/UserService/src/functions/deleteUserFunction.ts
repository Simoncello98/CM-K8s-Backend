/*
  Created by Simone Scionti 
*/
'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { User } from "../../../../shared/Models/User";
import { deserialize } from "typescript-json-serializer";
import { DynamoDB } from "aws-sdk";
import { UserServiceUtils } from "../Utils/UserServiceUtils";


export async function deleteUser(event: Request, res: Response) : Promise<void>  {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize
  let requestedUser: User = deserialize(requestBody, User);
  if (!requestedUser.enoughInfoForReadOrDelete()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedUser.getReadAndDeleteExpectedBody()));
  }

  //DELETE
  let params = UserServiceUtils.paramsToDeleteUser(requestedUser);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.delete(params).promise();
    res.status(200).send(Utils.getUniqueInstance().getDataResponse(data.Attributes));
  } catch (error) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
  }
};

