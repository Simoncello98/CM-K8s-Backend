/*
  Created by Simone Scionti 

  Campus model class
*/
import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { CampusConfiguration } from "./NestedObjectsModels/CampusConfiguration";
import { Model } from "./AbstractClasses/Model";
import { EntityStatus } from "../Utils/Statics/EntityStatus";

@Serializable()
export class Campus extends Model {
    @JsonProperty() public CampusName: string;
    @JsonProperty() public ISCampusConfiguration: CampusConfiguration;
    @JsonProperty() public Address: string
    @JsonProperty() public WebsiteURL: string;
    @JsonProperty() public Theme: string;
    @JsonProperty() public Logo: string;
    @JsonProperty() public CampusStatus: string;
    @JsonProperty() public PlantsId: string[];


    updateOptionalAtLeastOneAttributes = ["ISCampusConfiguration", "WebsiteURL", "Address", "Theme", "Logo", "CampusStatus"];
    readAndDeleteNecessaryAttributes = ["CampusName"];
    updateNecessaryAttributes = ["CampusName"];
    createNecessaryAttributes = ["CampusName"]; //ISCampusConfiguration is not a necessary Attribute because we can create a Campus without any config, and add the config trough update later.

    readAndDeleteExpectedBody = {
        CampusName: "#String"
    }
    updateExpectedBody = {
        CampusName: "#String",
        ISCampusConfiguration: "#ISCampusConfiguration - [Optional childs]",
        Address: "#String - (optional)",
        WebsiteURL: "#String - (optional)",
        Theme: "#String - (optional) - (autofill: Blue)",
        Logo: "#String - (optional)",
        CampusStatus: "#String - (optional)(PossibleValues[ Active - Deleted ]) - (autofill: Active)"
    }
    createExpectedBody = {
        CampusName: "#String",
        ISCampusConfiguration: "#ISCampusConfiguration - (optional) (only true values)",
        Address: "#String - (optional)",
        WebsiteURL: "#String - (optional)",
        Theme: "#String - (optional) - (autofill: Blue)",
        Logo: "#String - (optional)",
        //CampusStatus : "#String - (optional)(PossibleValues[ Active - Deleted ]) - (autofill: Active)"
    }

    public constructor() {
        super();
    }

    public autoFillUndefinedImportantAttributes() {
        if (!this.Logo) this.Logo = "";
        if (this.ISCampusConfiguration === undefined || this.ISCampusConfiguration === null) {
            this.ISCampusConfiguration = new CampusConfiguration();
            this.ISCampusConfiguration.autoFillWithUndefinedImportantAttributes();
        }
        if (!this.Theme) this.Theme = "Blue";
        this.CampusStatus = EntityStatus.ACTIVE;
    }

    public removeUnplannedValues(): void {
        this.CampusName = undefined;
        this.ISCampusConfiguration = undefined;
        this.Address = undefined;
        this.WebsiteURL = undefined;
        this.Theme = undefined;
        this.Logo = undefined;
        this.CampusStatus = undefined;
    }

    public toJson(removeUndefined: boolean): Object {
        return serialize(this, removeUndefined);
    }
}