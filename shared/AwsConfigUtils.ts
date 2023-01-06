import AWS, { Credentials } from "aws-sdk";
import { AWSCredentials } from "./AWSCredentials";
import { Resources } from "./Utils/Resources";

export function setupAws() {
    let credentials: Credentials = new Credentials({ accessKeyId: AWSCredentials.accessKey, secretAccessKey: AWSCredentials.secretKey, });
    let opts: AWS.ConfigurationOptions = {
        credentials: credentials,
        region: Resources.REGION
    }
    AWS.config.update(opts);
}