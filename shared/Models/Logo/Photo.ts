/*
  Created by Simone Scionti 
*/

import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { UnmutableModel } from "../AbstractClasses/UnmutableModel";

@Serializable()
export class Photo extends UnmutableModel {
    
    @JsonProperty() public Key : string;
    
    readAndDeleteNecessaryAttributes =  ["Key"];
    createNecessaryAttributes =  ["Key"];

    readAndDeleteExpectedBody = {
        Key : "#String"
    }
    
    createExpectedBody = {
        Key : "#String"
    }

    public constructor(){
        super();
    }

    public autoFillUndefinedImportantAttributes() : void{
    }

    public toJson(removeUndefined : boolean) : Object{
        return serialize(this, removeUndefined);
    }

}