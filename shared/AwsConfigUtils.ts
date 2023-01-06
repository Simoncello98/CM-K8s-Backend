import AWS, { Credentials } from "aws-sdk";
import { Resources } from "./Utils/Resources";

export function setupAws() {
    let credentials: Credentials = new Credentials({ accessKeyId: "AKIA3I6XDRJXDPXZWRM5", secretAccessKey: "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" });
    let opts: AWS.ConfigurationOptions = {
        credentials: credentials,
        region: Resources.REGION
    }
    AWS.config.update(opts);
}