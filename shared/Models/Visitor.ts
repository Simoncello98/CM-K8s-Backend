/*
  Created by Simone Scionti 

    Visitor model class.

*/
import { Serializable} from "typescript-json-serializer";
import { User } from "./User";

@Serializable()
export class Visitor extends User {

    createNecessaryAttributes = [/*"Email",*/ "FName", "LName", "CognitoClientID"];

    readAndDeleteExpectedBody = {
        Email: "#String - (required)"
    }


    createExpectedBody = {
        Email: "#String - (required)",
        FName: "#String - (required)",
        LName: "#String - (required)",
        CognitoClientID: "#String - (required)",
        PlaceOfBirth: "#String - (optional)",
        DateOfBirth: "#String - (optional)",
        CognitoGroupName: "#String - (optional)",
        CardID: "#String - (optional)",
        SocialNumber: "#String - (optional)",
        LicenseNumber: "#String - (optional)",
        PlaceOfResidence: "#String - (optional)",
        TelephoneNumber: "#String - (optional)",
        SignedRegulations: "#String[] - (optional)",
        DCCExpirationDate: "#String - (optional)"
        //UserStatus : "#String - (optional)(PossibleValues[ Active - Deleted ]) - (autofill: Active)"
    }
}