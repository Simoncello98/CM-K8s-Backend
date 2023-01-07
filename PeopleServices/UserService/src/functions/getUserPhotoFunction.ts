/*
  Created by Simone Scionti
*/

'use strict';

import { Resources } from "../../../../shared/Utils/Resources";
import { S3 } from 'aws-sdk';
import { Utils } from "../../../../shared/Utils/Utils";
import { deserialize } from "typescript-json-serializer";
import { Photo } from "../../../../shared/Models/Logo/Photo";
import { Request, Response } from "express";


export async function getUserPhoto(event: Request, res: Response) : Promise<void>  {

    const requestBody = Utils.getUniqueInstance().validateRequestObject(event)

    //Deserialize
    var requestPhoto: Photo = deserialize(requestBody, Photo)

    if (!requestPhoto.enoughInfoForReadOrDelete()) {
        res.status(400).send(Utils.getUniqueInstance().getValidationErrorResponse(requestBody, requestPhoto.getReadAndDeleteExpectedBody()));
    }

    //GetSignedurl
    const params = {
        Bucket: Resources.REGION,
        Key: requestPhoto.Key
    }

    let s3 = new S3({ signatureVersion: 'v4', region: Resources.REGION });

    try {
        const data = await s3.getObject(params).promise();
        let str = JSON.stringify(data.Body);
        let parse = JSON.parse(str).data;
        let buff = new Buffer(parse).toString('base64');

        let response = {
            ContentType: data.ContentType,
            Buff: buff
        }
        res.status(200).send(Utils.getUniqueInstance().getDataResponse(response));
    } catch (error) {
        res.status(500).send(Utils.getUniqueInstance().getErrorResponse(error, params));
    }
}

/*
<img style="display:block; width:100px;height:100px;" id="base64image" src="data:image/png;base64, iVBORw0KGgoAAA...asdhkal='>
 */