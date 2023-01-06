/*
  Created by Simone Scionti 
  interface that describes a common Gateway Response to return back. 

*/
export interface Response {
    headers: any,
    statusCode: number,
    body : string
}