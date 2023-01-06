/*
  Created by Simone Scionti 

  Class to inherit by models that are not  top level, but nested objects, like CampusConfiguration 
*/
import { ModelPropertiesChecker } from "./ModelPropertiesChecker";

export abstract class ModelNestedObject extends ModelPropertiesChecker{
    //all of these arrays are defined here as empty because the subclass that is a nested child of a model doesn't need to fill them. 
    readAndDeleteNecessaryAttributes: [string];
    updateNecessaryAttributes: [string];

    actionNecessaryAttributes: [string];

    public abstract toJson(removeUndefined : boolean) : Object;

}