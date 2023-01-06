/*
  Created by Simone Scionti 
*/

import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { VisitorRequestStatus } from "../../Utils/Enums/VisitorRequestStatus";
import { UnmutableModel } from "../AbstractClasses/UnmutableModel";

@Serializable()
export class CampusXVisitorRequestStatus extends UnmutableModel {

    @JsonProperty() public CampusName: string;             //campusID
    @JsonProperty() public VisitorRequestStatus: string;   //es: ALL - PENDING - DENIED - ....

    readAndDeleteNecessaryAttributes = ["CampusName"];
    createNecessaryAttributes: string[];

    readAndDeleteExpectedBody = {
        CampusName: "#String - (required)",
        VisitorRequestStatus: "#String - (optional)[autofill: ALL]"
    }

    createExpectedBody: object;

    public autoFillUndefinedImportantAttributes(): void {
        if (!this.VisitorRequestStatus) this.VisitorRequestStatus = VisitorRequestStatus.ALL;
    }

    public toJson(removeUndefined: boolean): Object {
        return serialize(this, removeUndefined);
    }

}