/*
  Created by Simone Scionti 

  get an user using the given id ( Email ).

*/
'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { User } from "../../../../shared/Models/User";
import { DynamoDB } from "aws-sdk";
import { UserServiceUtils } from "../Utils/UserServiceUtils";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { ISRestResultCodes } from "../../../../shared/Utils/Enums/RestResultCodes";


export async function getUser(event: Request, res: Response) : Promise<void>  {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize 
  let requestedUser: User = deserialize(requestBody, User);
  if (!requestedUser.enoughInfoForReadOrDelete()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedUser.getReadAndDeleteExpectedBody()));
    return
  }

  //GET
  let params = UserServiceUtils.paramsToGetUser(requestedUser.Email);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.get(params).promise();

    if (data.Item && data.Item.UserStatus == EntityStatus.ACTIVE) {
      res.status(200).send(Utils.getUniqueInstance().getDataResponse(data.Item));
    } else {
      res.status(500).send(Utils.getUniqueInstance().getErrorResponse(null, {Error: { message: "User deleted." } }, ISRestResultCodes.NotFound));
    }
  } catch (error) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
  }
};