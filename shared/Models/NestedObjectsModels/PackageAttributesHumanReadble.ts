/*
  Created by Simone Scionti
*/

import { JsonProperty, Serializable, serialize } from 'typescript-json-serializer';
import { ModelNestedObject } from '../AbstractClasses/ModelNestedObject';

@Serializable()
export class PackageAttributesHumanReadble extends ModelNestedObject {
    @JsonProperty() public AttributeName: string;
    @JsonProperty() public HumanReadble: string;

    //if it's empty, the user hasn't to fill the IPConfiguration during the campus creation.
    createNecessaryAttributes = [];
    updateOptionalAtLeastOneAttributes = ["AttributeName", "HumanReadble"];

    public constructor() {
        super();
    }

    public toJson(removeUndefined: boolean): Object {
        return serialize(this, removeUndefined);
    }

    public autoFillWithUndefinedImportantAttributes(): void {
        if (!this.AttributeName) this.AttributeName = "";
        if (!this.HumanReadble) this.HumanReadble = "";
    }

    public removeUnplannedAttributes() {
        delete this.createNecessaryAttributes;
        delete this.updateOptionalAtLeastOneAttributes;
    }
}