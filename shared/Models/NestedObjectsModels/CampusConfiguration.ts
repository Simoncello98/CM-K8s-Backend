/*
  Created by Simone Scionti 
  Descrtibe the configuration of a Company in a Campus. 
*/
import { JsonProperty, Serializable, serialize } from 'typescript-json-serializer';
import { ModelNestedObject } from '../AbstractClasses/ModelNestedObject';

@Serializable()
export class CampusConfiguration extends ModelNestedObject{
    @JsonProperty() public MealActive : boolean;
    @JsonProperty() public IsBookingActive : boolean;

    //if it's empty, the user hasn't to fill the IPConfiguration during the campus creation.
    createNecessaryAttributes = [];
    //uncomment next line if you want to force the user to fill all data to create a campus. 
    //createNecessaryAttributes = ["MealActive" , "IsBookingActive"]; 
    updateOptionalAtLeastOneAttributes = ["MealActive" , "IsBookingActive" ];
    
    public constructor(){
        super();
    }

    public toJson(removeUndefined : boolean) : Object{
        return serialize(this, removeUndefined);
    }

    public autoFillWithUndefinedImportantAttributes(): void {
        if (this.MealActive == undefined || this.MealActive == null) this.MealActive = false;
        if (this.IsBookingActive == undefined || this.IsBookingActive == null) this.IsBookingActive = false;
    }
}