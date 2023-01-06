/*
    Created by Simone Scionti

*/

import { Serializable, serialize } from "typescript-json-serializer";
import { VisitorRequest } from "./VisitorRequest";


@Serializable()
export class MyVisitorRequest extends VisitorRequest {

    readAndDeleteNecessaryAttributes = ["CampusName", "VisitorEmail", "VisitorRequestID"];
    updateOptionalAtLeastOneAttributes = ["VisitorTelephoneNumber", "EstimatedDateOfArrival", "EstimatedReleaseDate", "VisitorRequestStatus", "GSI2SK"];
    updateNecessaryAttributes = ["CampusName", "VisitorEmail", "VisitorRequestID"];
    createNecessaryAttributes = ["CampusName", "VisitorEmail", "EstimatedDateOfArrival","EstimatedReleaseDate", "UserHostCompanyName"];

    readAndDeleteExpectedBody = {
        CampusName: "#String",
        VisitorEmail: "#String",
        VisitorRequestID: "#String"
    }

    updateExpectedBody = {
        CampusName: "#String - (required)",
        VisitorEmail: "#String - (required)",
        VisitorRequestID: "#String - (required)",
        VisitorTelephoneNumber: "#String - (optional)",
        EstimatedDateOfArrival: "#String - (optional)",
        EstimatedReleaseDate: "#String - (optional)",
        UserHostEmail: "#String - (optional)",
        UserHostTelephoneNumber: "#String - (optional)",
        UserHostCompanyName: "#String - (optional)",
        VisitorRequestStatus: "#String - (optional)(PossibleValues[ALL, PENDING, ACEPTED, DENIED]) - (autofill: PENDING)"
    }

    createExpectedBody = {
        CampusName: "#String - (required)",
        VisitorEmail: "#String - (required)",
        EstimatedDateOfArrival: "#String - (required)",
        EstimatedReleaseDate: "#String - (required)",
        UserHostCompanyName: "#String - (required)",
        UserHostEmail: "#String - (optional)",
        UserHostTelephoneNumber: "#String - (optional)",
        VisitorTelephoneNumber: "#String - (optional)",
        VisitorRequestStatus: "#String - (optional)(PossibleValues[ALL, PENDING, ACEPTED, DENIED]) - (autofill: PENDING)"
    }



    public toJson(removeUndefined: boolean): Object {
        return serialize(this, removeUndefined);
    }

    public constructor() {
        super();
    }

    public setHost(email: string, telephoneNumber: string, companyName: string) {
        this.UserHostEmail = email;
        this.UserHostTelephoneNumber = telephoneNumber;
        this.UserHostCompanyName = companyName;
    }
}