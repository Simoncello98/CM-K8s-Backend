/*
  Created by Simone Scionti 

    User model class.

*/
import { JsonProperty, Serializable, serialize } from "typescript-json-serializer";
import { CognitoGroupsName } from "../Utils/Enums/CognitoGroupsName";
import { Resources } from "../Utils/Resources";
import { EntityStatus } from "../Utils/Statics/EntityStatus";
import { Model } from "./AbstractClasses/Model";

@Serializable()
export class User extends Model {
    @JsonProperty() public Email: string;
    @JsonProperty() public FName: string;
    @JsonProperty() public LName: string;
    @JsonProperty() public CardID: string;
    @JsonProperty() public LicenseNumber: string;
    @JsonProperty() public SocialNumber: string;
    @JsonProperty() public PlaceOfResidence: string;
    @JsonProperty() public PlaceOfBirth: string;
    @JsonProperty() public DateOfBirth: string;
    @JsonProperty() public UserStatus: string; // [Active - Deleted]
    @JsonProperty() public UserPhoto: string; //optional - bucketKey
    @JsonProperty() public TelephoneNumber: string; //optional
    @JsonProperty() public IsVisitor: boolean = false; //optional - (default: false)
    // @JsonProperty() public ConsentToProcessingData: boolean = false;
    // @JsonProperty() public CampusRegulations: boolean = false;
    // @JsonProperty() public WorkplaceAccessSelfDeclaration: boolean = false;
    @JsonProperty() public SignedRegulations: string[];
    @JsonProperty() public DCCExpirationDate: string;

    //cognito params
    @JsonProperty() public CognitoClientID: string; //used for ref to cognito
    @JsonProperty() public TemporaryPassword: string; //used for  cognito
    @JsonProperty() public CognitoGroupName: CognitoGroupsName;
    @JsonProperty() public CreationTimestamp: string;

    //@JsonProperty() public AdminInCampuses : string[]; // The other solution is to set an attr in the campus info, with the ID of the Admins, but we need to handle the deletion of user in that case.


    updateOptionalAtLeastOneAttributes = ["FName", "LName", "CardID", "LicenseNumber", "SocialNumber", "PlaceOfResidence", "PlaceOfBirth", "DateOfBirth", "UserStatus", "UserPhoto", "TelephoneNumber", "IsVisitor", "SignedRegulations", "CognitoGroupName", "DCCExpirationDate"];
    readAndDeleteNecessaryAttributes = ["Email"];
    updateNecessaryAttributes = ["Email"];
    createNecessaryAttributes = [/*"Email",*/ "FName", "LName", "CognitoClientID", "PlaceOfBirth", "DateOfBirth"];

    readAndDeleteExpectedBody = {
        Email: "#String - (required)"
    }

    //TODO: If i allow to update FName and LName i need to update them also in all the relationships records of the user.
    updateExpectedBody = {
        Email: "#String - (required)",
        FName: "#String - (optional)",
        LName: "#String - (optional)",
        CognitoClientID: "#String - (optional)",
        CognitoGroupName: "#String - (optional)",
        CardID: "#String - (optional)",
        DateOfBirth: "#String - (optional)",
        SocialNumber: "#String - (optional)",
        LicenseNumber: "#String - (optional)",
        PlaceOfResidence: "#String - (optional)",
        PlaceOfBirth: "#String - (optional)",
        UserPhoto: "#String - (optional)",
        UserStatus: "#String - (optional)(PossibleValues[ Active - Deleted ]) - (autofill: Active)",
        TelephoneNumber: "#String - (optional)",
        IsVisitor: "#Boolean - (optional) - (autofill: false)",
        SignedRegulations: "#String[] - (optional)",
        DCCExpirationDate: "#String - (optional)"
    }

    createExpectedBody = {
        Email: "#String - (required)",
        FName: "#String - (required)",
        LName: "#String - (required)",
        CognitoClientID: "#String - (required)",
        PlaceOfBirth: "#String - (required)",
        DateOfBirth: "#String - (required)",
        CognitoGroupName: "#String - (optional)",
        CardID: "#String - (optional)",
        SocialNumber: "#String - (optional)",
        LicenseNumber: "#String - (optional)",
        PlaceOfResidence: "#String - (optional)",
        TelephoneNumber: "#String - (optional)",
        SignedRegulations: "#String[] - (optional)",
        DCCExpirationDate: "#String - (optional)"
        //UserStatus : "#String - (optional)(PossibleValues[ Active - Deleted ]) - (autofill: Active)"
    }


    public toJson(removeUndefined: boolean): Object {
        return serialize(this, removeUndefined);
    }

    public removeCognitoParams() {
        this.CognitoClientID = undefined;
        this.TemporaryPassword = undefined;
    }

    public autoFillUndefinedImportantAttributes(): void {
        if (!this.UserPhoto) this.UserPhoto = "";
        if (this.IsVisitor === undefined || this.IsVisitor === null) this.IsVisitor = false;
        if (!this.SocialNumber) this.SocialNumber = "";
        if (!this.TelephoneNumber) this.TelephoneNumber = "";
        if (!this.PlaceOfBirth) this.PlaceOfBirth = "";
        if (!this.DateOfBirth) this.DateOfBirth = "";
        if (!this.CardID) this.CardID = "";
        if (!this.DCCExpirationDate) this.DCCExpirationDate = "";
        this.UserStatus = EntityStatus.ACTIVE;
        this.TemporaryPassword = this.generateTemporaryPassword();
        if (!this.CreationTimestamp) this.CreationTimestamp = new Date().toISOString();
    }

    private generateTemporaryPassword(): string {
        return Resources.DefaultPasswordForNewUsers
    }

    public autoFillUndefinedImportantAttributesForVisitors(): void {
        this.autoFillUndefinedImportantAttributes();
        this.IsVisitor = true;
    }

    public constructor() {
        super();
    }

    public removeUnplannedValues(): void {
        delete this.Email;
        delete this.FName;
        delete this.LName;
        delete this.CardID;
        delete this.LicenseNumber;
        delete this.SocialNumber;
        delete this.PlaceOfResidence;
        delete this.PlaceOfBirth;
        delete this.DateOfBirth;
        delete this.UserStatus;
        delete this.UserPhoto;
        delete this.TelephoneNumber;
        delete this.IsVisitor;
        delete this.CognitoClientID;
        delete this.TemporaryPassword;
        delete this.CognitoGroupName;
        delete this.SignedRegulations;
        delete this.DCCExpirationDate;
        delete this.CreationTimestamp;
    }

    public autoFillEmailWithStandardDomain(): boolean {
        if (this.FName && this.LName) {
            let fname: string = this.FName.toLowerCase().substring(0, 15);
            let lname: string = this.LName.toLowerCase().substring(0, 15);

            fname = fname.replace(/è|é|ê|ë/g, "e").replace(/ò|ô|õ|ö/g, "o").replace(/à|â|ã|ä|å/g, "a").replace(/ò|ô|õ|ö/g, "o").replace(/ì|î|ï/g, "i").replace(/ù|û|ü/g, "u").replace(/'|\s/g, "");
            lname = lname.replace(/è|é|ê|ë/g, "e").replace(/ò|ô|õ|ö/g, "o").replace(/à|â|ã|ä|å/g, "a").replace(/ò|ô|õ|ö/g, "o").replace(/ì|î|ï/g, "i").replace(/ù|û|ü/g, "u").replace(/'|\s/g, "");

            let max = 99;
            let min = 10;
            let number: number = Math.floor(Math.random() * (max - min + 1)) + min;

            this.Email = fname + "." + lname + "." + number + "@cm.com";
            return false; // ok
        }
        return true; // error
    }
}