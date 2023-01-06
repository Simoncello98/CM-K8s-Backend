/*
  Created by Simone Scionti
*/

import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { UnmutableModel } from "../AbstractClasses/UnmutableModel";

@Serializable()
export class CampusXCompanyXStartDate extends UnmutableModel {
    
    @JsonProperty() public CampusName: string;     //campusID
    @JsonProperty() public CompanyName: string;     //companyID
    @JsonProperty() public StartDate: string;        //StartDate
    
    readAndDeleteNecessaryAttributes = ["CampusName", "CompanyName", "StartDate"];
    createNecessaryAttributes: string[];

    readAndDeleteExpectedBody = {
        CampusName: "#String",
        CompanyName: "#String",
        StartDate: "#String"
    }

    createExpectedBody: object;

    public autoFillUndefinedImportantAttributes(): void {
    }

    public toJson(removeUndefined: boolean): Object {
        return serialize(this, removeUndefined);
    }

}