/*
  Created by Simone Scionti 
*/

import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { StartDateEnum } from "../../Utils/Enums/StartDateEnum";
import { Utils } from "../../Utils/Utils";
import { UnmutableModel } from "../AbstractClasses/UnmutableModel";

@Serializable()
export class Log extends UnmutableModel {
    
    @JsonProperty() public StartDate : string;
    @JsonProperty() public LimitRecords : number;

    readAndDeleteNecessaryAttributes = ["StartDate"];
    createNecessaryAttributes: string[];

    readAndDeleteExpectedBody =  {
        StartDate: "#String",
        LimitRecords: "#String (optional)"
    }

    createExpectedBody = {}
    

    public autoFillUndefinedImportantAttributes(startDate: StartDateEnum = StartDateEnum.ThisMonth) : void {
        if(!this.StartDate || !Utils.getUniqueInstance().isValidDate(this.StartDate)) {
            this.StartDate = Utils.getUniqueInstance().getCurrentDateTime().substr(0, startDate);
        }

       /* if(!this.LimitRecords || this.LimitRecords === null || this.LimitRecords <= 0) {
            this.LimitRecords = 25
        }*/
    }

    public toJson(removeUndefined : boolean) : Object{
        return serialize(this, removeUndefined);
    }

}