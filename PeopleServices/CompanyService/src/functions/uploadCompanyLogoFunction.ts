/*
  Created by Simone Scionti
*/

'use strict';

import { DynamoDB, S3 } from 'aws-sdk';
import { v4 as uuidv4 } from "uuid";
import { CreateLogo } from "../../../../shared/Models/Logo/CreateLogo";
import { deserialize } from "typescript-json-serializer";
import { Utils } from "../../../../shared/Utils/Utils";
import { CompanyServiceUtils } from "../Utils/CompanyServiceUtils";
import { Resources } from '../../../../shared/Utils/Resources';
import { Company } from '../../../../shared/Models/Company';

import { CampusXCompany } from '../../../../shared/Models/RelationshipsRecordModels/CampusXCompany';
import { Request, Response } from 'express';
import { CampusXCompanyServiceUtils } from '../../../CampusXCompanyService/src/Utils/CampusXCompanyServiceUtils';


export async function uploadCompanyLogo(event: Request, res: Response) : Promise<void> {

  const requestBody = Utils.getUniqueInstance().validateRequestObject(event)

  //Deserialize
  let newLogo: CreateLogo = deserialize(requestBody, CreateLogo)

  if (!newLogo.enoughInfoForReadOrDelete()) {
    res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, newLogo.getReadAndDeleteExpectedBody()));
  }

  newLogo.autoFillUndefinedImportantAttributes();

  //Check ContentType
  let contentType = newLogo.ContentType.substring(6);
  let errorContentType = Utils.getUniqueInstance().checkContentType(contentType);
  if (errorContentType != "") {
    res.status(400).send(Utils.getUniqueInstance().getErrorResponse(null, { Error: { contentType: contentType, message: errorContentType } }));
  }

  //Build the request for S3
  let keyPathPrefix = "uploads/logo/companies/";
  let key = keyPathPrefix + uuidv4() + "." + contentType;
  let url: string = "https://" + Resources.S3_BUCKET + ".s3.amazonaws.com/" + key;

  //Delete if it exist
  // await Utils.getUniqueInstance().emptyBucket(keyPathPrefix + newLogo.organizationName, s3);

  let companyToUpdate = new Company();
  companyToUpdate.removeUnplannedValues();
  companyToUpdate.CompanyName = newLogo.OrganizationName;
  companyToUpdate.Logo = url;

  let buff = Buffer.from(newLogo.Data, 'base64');

  //Create a new object.
  let paramsPutS3 = CompanyServiceUtils.parmasToPutS3BucketKey(key, newLogo.ContentType, buff);
  let paramsUpdateDynamo = CompanyServiceUtils.paramsToUpdateCompany(companyToUpdate);

  let s3 = new S3({ signatureVersion: 'v4' });
  let dynamo = new DynamoDB.DocumentClient();

  try {
    await s3.putObject(paramsPutS3).promise();
    await dynamo.update(paramsUpdateDynamo).promise();

    // Update all CampusXCompany relationships
    let paramsGetAllRelationships = CampusXCompanyServiceUtils.paramsForQueryForCompanyParentCampusesWithoutRelationshipStatus(companyToUpdate.CompanyName);
    const dataRelationships = await dynamo.query(paramsGetAllRelationships).promise();
    if (dataRelationships.Items.length > 0) {
      let paramsUpdateCompanyRelationships: any[] = [];

      for (var i = 0; i < dataRelationships.Items.length; i++) {
        let item: CampusXCompany = deserialize(dataRelationships.Items[i], CampusXCompany);
        item.CompanyLogo = url
        let paramsUpdateTransact = CampusXCompanyServiceUtils.paramsToUpdateSingleTransactRecord(item);
        paramsUpdateCompanyRelationships.push(paramsUpdateTransact);
      }

      let paramsForTransact = CampusXCompanyServiceUtils.paramsToPutTransactWrite(paramsUpdateCompanyRelationships);
      await dynamo.transactWrite(paramsForTransact).promise();
    }

    let responseData = {
      Url: url
    };
    res.status(200).send(Utils.getUniqueInstance().getDataResponse(responseData));
  } catch (error) {
    let response = {
      ...paramsPutS3,
      ...paramsUpdateDynamo
    }
    res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, response));
  }
}