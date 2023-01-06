/*
  Created by Simone Scionti 
*/
export interface ModelNecessaryQueryInfoInterface{
    //each [string] will contains all the names of the key useful to execute the related query.
    updateOptionalAtLeastOneAttributes : string[];
    readAndDeleteNecessaryAttributes: string[];
    updateNecessaryAttributes: string[];
    createNecessaryAttributes: string[];
}