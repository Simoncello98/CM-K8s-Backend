/*
  Created by Simone Scionti 

  update the user and all the relationships record using a transaction.
*/

'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { User } from "../../../../shared/Models/User";
import { DynamoDB, CognitoIdentityServiceProvider } from "aws-sdk";
import { ISRestResultCodes } from "../../../../shared/Utils/Enums/RestResultCodes";
import { UserServiceUtils } from "../Utils/UserServiceUtils";


export const updateMyTelephoneNumber: APIGatewayProxyHandler = async (event, _context) => {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event);

  //Deserialize
  let requestedUser: User = deserialize(requestBody, User);
  if (!requestedUser.isPKDefined()) {
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestedUser.getUpdateExpectedBody());
  }

  //GET - email from signature
  let cognito = new CognitoIdentityServiceProvider();
  let email = await Utils.getUniqueInstance().getEmailFromSignature(event.requestContext.identity.cognitoAuthenticationProvider, cognito);
  if (email.toLowerCase() !== requestedUser.Email.toLowerCase()) {
    return Utils.getUniqueInstance().getErrorResponse(null, { cognitoEmail: email, recivedEmail: requestedUser.Email, message: "You don't have permission to edit other users." }, ISRestResultCodes.NoAuth);
  }

  if (!requestedUser.enoughInfoForUpdate()) {
    return Utils.getUniqueInstance().getNothingToDoErrorResponse(requestBody, requestedUser.getUpdateExpectedBody());
  }

  if (requestedUser.TelephoneNumber === undefined || requestedUser.TelephoneNumber === null) {
    return Utils.getUniqueInstance().getNothingToDoErrorResponse(requestBody, requestedUser.TelephoneNumber);
  }

  if (requestedUser.TelephoneNumber) {
    if (!requestedUser.TelephoneNumber.match(/^\+?(\d\s?)*\d$/g)) {
      return Utils.getUniqueInstance().getErrorResponse(null, { Error: { message: "Invalid Thelephone number!" } }, ISRestResultCodes.BadRequest)
    }
  }


  //Critical attributes
  delete requestedUser.FName;
  delete requestedUser.LName;
  delete requestedUser.IsVisitor;
  delete requestedUser.UserStatus;
  delete requestedUser.CardID;
  delete requestedUser.LicenseNumber;
  delete requestedUser.SocialNumber;
  delete requestedUser.PlaceOfResidence;
  delete requestedUser.PlaceOfBirth;
  delete requestedUser.DateOfBirth;
  delete requestedUser.SignedRegulations;
  delete requestedUser.UserPhoto;
  delete requestedUser.DCCExpirationDate;


  //UPDATE
  let params = UserServiceUtils.paramsToUpdateUser(requestedUser);

  let dynamo = new DynamoDB.DocumentClient();

  try {
    const data = await dynamo.update(params).promise();
    return Utils.getUniqueInstance().getDataResponse(data);
  } catch (error) {
    return Utils.getUniqueInstance().getErrorResponse(error, params);
  }
};

