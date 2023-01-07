/*
  Created by Simone Scionti 
  Create a Relationship record between User,Campus and Company. 

  It uses the campusRole of the existing Relatioship records if exists, and the FName and LName of the user. 

  It generally do 2 Queries to the DB, one for getting one of the existing relationship records, and 
  one to put the new one with FName, LName and CampusRole got from the existing record. 
  
  In the worst case, if there isn't any existing record, it do another query to get the FName and LName from the user_info record.

*/

'use strict';

import { Request, Response } from "express";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { CampusXCompanyXUser } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompanyXUser";
import { User } from "../../../../shared/Models/User";
import { DynamoDB } from "aws-sdk";
import { CampusXCompanyXUserServiceUtils } from "../Utils/CampusXCompanyXUserServiceUtils";
import { UserServiceUtils } from "../../../UserService/src/Utils/UserServiceUtils";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";

let dynamo = new DynamoDB.DocumentClient();

export async function createCampusXCompanyXUser(event: Request, res: Response) : Promise<void>  {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize
  let newCampusXCompanyXUser: CampusXCompanyXUser = deserialize(requestBody, CampusXCompanyXUser);

  if (!newCampusXCompanyXUser.enoughInfoForCreate()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, newCampusXCompanyXUser.getCreateExpectedBody()));
  }

  if (newCampusXCompanyXUser.UserSerialID) {
    if (newCampusXCompanyXUser.UserSerialID.length > 7) {
      newCampusXCompanyXUser.UserSerialID = newCampusXCompanyXUser.UserSerialID.substring(newCampusXCompanyXUser.UserSerialID.length - 7);
    } else if (newCampusXCompanyXUser.UserSerialID.length < 7) {
      res.status(500).send(Utils.getUniqueInstance().getErrorResponse(null, { Error : { Message: "UserSerial ID must have 7 characters" }}));
    }
  }

  newCampusXCompanyXUser.createGSIAttributes();
  newCampusXCompanyXUser.autoFillUndefinedImportantAttributes(); //it fills for instance : CompanyRole = Common.

  //GET existing relationship
  let existingRelationship: CampusXCompanyXUser = await getExistingCampusRelationship(newCampusXCompanyXUser);
  let flagDeleted: boolean = false;
  if (existingRelationship) {
    if (newCampusXCompanyXUser.CompanyName == existingRelationship.CompanyName) {
      flagDeleted = existingRelationship.RelationshipStatus === EntityStatus.DELETED;
    }
    newCampusXCompanyXUser.FName = existingRelationship.FName;
    newCampusXCompanyXUser.LName = existingRelationship.LName;
    newCampusXCompanyXUser.IsVisitor = existingRelationship.IsVisitor;
    newCampusXCompanyXUser.CampusRole = existingRelationship.CampusRole;
  } else {
    //get FName and LName from User info
    let params = UserServiceUtils.paramsToGetUser(newCampusXCompanyXUser.Email);
    try {
      const data = await dynamo.get(params).promise();
      if (data.Item) {
        let userWithInfo: User = deserialize(data.Item, User);
        newCampusXCompanyXUser.FName = userWithInfo.FName;
        newCampusXCompanyXUser.LName = userWithInfo.LName;
        newCampusXCompanyXUser.IsVisitor = userWithInfo.IsVisitor;
      }
    } catch (error) {
      res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, { Error: { message: "User does not exist." } }));
    }
  }

  //PUT
  let params = flagDeleted ? CampusXCompanyXUserServiceUtils.paramsToOverwriteDeletedCampusXCompanyXUser(newCampusXCompanyXUser) : CampusXCompanyXUserServiceUtils.paramsToCreateCampusXCompanyXUser(newCampusXCompanyXUser);

  try {
    const data = await dynamo.put(params).promise();
    res.status(200).send(Utils.getUniqueInstance().getDataResponse(data));
  } catch (error) {
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
  }
};

//get user campusrole and names if exist in another record
async function getExistingCampusRelationship(newRecord: CampusXCompanyXUser): Promise<CampusXCompanyXUser> {
  let params = CampusXCompanyXUserServiceUtils.paramsForQueryByCampusAndEmail(newRecord.CampusName, newRecord.Email);

  //TODO: limit the query to one result. 
  const data = await dynamo.query(params).promise();
  if (Object.keys(data.Items).length == 0) return undefined; //if there are no records we don't deserialize anithing and we return undefined. 

  let record: CampusXCompanyXUser;
  for (var i = 0; i < Object.keys(data.Items).length; i++) {
    record = deserialize(data.Items[i], CampusXCompanyXUser);
    if (newRecord.CompanyName == record.CompanyName) {
      return record;
    }
  }
  return record;
} 