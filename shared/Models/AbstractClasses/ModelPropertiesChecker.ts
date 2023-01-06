/*
  Created by Simone Scionti 

  Delegate to check for properties values for each model class in each crud operation.
*/
import { ModelNecessaryQueryInfoInterface } from "../Interfaces/ModelNecessaryQueryInfoInterface";

export abstract class ModelPropertiesChecker implements ModelNecessaryQueryInfoInterface{

    abstract updateOptionalAtLeastOneAttributes : string[];
    abstract readAndDeleteNecessaryAttributes: string[];
    abstract updateNecessaryAttributes: string[];
    abstract createNecessaryAttributes: string[];  
    abstract actionNecessaryAttributes: string[];
    
    /* 
    Returns enoughInfoForReadAndDelete. Just because the name is better in the case of update lambda functions.
    */
    public enoughInfoForAction(): boolean{
        return this.recursiveAllDefinedAttributesCheck(this,"actionNecessaryAttributes");
    } 

    public isPKDefined() : boolean{
        return this.enoughInfoForReadOrDelete();
    }

    //the actual model class has to define how Update info are defined for itself.
    public enoughInfoForUpdate() : boolean {
        return this.recursiveAllDefinedAttributesCheck(this,"updateNecessaryAttributes") && this.recursiveAtLeastOneDefinedAttributesCheck(this, "updateOptionalAtLeastOneAttributes");
    } 

    //the actual model class has to define which are the necessary info for a Create Query.
    public enoughInfoForCreate() : boolean {
        //check also empty strings
        return this.recursiveAllDefinedAttributesCheck(this,"createNecessaryAttributes",true);
    } 

    public enoughInfoForReadOrDelete(): boolean{
        return this.recursiveAllDefinedAttributesCheck(this,"readAndDeleteNecessaryAttributes");
    }

    //it returns true as default. The subclass has to redefine it if has some stringsets attributes.  
    public validValues() : boolean {
        return true;
    }

    //it uses a modelPropertyChecker object that will has an instance of a specific model class. So if i'll go inside in a nested child, i'll pass the nested child object and i will have another array of atLeastOneOptionalAtributes defined.
    private recursiveAllDefinedAttributesCheck(actualItem : ModelPropertiesChecker , sourceArrayAttributesName : string, checkEmptyStrings? : boolean) : boolean{
        if(!actualItem) return false;
        let sourceKeysArray = actualItem[sourceArrayAttributesName];
        for(let index in sourceKeysArray){
            let key = sourceKeysArray[index];
            let value = actualItem[key];
            //if we find also just one value that is undefined we return undefined. 
            if(typeof(value) != "object" || Array.isArray(value)){ //this object attributes - base recursive case
                if( value == undefined || value == null) return false;
                if(checkEmptyStrings && value === "") return false;
            }
            else { //nested child
                let nestedObjectHasUndefinedValue = this.recursiveAllDefinedAttributesCheck(actualItem[key],sourceArrayAttributesName);
                if(!nestedObjectHasUndefinedValue) return false;   
            }
        }
        //we will return true only if we didn't found any undefined value.
        return true;
    }

    //TODO: fix for array as nested object. 
    private recursiveAtLeastOneDefinedAttributesCheck(actualItem : ModelPropertiesChecker , sourceArrayAttributesName : string):boolean{
        if(!actualItem) return false;
        let sourceKeysArray = actualItem[sourceArrayAttributesName];
        for(let index in sourceKeysArray){
            let key = sourceKeysArray[index];
            let value = actualItem[key];
            
            //this if is inverted because if we found a defined attribute in the top level object, we can say that at least one is defined and don't check in nested childs. 
            if(typeof(value) != "object" || Array.isArray(value)){ //this object attributes - base recursive case
                if( value != undefined && value != null) return true; 
            }
            else{ //nested child
                let nestedObjectHasAtLeastOneDefined = this.recursiveAtLeastOneDefinedAttributesCheck(actualItem[key], sourceArrayAttributesName);
                if(nestedObjectHasAtLeastOneDefined) return true;
            }
        }
        return false;
    }

    public abstract toJson(removeUndefined : boolean) : Object;
}