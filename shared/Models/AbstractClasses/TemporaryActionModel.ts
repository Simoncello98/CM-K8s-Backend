import { TempModelBodyRequestHandlerInterface } from "../Interfaces/TempModelBodyRequestHandlerInterface";
/*
  Created by Simone Scionti 

  Class useful to do an action without databae
*/
import { ModelPropertiesChecker } from "./ModelPropertiesChecker";

export abstract class TemporaryActionModel extends ModelPropertiesChecker implements TempModelBodyRequestHandlerInterface{
    
    //all of these arrays are defined here as empty because the subclass that is a nested child of a model doesn't need to fill them. 
    createNecessaryAttributes: [string];
    readAndDeleteNecessaryAttributes: [string];
    updateNecessaryAttributes: [string];
    updateOptionalAtLeastOneAttributes : [string];

    abstract actionExpectedBody: Object;

    public getActionExpectedBody() : Object{
        return this.actionExpectedBody;
    }

    public abstract toJson(removeUndefined : boolean) : Object;

}