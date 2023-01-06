/*
  Created by Giuseppe Criscione 

    User model class.

*/

import { JsonProperty, Serializable, serialize } from "typescript-json-serializer";
import { UnmutableModel } from "./AbstractClasses/UnmutableModel";

@Serializable()
export class UpdateUser extends UnmutableModel {

    @JsonProperty() public OldUserEmail: string;
    @JsonProperty() public NewUserEmail: string; 
    @JsonProperty() public SendEmail: string; 

    readAndDeleteNecessaryAttributes = ["OldUserEmail", "NewUserEmail", "SendEmail"];
    createNecessaryAttributes = ["OldUserEmail", "NewUserEmail", "SendEmail"];

    readAndDeleteExpectedBody = {
        OldUserEmail: "#String - (required)",
        NewUserEmail: "#String - (required)",
        SendEmail: "#'T' | 'F' - (required)"
    }

    createExpectedBody = {
        OldUserEmail: "#String - (required)",
        NewUserEmail: "#String - (required)",
        SendEmail: "#'T' | 'F' - (required)"
    }


    public toJson(removeUndefined: boolean): Object {
        return serialize(this, removeUndefined);
    }


    public constructor() {
        super();
    }
}