/*
  Created by Simone Scionti 
*/

import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { UnmutableModel } from "../AbstractClasses/UnmutableModel";

@Serializable()
export class UserXGroup extends UnmutableModel {
    
    /** Username */
    @JsonProperty() public Email : string;
    /** GroupName */
    @JsonProperty() public Group : string;
    /** CognitoClientID */
    @JsonProperty() public CognitoClientID : string;
    
    readAndDeleteNecessaryAttributes =  ["Email", "Group"];
    createNecessaryAttributes = ["Email", "Group"];

    readAndDeleteExpectedBody = {
        Email : "#String",
        Group : "#String"
    }

    createExpectedBody = {
        Email : "#String",
        Group : "#String"
    }

    public toJson(removeUndefined : boolean) : Object{
        return serialize(this, removeUndefined);
    }

}