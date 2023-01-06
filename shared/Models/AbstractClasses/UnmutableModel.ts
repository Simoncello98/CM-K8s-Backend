/*
  Created by Simone Scionti 
    parent clas sof each actual unmutable model class.


*/
import { Model } from "./Model";

export abstract class UnmutableModel extends Model {
    updateExpectedBody: Object = {}; //it is implemented so the child class does not have to implement it. 

    //PropertiesChecker methods overrides for unmutable child model.
    updateOptionalAtLeastOneAttributes: string[] = [];  //implemented cause of unmutable( so child class will not have to implement it)
    updateNecessaryAttributes: string[] = []; //implemented cause of unmutable( so child class will not have to implement it)
    //update is denied for a child class. 
    public enoughInfoForUpdate() : boolean {
        return false;
    } 

}