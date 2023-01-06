import { setupAws } from "./AwsConfigUtils";

export var stage = "test";

export function configureEnvironment(){
    setupAws();
    //TODO: add otther things
}