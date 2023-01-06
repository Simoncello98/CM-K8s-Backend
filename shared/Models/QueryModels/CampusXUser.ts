/*
  Created by Simone Scionti 
*/

import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { Model } from "../AbstractClasses/Model";
import { RecordModelGSIInterface } from "../Interfaces/RelationshipRecordModelGSIInterface";
import { EntityStatus } from "../../Utils/Statics/EntityStatus";
import { UserRole } from "../../Utils/Statics/UserRole";

@Serializable()
export class CampusXUser extends Model implements RecordModelGSIInterface {
    
    @JsonProperty() public Email : string;  
    @JsonProperty() public CampusName : string;
    //TODO:About duplicated attributes: I can get the info from the user info record, or ask the client to put info like FName and LName. Ask to peppe
    @JsonProperty() public FName : string;
    @JsonProperty() public LName : string;

    @JsonProperty() public GSI1PK : string;
    @JsonProperty() public CampusRole : string;
    //@JsonProperty() public UserStatus : string;
    @JsonProperty() public UserSerialID : string;

    @JsonProperty() public GSI2PK : string;
    @JsonProperty() public GSI2SK : string;
    //todo add a relationship status
    @JsonProperty() public RelationshipStatus : string;

    updateOptionalAtLeastOneAttributes =  ["CampusRole", "UserSerialID", "RelationshipStatus", "FName", "LName"];
    readAndDeleteNecessaryAttributes =  ["Email", "CampusName"]; 
    updateNecessaryAttributes = ["Email", "CampusName"];

    //it should be with FName and LName if i ask the Client to pass me also this info.. 
    createNecessaryAttributes = ["Email", "CampusName"];

    readAndDeleteExpectedBody = {
        CampusName : "#String",
        Email : "#String"
      }
    
    updateExpectedBody = {
        CampusName : "#String",
        Email : "#String",
        UserSerialID  : "#String - (optional)",
        CampusRole: "#String - (optional)(PossibleValues[ Admin - Common ])  - (autofill: Common)",
        //RelationshipStatus : "#String - (optional)(PossibleValues[ Active - Deleted ]) - (autofill: Active)"
      }
    createExpectedBody = {
        CampusName : "#String",
        Email : "#String",
        UserSerialID  : "#String - (optional)",
        CampusRole: "#String - (optional) (ignorable) (PossibleValues[ Admin - Common ]) - (autofill: Common)",
        //RelationshipStatus : "#String - (optional)(PossibleValues[ Active - Deleted ]) - (autofill: Active)"
      }

    public constructor(){
        super();
    }

    public createGSIAttributes() : void {
        this.GSI2PK = "#CAMPUS#X#COMPANY#X#USER<"+this.Email+">";
        this.GSI2SK = "#CAMPUS<"+this.CampusName+">";
    }
  
    public autoFillUndefinedImportantAttributes() : void {
      if(!this.CampusRole) this.CampusRole = UserRole.COMMON;
      this.RelationshipStatus = EntityStatus.ACTIVE;
    }

    public validValues() : boolean{
      //TODO: to use the UserRole inteface to check trough a loop.
      if((this.CampusRole != undefined && this.CampusRole != UserRole.ADMIN && this.CampusRole != UserRole.COMMON)) 
      return false;
      else return true;
    }

    public toJson(removeUndefined : boolean) : Object{
        return serialize(this, removeUndefined);
    }

}