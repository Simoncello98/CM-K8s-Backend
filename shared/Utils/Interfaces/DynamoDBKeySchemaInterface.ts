/*
  Created by Simone Scionti 
  Interface that describes The key parameters to put in any query operation with dynamodb.


*/
export interface DynamoDBKeySchemaInterface {
    PK : string;
    SK : string;
}