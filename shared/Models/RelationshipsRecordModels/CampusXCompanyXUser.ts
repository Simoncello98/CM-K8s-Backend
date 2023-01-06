/*
  Created by Simone Scionti 
  describe the relationshiup record between user coampus and company.

*/
import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { Model } from "../AbstractClasses/Model";
import { RecordModelGSIInterface } from "../Interfaces/RelationshipRecordModelGSIInterface";
import { EntityStatus } from "../../Utils/Statics/EntityStatus";
import { UserRole } from "../../Utils/Statics/UserRole";

@Serializable()
export class CampusXCompanyXUser extends Model implements RecordModelGSIInterface {

  @JsonProperty() public Email: string;
  @JsonProperty() public CampusName: string;
  @JsonProperty() public CompanyName: string;
  //TODO:About duplicated attributes: I can get the info from the user info record, or ask the client to put info like FName and LName. Ask to peppe
  @JsonProperty() public FName: string;
  @JsonProperty() public LName: string;
  @JsonProperty() public IsVisitor: boolean = false; //optional - (autofill: false)

  @JsonProperty() public CompanyEmailAlias: string;
  @JsonProperty() public CompanyRole: string;
  @JsonProperty() public CampusRole: string;
  //@JsonProperty() public UserStatus : string;
  @JsonProperty() public UserSerialID: string;

  @JsonProperty() public StartDate: string;
  @JsonProperty() public ExpireDate: string;

  @JsonProperty() public EmploymentContractHours: number;
  @JsonProperty() public TeamName: string;

  @JsonProperty() public GSI1PK: string;
  @JsonProperty() public GSI2PK: string;
  @JsonProperty() public GSI2SK: string;
  //todo add a relationship status
  @JsonProperty() public RelationshipStatus: string;

  updateOptionalAtLeastOneAttributes = ["CompanyEmailAlias", "CompanyRole", "CampusRole", "UserSerialID", "RelationshipStatus", "FName", "LName", "IsVisitor", "StartDate", "ExpireDate", "TeamName", "EmploymentContractHours"];
  readAndDeleteNecessaryAttributes = ["Email", "CompanyName", "CampusName"];
  updateNecessaryAttributes = ["Email", "CompanyName", "CampusName"];


  createNecessaryAttributes = ["Email", "CompanyName", "CampusName"];

  readAndDeleteExpectedBody = {
    CampusName: "#String",
    CompanyName: "#String",
    Email: "#String"
  }

  updateExpectedBody = {
    CampusName: "#String",
    CompanyName: "#String",
    Email: "#String",
    CompanyEmailAlias: "#String - (optional)",
    UserSerialID: "#String - (optional)",
    CompanyRole: "#String - (optional)(PossibleValues[ Admin - Common ]) - (autofill: Common)",
    CampusRole: "#String - (optional)(PossibleValues[ Admin - Common ])  - (autofill: Common)",
    IsVisitor: "#Boolean - (optional)(autofill: false)",
    StartDate: "#String - (optional)",
    ExpireDate: "#String - (optional)",
    TeamName: "#String - (optional)",
    EmploymentContractHours: "#Number - (optional)",
    //RelationshipStatus : "#String - (optional)(PossibleValues[ Active - Deleted ]) - (autofill: Active)"
  }
  createExpectedBody = {
    CampusName: "#String",
    CompanyName: "#String",
    Email: "#String",
    UserSerialID: "#String",
    CompanyEmailAlias: "#String - (optional)",
    CompanyRole: "#String - (optional)(PossibleValues[ Admin - Common ]) - (autofill: Common)",
    CampusRole: "#String - (optional) (ignorable) (PossibleValues[ Admin - Common ]) - (autofill: Common)",
    StartDate: "#String - (optional)",
    ExpireDate: "#String - (optional)",
    TeamName: "#String - (optional)",
    EmploymentContractHours: "#Number - (optional)",
    //RelationshipStatus : "#String - (optional)(PossibleValues[ Active - Deleted ]) - (autofill: Active)"
  }

  public constructor() {
    super();
  }

  public createGSIAttributes(): void {
    this.GSI1PK = "#USER#X#COMPANY<" + this.CompanyName + ">";
    this.GSI2PK = "#CAMPUS#X#COMPANY#X#USER<" + this.Email + ">";
    this.GSI2SK = "#CAMPUS<" + this.CampusName + ">#COMPANY<" + this.CompanyName + ">";
  }

  public autoFillUndefinedImportantAttributes(): void {
    if (!this.CompanyRole || this.CompanyRole === null) this.CompanyRole = UserRole.COMMON;
    if (!this.CampusRole || this.CampusRole === null) this.CampusRole = UserRole.COMMON;
    if (!this.TeamName) this.TeamName = "none";
    if (!this.EmploymentContractHours || this.EmploymentContractHours === null) this.EmploymentContractHours = 0;
    this.RelationshipStatus = EntityStatus.ACTIVE;
  }

  public autoFillUndefinedImportantAttributesForVisitor(): void {
    this.autoFillUndefinedImportantAttributes();
    this.IsVisitor = true;
  }

  public validValues(): boolean {
    //TODO: to use the UserRole inteface to check trough a loop.
    if ((this.CampusRole != undefined && this.CampusRole != UserRole.ADMIN && this.CampusRole != UserRole.COMMON) || (this.CompanyRole != undefined && this.CompanyRole != UserRole.ADMIN && this.CompanyRole != UserRole.COMMON))
      return false;
    else return true;
  }

  public toJson(removeUndefined: boolean): Object {
    return serialize(this, removeUndefined);
  }

}