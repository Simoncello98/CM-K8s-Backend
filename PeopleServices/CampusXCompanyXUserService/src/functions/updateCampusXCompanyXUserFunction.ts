/*
  Created by Simone Scionti 

  provides a service for updating information about the relationship between a Campus 
  a Company and a User, like CompanyRole or CampusRole of that user. 


  Use a transaction for updating CampusRole in all records in wich there is the same user and the same campus ( different companies ).

  (In the case of the company we are sure that this is the only one record with that company and that user so all ok).
  
  TODO: to not allow to update FName and LName. They are updatable from User info only. 
*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { CampusXCompanyXUser } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompanyXUser";
import { CampusXCompanyXUserConsistentUpdateManager } from "./shared/CampusXCompanyXUserConsistentUpdateManager";
import { DynamoDB } from "aws-sdk"
import { CampusXCompanyXUserServiceUtils } from "./Utils/CampusXCompanyXUserServiceUtils";

let dynamo = new DynamoDB.DocumentClient();

//TODO: if you update the record doesn't exist -> BUG
export const updateCampusXCompanyXUser: APIGatewayProxyHandler = async (event, _context) => {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize json in CompanyXUser model and take the instance. 
  var campusXCompanyXUserToUpdate: CampusXCompanyXUser = deserialize(requestBody, CampusXCompanyXUser);

  if (!campusXCompanyXUserToUpdate.isPKDefined() || !campusXCompanyXUserToUpdate.validValues()) { //if not is PK defined or values are not ok, like for CampusRole a value that is not [Admin-Common]
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, campusXCompanyXUserToUpdate.getUpdateExpectedBody());
  }

  if (!campusXCompanyXUserToUpdate.enoughInfoForUpdate()) {
    return Utils.getUniqueInstance().getNothingToDoErrorResponse(requestBody, campusXCompanyXUserToUpdate.getUpdateExpectedBody());
  }

  //remove in case of wrong attribute passed from the client that can destroy db consistence. 
  campusXCompanyXUserToUpdate.FName = undefined;
  campusXCompanyXUserToUpdate.LName = undefined;

  //UPDATE
  let data: any;
  //if i need to update the only one attr that needs to update all the other recrds of the user
  if (campusXCompanyXUserToUpdate.CampusRole != undefined) data = await transactionUpdate(campusXCompanyXUserToUpdate);
  else data = await updateSingleRecord(campusXCompanyXUserToUpdate);
  return Utils.getUniqueInstance().getDataResponse(data);
};


async function updateSingleRecord(campusXCompanyXUserToUpdate: CampusXCompanyXUser): Promise<any> {
  let params = CampusXCompanyXUserServiceUtils.paramsToUpdateCampusXCompanyXUser(campusXCompanyXUserToUpdate);

  try {
    const data = await dynamo.update(params).promise();
    return Utils.getUniqueInstance().getDataResponse(data);
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, params);
  }
}


async function transactionUpdate(campusXCompanyXUserToUpdate: CampusXCompanyXUser): Promise<any> {
  //use the transaction for consistence updating 
  let rels = await CampusXCompanyXUserConsistentUpdateManager.getUniqueInstance().getRels(campusXCompanyXUserToUpdate);
  //the schema defined works as a bridge between two different models for different Attributes Names.
  let updateSchema = {
    CampusRole: "CampusRole"
  }
  let updateObjects = CampusXCompanyXUserConsistentUpdateManager.getUniqueInstance().getUpdateObjects(rels, campusXCompanyXUserToUpdate, updateSchema);
  let data = await CampusXCompanyXUserConsistentUpdateManager.getUniqueInstance().transactUpdateRels(updateObjects);
  return data;
}