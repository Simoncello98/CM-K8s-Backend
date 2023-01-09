/*
  Created by Simone Scionti
*/

import { stage } from "../envConfigUtils";

export class Resources {
 
  static IA_TABLE = stage == 'test' ? "CMAuthorization-test" : "CMAuthorization";
  static IP_TABLE = stage == 'test' ? "CMPeople-test" : "CMPeople";
  static IM_TABLE = stage == 'test' ?  "CMMeal-test":"CMMeal";
  static S3_BUCKET = stage == 'test' ? "cm-storage-bucket-test" : "cm-storage-bucket";
  static USERPOOL_NAME = stage == 'test' ? "CM-UserPool-test" :"CM-UserPool";
  static USERPOOL_COGNITO_NAME = stage == 'test' ? "CM-UserPool-Client-test" :"CM-UserPool-Client";
  static USERPOOL_ID = stage == 'test' ? "eu-central-1_cUzvIpcuW" :"eu-central-1_cUzvIpcuW";
  static USERPOOL_CLIENTID = 'test' ? '2uqjafq2u1kf6f8mce741s0tcv' : '2uqjafq2u1kf6f8mce741s0tcv' //todo: specify for prod
  
  //default values
  static DefaultPasswordForNewUsers = "CMTemporaryPSW123";
  static REGION = "eu-central-1";
  static APIVERSION = "2018-11-29";
}