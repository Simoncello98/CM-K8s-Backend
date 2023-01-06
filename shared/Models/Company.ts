/*
  Created by Simone Scionti 

  Company model class.
*/
import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { Model } from "./AbstractClasses/Model";
import { EntityStatus } from "../Utils/Statics/EntityStatus";

@Serializable()
export class Company extends Model {
  @JsonProperty() public CompanyName: string;
  @JsonProperty() public WebsiteURL: string;
  @JsonProperty() public Theme: string;
  @JsonProperty() public Logo: string;
  @JsonProperty() public CompanyStatus: string;
  @JsonProperty() public VATNumber: string;
  @JsonProperty() public BadgeFrontTemplateURL: string;
  @JsonProperty() public BadgeBackTemplateURL: string;


  updateOptionalAtLeastOneAttributes = ["WebsiteURL", "Theme", "Logo", "CompanyStatus", "VATNumber", "BadgeFrontTemplateURL", "BadgeBackTemplateURL"];
  readAndDeleteNecessaryAttributes = ["CompanyName"];
  updateNecessaryAttributes = ["CompanyName"];
  createNecessaryAttributes = ["CompanyName"];

  readAndDeleteExpectedBody = {
    CompanyName: "#String"
  }

  updateExpectedBody = {
    CompanyName: "#String",
    WebsiteURL: "#String - (optional)",
    Theme: "#String - (optional)",
    Logo: "#String - (optional)",
    VATNumber: "#String - (optional)",
    BadgeFrontTemplateURL :  "#String - (optional)",
    BadgeBackTemplateURL :  "#String - (optional)"
    //CompanyStatus : "#String - (optional)(PossibleValues[ Active - Deleted ]) - (autofill: Active)"
  }
  
  createExpectedBody = {
    CompanyName: "#String",
    WebsiteURL: "#String - (optional)",
    Theme: "#String - (optional)",
    Logo: "#String - (optional)",
    VATNumber: "#String - (optional)",
    BadgeFrontTemplateURL :  "#String - (optional)",
    BadgeBackTemplateURL :  "#String - (optional)"
  }

  public constructor() {
    super();
  }
  public autoFillUndefinedImportantAttributes() {
    if (!this.Logo) this.Logo = "";
    if (!this.BadgeFrontTemplateURL) this.BadgeFrontTemplateURL = "";
    if (!this.BadgeBackTemplateURL) this.BadgeBackTemplateURL = "";
    if (!this.Theme) this.Theme = "Blue";
    if (!this.VATNumber) this.VATNumber = "";
    this.CompanyStatus = EntityStatus.ACTIVE;
  }

  public removeUnplannedValues(): void {
    this.CompanyName = undefined;
    this.WebsiteURL = undefined;
    this.Theme = undefined;
    this.Logo = undefined;
    this.CompanyStatus = undefined;
    this.VATNumber = undefined;
    this.BadgeFrontTemplateURL = undefined;
    this.BadgeBackTemplateURL = undefined;
  }

  public toJson(removeUndefined: boolean): Object {
    return serialize(this, removeUndefined);
  }

}