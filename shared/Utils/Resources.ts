/*
  Created by Simone Scionti
*/

export class Resources {
 
  static IA_TABLE = process.env.stage == 'test' ? "CMAuthorization-test" : "CMAuthorization";
  static IP_TABLE = process.env.stage == 'test' ? "CMPeople-test" : "CMPeople";
  static IM_TABLE = process.env.stage == 'test' ?  "CMMeal-test":"CMMeal";
  static S3_BUCKET = process.env.stage == 'test' ? "cm-storage-bucket-test" : "cm-storage-bucket";
  static USERPOOL_NAME = process.env.stage == 'test' ? "CM-UserPool-test" :"CM-UserPool";
  static USERPOOL_COGNITO_NAME = process.env.stage == 'test' ? "CM-UserPool-Client-test" :"CM-UserPool-Client";
  static USERPOOL_ID = process.env.stage == 'test' ? "eu-central-1_cUzvIpcuW" :"eu-central-1_cUzvIpcuW";
  
  //default values
  static DefaultPasswordForNewUsers = "CMTemporaryPSW123";
  static REGION = "eu-central-1";
  static APIVERSION = "2018-11-29";
}