/*
  Created by Simone Scionti
*/


export class Resources {
  static stage = 'test' //change this var to change env
  static IA_TABLE = Resources.stage === 'test' ? "CMAuthorization-test" : "CMAuthorization";
  static IP_TABLE = Resources.stage  === 'test' ? "CMPeople-test" : "CMPeople";
  static IM_TABLE = Resources.stage  === 'test' ?  "CMMeal-test":"CMMeal";
  static S3_BUCKET = Resources.stage  === 'test' ? "cm-storage-bucket-test" : "cm-storage-bucket";
  static USERPOOL_NAME = Resources.stage  === 'test' ? "CM-UserPool-test" :"CM-UserPool";
  static USERPOOL_COGNITO_NAME = Resources.stage  === 'test' ? "CM-UserPool-Client-test" :"CM-UserPool-Client";
  static USERPOOL_ID = Resources.stage  === 'test' ? "eu-central-1_cUzvIpcuW" :"eu-central-1_cUzvIpcuW";
  static USERPOOL_CLIENTID = Resources.stage  === 'test' ? '2uqjafq2u1kf6f8mce741s0tcv' : '2uqjafq2u1kf6f8mce741s0tcv' //todo: specify for prod
  
  //default values
  static DefaultPasswordForNewUsers = "CMTemporaryPSW123";
  static REGION = "eu-central-1";
  static APIVERSION = "2018-11-29";
}