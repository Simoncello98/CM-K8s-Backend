/*
  Created by Simone Scionti 
*/
import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { Model } from "../AbstractClasses/Model";
import { AvailableServices } from "../NestedObjectsModels/AvailableServices";
import { RecordModelGSIInterface } from "../Interfaces/RelationshipRecordModelGSIInterface";
import { EntityStatus } from "../../Utils/Statics/EntityStatus";

@Serializable()
export class CampusXCompany extends Model implements RecordModelGSIInterface{
    
    @JsonProperty() public CampusName : string;  
    @JsonProperty() public CompanyName : string;
    @JsonProperty() public AvailableServices : AvailableServices; 
    @JsonProperty() public GSI1PK : string;
    @JsonProperty() public RelationshipStatus : string;
    @JsonProperty() public CompanyLogo: string;
    
    updateOptionalAtLeastOneAttributes =  ["AvailableServices", "RelationshipStatus", "CompanyLogo"];
    readAndDeleteNecessaryAttributes =  ["CampusName","CompanyName"];
    updateNecessaryAttributes =  ["CampusName" ,"CompanyName"];
    createNecessaryAttributes =  ["CampusName", "CompanyName"];

    readAndDeleteExpectedBody = {
        CampusName : "#String",
        CompanyName : "#String"
      }
    
    updateExpectedBody = {
        CampusName : "#String",
        CompanyName : "#String",
        AvailableServices  : "#AvailableServices - (optional)",
        CompanyLogo: "#String - (optional)"
        //RelationshipStatus : "#String - (optional)(PossibleValues[ Active - Deleted ]) - (autofill: Active)"
      }
    createExpectedBody = {
        CampusName : "#String",
        CompanyName : "#String",
        AvailableServices  : "#AvailableServices - (optional)",
        CompanyLogo: "#String - (optional)"
        //RelationshipStatus : "#String - (optional)(PossibleValues[ Active - Deleted ]) - (autofill: Active)"
      }

    public constructor(){
        super();
    }
    
    public createGSIAttributes() : void{
      this.GSI1PK = "#COMPANY<"+ this.CompanyName +">";
      this.RelationshipStatus = EntityStatus.ACTIVE;
    }

    public autoFillUndefinedImportantAttributes(): void {
      if (this.AvailableServices == undefined || this.AvailableServices == null) {
        this.AvailableServices = new AvailableServices();
        this.AvailableServices.autoFillWithUndefinedImportantAttributes();
      }
      if (this.CompanyLogo === undefined || this.CompanyLogo === null) this.CompanyLogo = "";
    }

    public toJson(removeUndefined : boolean) : Object{
        return serialize(this, removeUndefined);
    }

}