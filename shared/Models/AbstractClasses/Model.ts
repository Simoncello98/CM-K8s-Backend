/*
  Created by Simone Scionti 
    parent clas sof each actual model class.


*/
import { ModelPropertiesChecker } from "./ModelPropertiesChecker";
import { ModelBodyRequestHandlerInterface } from "../Interfaces/ModelBodyRequestHandlerInterface";

export abstract class Model extends ModelPropertiesChecker implements ModelBodyRequestHandlerInterface {
    //these properties have to be defined from the actual Model class that knows what it needs to expects in any case.
    abstract readAndDeleteExpectedBody: Object;
    abstract updateExpectedBody: Object;
    abstract createExpectedBody: Object;
    
    actionNecessaryAttributes : [string]; //because it doesn't use this array.

    public getReadAndDeleteExpectedBody() : Object {
        return this.readAndDeleteExpectedBody;
    }
    public getCreateExpectedBody() : Object{
        return this.createExpectedBody;
    }
    public getUpdateExpectedBody(): Object{
        return this.updateExpectedBody;
    }
    public  autoFillUndefinedImportantAttributes() : void{
        //do nothing but it can be overrided if is needed.
    }

}