/*
  Created by Simone Scionti 
*/

import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { UnmutableModel } from "../AbstractClasses/UnmutableModel";

@Serializable()
export class CampusXStartDate extends UnmutableModel {

    @JsonProperty() public CampusName: string;     //campusID
    @JsonProperty() public StartDate: string;        //StartDate

    readAndDeleteNecessaryAttributes = ["CampusName", "StartDate"];
    createNecessaryAttributes: string[];

    readAndDeleteExpectedBody = {
        CampusName: "#String",
        StartDate: "#String"
    }

    createExpectedBody: object;

    public autoFillUndefinedImportantAttributes(): void {
    }

    public toJson(removeUndefined: boolean): Object {
        return serialize(this, removeUndefined);
    }

}