import { setupAws } from "./AwsConfigUtils";
import { Resources } from "./Utils/Resources";


export function configureEnvironment(){
    setupAws();
    console.log("Environment started for stage: " + Resources.stage);
    console.log(Resources.IA_TABLE);
    //TODO: add otther things
}