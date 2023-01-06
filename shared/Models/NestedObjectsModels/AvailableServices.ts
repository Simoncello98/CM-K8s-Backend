/*
  Created by Simone Scionti 
    Describe the AvailableService nested object model for the service of a company in a campus. 

*/
import { JsonProperty, Serializable, serialize } from 'typescript-json-serializer';
import { ModelNestedObject } from '../AbstractClasses/ModelNestedObject';

@Serializable()
export class AvailableServices extends ModelNestedObject{
    @JsonProperty() public MealAvailable : boolean;
    @JsonProperty() public IsGymAvailable : boolean;
    @JsonProperty() public IsRoomsBookingAvailable : boolean;

    //if it's empty, the user hasn't to fill the AvailableServices during the campus creation.
    createNecessaryAttributes = [];
    updateOptionalAtLeastOneAttributes = ["MealAvailable" , "IsGymAvailable" , "IsRoomsBookingAvailable"];
    
    public constructor(){
        super();
    }

    public toJson(removeUndefined : boolean) : Object{
        return serialize(this, removeUndefined);
    }

    public autoFillWithUndefinedImportantAttributes(): void {
        if (this.MealAvailable == undefined || this.MealAvailable == null) this.MealAvailable = false;
        if (this.IsGymAvailable == undefined || this.IsGymAvailable == null) this.IsGymAvailable = false;
        if (this.IsRoomsBookingAvailable == undefined || this.IsRoomsBookingAvailable == null) this.IsRoomsBookingAvailable = false;
    }
}