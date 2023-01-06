/*
  Created by Simone Scionti
*/

'use strict';

import { Resources } from "../../../../shared/Utils/Resources";
import { DynamoDB, S3 } from 'aws-sdk';
import { v4 as uuidv4 } from "uuid";
import { Utils } from "../../../../shared/Utils/Utils";
import { UserServiceUtils } from "../Utils/UserServiceUtils";
import { User } from "../../../../shared/Models/User";
import { CreatePhoto } from "../../../../shared/Models/Logo/CreatePhoto";
import { deserialize } from "typescript-json-serializer";


export const uploadUserPhoto = async (event, _context) => {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event)

  //Deserialize
  let createPhoto: CreatePhoto = deserialize(requestBody, CreatePhoto)

  if (!createPhoto.enoughInfoForReadOrDelete()) {
    return Utils.getUniqueInstance().getValidationErrorResponse(requestBody, createPhoto.getReadAndDeleteExpectedBody());
  }

  //Check ContentType
  let contentType = createPhoto.ContentType.substring(6);
  let errorContentType = Utils.getUniqueInstance().checkContentType(contentType);
  if (errorContentType != "") {
    return Utils.getUniqueInstance().getErrorResponse(null, { Error: { contentType: contentType, message: errorContentType } });
  }

  //Build the request for S3
  let bucket = Resources.S3_BUCKET;
  let keyPathPrefix = "uploads/logo/users/";
  let key = keyPathPrefix + uuidv4() + "." + contentType;

  let s3 = new S3({ signatureVersion: 'v4' });
  //Delete if it exist
  // await Utils.getUniqueInstance().emptyBucket(bucket, keyPathPrefix + createPhoto.email + "/", s3);

  let url: string = "https://" + bucket + ".s3.amazonaws.com/" + key;
  let lengthURL: number = ("https://" + bucket + ".s3.amazonaws.com/").length;

  let userToUpdate = new User();
  userToUpdate.removeUnplannedValues();
  userToUpdate.Email = createPhoto.Email;
  userToUpdate.UserPhoto = url;
  
  let buff = Buffer.from(createPhoto.Data, 'base64');
  //Create a new object
  let paramsPutS3 = {
    Bucket: bucket,
    Key: key,
    Body: buff,
    ContentType: createPhoto.ContentType
  };
  
  // PUT user photo on dynamo
  let paramsUpdateUserPhoto = UserServiceUtils.paramsToUpdateUserPhoto(userToUpdate);

  
  let dynamo = new DynamoDB.DocumentClient();

  try {
    await s3.putObject(paramsPutS3).promise();
    const dataUserPhoto = await dynamo.update(paramsUpdateUserPhoto).promise(); //delete image
    //Always check if an object exists before access it's own properties.
    if (dataUserPhoto && dataUserPhoto.Attributes) {
      let oldUser: User = deserialize(dataUserPhoto.Attributes, User);
      //Always check if an object exists before access it's own properties.
      if (oldUser && oldUser.UserPhoto) {
        let paramsDeleteObjectS3 = {
          Bucket: bucket,
          Key: oldUser.UserPhoto.substring(lengthURL)
        }
        await s3.deleteObject(paramsDeleteObjectS3).promise();
      }
    }

    let response = {
      Url: url
    };
    return Utils.getUniqueInstance().getDataResponse(response);
  } catch (error) {
    let response = {
      ...paramsPutS3,
      ...paramsUpdateUserPhoto
    }
    return Utils.getUniqueInstance().getErrorResponse(error, response);
  }
}