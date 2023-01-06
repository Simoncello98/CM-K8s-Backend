/*
  Created by Simone Scionti 
*/
'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { DynamoDB, CognitoIdentityServiceProvider } from "aws-sdk";
import { UserServiceUtils } from "../Utils/UserServiceUtils";
import { CampusXCompanyXUserServiceUtils } from "../../CampusXCompanyXUserService/src/functions/Utils/CampusXCompanyXUserServiceUtils";
import { CognitoGroupsName } from "../../../../shared/Utils/Enums/CognitoGroupsName";
import { EntityStatus } from "../../../../shared/Utils/Statics/EntityStatus";
import { CampusXCompanyXVisitor } from "../../../../shared/Models/RelationshipsRecordModels/CampusXCompanyXVisitor";
import { Visitor } from "../../../../shared/Models/Visitor";
import { AuthorizationServiceUtils } from "../../../Authorization/AuthorizationService/Utils/AuthorizationServiceUtils";
import { ISRestResultCodes } from "../../../../shared/Utils/Enums/RestResultCodes";
import { Resources } from "../../../../shared/Utils/Resources";


export const createVisitor: APIGatewayProxyHandler = async (event, _context) => {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize Relationship 
  let newRelationship: CampusXCompanyXVisitor = deserialize(requestBody, CampusXCompanyXVisitor);
  //if(!newRelationship.UserSerialID) newRelationship.UserSerialID = ""; //autofill cause of normal user needs UserSerialID, visitor does not need it. 

  //Deserialize Visitor
  let newVisitor: Visitor = deserialize(requestBody, Visitor);
  if(newVisitor.Email && newVisitor.Email.length > 0) newVisitor.Email.toLowerCase().replace(/\s/g, '');
   

  if (!newVisitor.enoughInfoForCreate()) {
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, newVisitor.getCreateExpectedBody());
  }

  //Validate
  if (newVisitor.SocialNumber) {
    newVisitor.SocialNumber = newVisitor.SocialNumber.toUpperCase();
  }


  newVisitor.autoFillUndefinedImportantAttributesForVisitors();

  // Uncomment only test
  //let paramsForCreateUserInCognito = UserServiceUtils.getCognitoParams(newVisitor.Email, newVisitor.TemporaryPassword);
  // Fill Email
  let paramsForCreateUserInCognito: CognitoIdentityServiceProvider.AdminCreateUserRequest;
  var temporaryPasswordFilled = "";
  if (newVisitor.Email) {
    paramsForCreateUserInCognito = UserServiceUtils.getCognitoParams(newVisitor.Email, newVisitor.TemporaryPassword);
  } else {
    let error = newVisitor.autoFillEmailWithStandardDomain();
    if (error) {
      return Utils.getUniqueInstance().getErrorResponse(null, { Error: { Message: "An error occurred when try to fill standard email." } }, ISRestResultCodes.BadRequest);
    }
    temporaryPasswordFilled = Resources.DefaultPasswordForNewUsers;
    paramsForCreateUserInCognito = UserServiceUtils.getCognitoParamsWithoutSendingTheEmail(newVisitor.Email, temporaryPasswordFilled);
  }

  let errorValidate = UserServiceUtils.validateImportantAttributes(newVisitor.Email, newVisitor.SocialNumber);
  if (errorValidate != null) {
    return Utils.getUniqueInstance().getErrorResponse(null, { Error: errorValidate });
  }

  newRelationship.Email = newVisitor.Email;

  if (!newRelationship.enoughInfoForCreate()) {
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, newRelationship.getCreateExpectedBody());
  }

  let dynamo = new DynamoDB.DocumentClient();
  let cognito = new CognitoIdentityServiceProvider();
  
  //Check if exist but disabled
  let paramsDisabledUser = UserServiceUtils.paramsToGetUser(newVisitor.Email);
  var flagDeleted: boolean = false;
  try {
    const dataDisabledUser = await dynamo.get(paramsDisabledUser).promise();
    let paramsCognitoIdentityGetUser = AuthorizationServiceUtils.getCognitoParamsByUser(newVisitor.Email);

    if (dataDisabledUser.Item) {
      await cognito.adminEnableUser(paramsCognitoIdentityGetUser).promise();
      flagDeleted = dataDisabledUser.Item.UserStatus === EntityStatus.DELETED;
    }
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, { paramsDisabledUser: paramsDisabledUser });
  }

  newVisitor.autoFillUndefinedImportantAttributesForVisitors();

  if (newVisitor.TelephoneNumber) {
    if (!newVisitor.TelephoneNumber.match(/^\+?(\d\s?)*\d$/g)) {
      return Utils.getUniqueInstance().getErrorResponse(null, { Error: { message: "Invalid Thelephone number!" } }, ISRestResultCodes.BadRequest)
    }
  }

  //Associate User to Group
  let cognitoAssociateGroupParams = UserServiceUtils.paramsForAssociateUserToGroupParams(newVisitor.Email, CognitoGroupsName.VISITOR);

  newVisitor.CognitoGroupName = CognitoGroupsName.VISITOR;
  newVisitor.removeCognitoParams();

  //PUT in dynamodb
  let params = flagDeleted ? UserServiceUtils.paramsToOverwriteDeletedUser(newVisitor) : UserServiceUtils.paramsToCreateUser(newVisitor);
  newRelationship.createGSIAttributes();
  newRelationship.autoFillUndefinedImportantAttributesForVisitor();
  
  let paramsRelationship = flagDeleted ? CampusXCompanyXUserServiceUtils.paramsToOverwriteDeletedCampusXCompanyXUser(newRelationship) : CampusXCompanyXUserServiceUtils.paramsToCreateCampusXCompanyXUser(newRelationship);

  try {
    let data = await dynamo.put(params).promise();
    let dataRelationship = await dynamo.put(paramsRelationship).promise();
    let cognitoCreateUserData = await cognito.adminCreateUser(paramsForCreateUserInCognito).promise();
    let cognitoAssociateGroupData = await cognito.adminAddUserToGroup(cognitoAssociateGroupParams).promise();
    let result = {
      ...cognitoCreateUserData,
      ...cognitoAssociateGroupData,
      ...data,
      Email: newVisitor.Email,
      Password: temporaryPasswordFilled, // returns default temporary password if necessary else empty string
      ...dataRelationship
    }
    return Utils.getUniqueInstance().getDataResponse(result);
  } catch (error) {
    let mergedParams = {
      ...paramsForCreateUserInCognito,
      ...cognitoAssociateGroupParams,
      ...params,
      ...paramsRelationship
    }
    return Utils.getUniqueInstance().getErrorResponse(error, mergedParams);
  }
};
