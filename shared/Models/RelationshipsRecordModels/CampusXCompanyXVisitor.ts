/*
  Created by Simone Scionti 
  describe the relationshiup record between user coampus and company.

*/
import { Serializable } from "typescript-json-serializer";
import { CampusXCompanyXUser } from "./CampusXCompanyXUser";

@Serializable()
export class CampusXCompanyXVisitor extends CampusXCompanyXUser {

  createNecessaryAttributes = ["Email", "CompanyName", "CampusName"]; //without UserSerialID

  createExpectedBody = {
    CampusName: "#String",
    CompanyName: "#String",
    Email: "#String",
    UserSerialID: "#String - (optional)",
    CompanyEmailAlias: "#String - (optional)",
    CompanyRole: "#String - (optional)(PossibleValues[ Admin - Common ]) - (autofill: Common)",
    CampusRole: "#String - (optional) (ignorable) (PossibleValues[ Admin - Common ]) - (autofill: Common)",
    StartDate: "#String - (optional)",
    ExpireDate: "#String - (optional)",
    //RelationshipStatus : "#String - (optional)(PossibleValues[ Active - Deleted ]) - (autofill: Active)"
    TeamName: "#String - (optional)",
    EmploymentContractHours: "#Number - (optional)"
  }

  public constructor() {
    super();
  }
}