/*
  Created by Simone Scionti 
  Interface that describes a dynamodb error object, used in case of error to return back to the client. 

*/
export interface DataErrorInterface {
    errorType : string;
    errorMessage : string;
}