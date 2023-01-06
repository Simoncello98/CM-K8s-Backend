/*
  Created by Simone Scionti 

  get all campuses in the system.

*/
'use strict';

import { Utils } from "../../../../shared/Utils/Utils";
import { DynamoDB } from "aws-sdk";
import { CampusServiceUtils } from "../Utils/CampusServiceUtils";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { Request, Response } from "express";


export async function getAllCampuses(_event: Request, res: Response) : Promise<void> {
  
  //QUERY
  let params = CampusServiceUtils.paramsForQueryForAllRecordsWithStatus(EntityStatus.ACTIVE);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.query(params).promise();
    res.send(Utils.getUniqueInstance().getDataResponse(data.Items));
  } catch (error) {
    res.send(Utils.getUniqueInstance().getErrorResponse(error, params));
  }
};