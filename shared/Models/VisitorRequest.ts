/*
    Created by Simone Scionti

*/

import { JsonProperty, Serializable, serialize } from "typescript-json-serializer";
import { Utils } from "../Utils/Utils";
import { Model } from "./AbstractClasses/Model";
import { RecordModelGSIInterface } from "./Interfaces/RelationshipRecordModelGSIInterface";
import { VisitorRequestStatus } from "../Utils/Enums/VisitorRequestStatus";

@Serializable()
export class VisitorRequest extends Model implements RecordModelGSIInterface {

    @JsonProperty() public CampusName: string;
    @JsonProperty() public VisitorEmail: string;
    @JsonProperty() public VisitorRequestID: string;       //uuid - (autofill)

    @JsonProperty() public UserHostEmail: string;
    @JsonProperty() public UserHostTelephoneNumber: string;
    @JsonProperty() public UserHostCompanyName: string;

    @JsonProperty() public VisitorTelephoneNumber: string;
    @JsonProperty() public EstimatedDateOfArrival: string;
    @JsonProperty() public EstimatedReleaseDate: string;
    @JsonProperty() public RequestTimestamp: string;
    @JsonProperty() public VisitorRequestStatus: string;          //[ALL, PENDING, ACEPTED, DENIED]
    @JsonProperty() public VisitorFName: string;
    @JsonProperty() public VisitorLName: string;
    @JsonProperty() public UserHostFName: string;
    @JsonProperty() public UserHostLName: string;

    @JsonProperty() public GSI2PK: string;
    @JsonProperty() public GSI2SK: string;


    readAndDeleteNecessaryAttributes = ["CampusName", "VisitorEmail", "VisitorRequestID"];
    updateOptionalAtLeastOneAttributes = ["VisitorTelephoneNumber", "UserHostEmail", "UserHostTelephoneNumber", "UserHostCompanyName", "EstimatedDateOfArrival", "EstimatedReleaseDate", "VisitorRequestStatus", "GSI2SK", "VisitorFName", "VisitorLName"];
    updateNecessaryAttributes = ["CampusName", "VisitorEmail", "VisitorRequestID"];
    createNecessaryAttributes = ["CampusName", "VisitorEmail", "UserHostEmail", "UserHostCompanyName", "UserHostTelephoneNumber", "EstimatedDateOfArrival", "EstimatedReleaseDate"];

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
        UserHostEmail: "#String - (required)",
        UserHostCompanyName: "#String - (required)",
        UserHostTelephoneNumber: "#String - (required)",
        EstimatedDateOfArrival: "#String - (required)",
        EstimatedReleaseDate: "#String - (required)",
        VisitorTelephoneNumber: "#String - (optional)",
        VisitorRequestStatus: "#String - (optional)(PossibleValues[ALL, PENDING, ACEPTED, DENIED]) - (autofill: PENDING)"
    }



    public toJson(removeUndefined: boolean): Object {
        return serialize(this, removeUndefined);
    }

    public constructor() {
        super();
    }

    public autoFillUndefinedImportantAttributes(): void {
        this.RequestTimestamp = Utils.getUniqueInstance().getCurrentDateTime();

        /*if (!this.EstimatedReleaseDate || !Utils.getUniqueInstance().isValidDate(this.EstimatedReleaseDate)) {
            this.EstimatedReleaseDate = Utils.getUniqueInstance().getCurrentDateTime().substr(0, 10) + "T23:59:59.999"
        }*/

        if (!this.VisitorRequestStatus) this.VisitorRequestStatus = VisitorRequestStatus.PENDING;
        if (!this.VisitorFName) this.VisitorFName = "";
        if (!this.VisitorLName) this.VisitorLName = "";
    }

    public createGSIAttributes(): void {
        this.GSI2PK = "#VISITOR#CAMPUS<" + this.CampusName + ">";
        this.GSI2SK = "#" + this.VisitorRequestStatus + "#VISITOR<" + this.VisitorEmail + ">";
    }

    public expireVisitorRequest(): void {
        this.EstimatedReleaseDate = Utils.getUniqueInstance().getCurrentDateTime();
        this.VisitorRequestStatus = VisitorRequestStatus.EXPIRED;
        this.GSI2SK = "#" + VisitorRequestStatus.EXPIRED + "#VISITOR<" + this.VisitorEmail + ">";
    }

    public changeVisitorStatus(status: string): void {
        this.VisitorRequestStatus = status;
        this.GSI2SK = "#" + status + "#VISITOR<" + this.VisitorEmail + ">";
    }
}