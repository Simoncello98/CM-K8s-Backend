/*
    Created by Simone Scionti 
    Describes the logo map in the DB. 

*/
import { JsonProperty, Serializable, serialize } from 'typescript-json-serializer';
import { ModelNestedObject } from '../AbstractClasses/ModelNestedObject';

@Serializable()
export class Logo extends ModelNestedObject{
    @JsonProperty() public Horizontal : string = "";
    @JsonProperty() public Vertical : string = "";

    //if it's empty, the user hasn't to fill the Logo attributes during the campus creation.
    createNecessaryAttributes = [];
    updateOptionalAtLeastOneAttributes = ["Horizontal" , "Vertical" ];
    
    public constructor(){
        super();
    }

    public toJson(removeUndefined : boolean) : Object{
        return serialize(this, removeUndefined);
    }
}