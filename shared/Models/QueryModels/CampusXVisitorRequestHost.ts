/*
  Created by Simone Scionti 
*/

import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { VisitorRequestStatus } from "../../Utils/Enums/VisitorRequestStatus";
import { CampusXVisitorRequestStatus } from "./CampusXVisitorRequestStatus";

@Serializable()
export class CampusXVisitorRequestHost extends CampusXVisitorRequestStatus {

    @JsonProperty() public CampusName: string;             //campusID
    @JsonProperty() public VisitorRequestStatus: string;   //es: ALL - PENDING - DENIED - ....
    @JsonProperty() public HostEmail: string;

    readAndDeleteNecessaryAttributes = ["CampusName", "HostEmail"];
    createNecessaryAttributes: string[];

    readAndDeleteExpectedBody = {
        CampusName: "#String - (required)",
        HostEmail: "#String - (required)",
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