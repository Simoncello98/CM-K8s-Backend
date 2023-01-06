/*
  Created by Simone Scionti 
  
  Parent class for every ConsistentUpdateManager that declares all useful methods and defines just the common ones.

*/

import { Model } from "../../Models/AbstractClasses/Model";
import { DynamoDB } from "aws-sdk";

export abstract class ConsistentUpdateManager {
  static obj: ConsistentUpdateManager = null;
  dynamo = new DynamoDB.DocumentClient();

  //TODO : improve the structer for a singleton abstract class.
  constructor() { }
  public static getUniqueInstance() { } //TO redefine in child ( it's not the best structure )

  //get all the given user's relatioships, active and not.
  public abstract  getRels(item: Model): Promise<any>;

  //launch the update transaction request, that should update all records( relationships and user info ).
  public async transactUpdateRels(objectsToUpdate: any[]): Promise<any> {
    var dynamo = new DynamoDB.DocumentClient();
    let params = {
      ReturnConsumedCapacity: "TOTAL",
      ReturnItemCollectionMetrics: "SIZE",
      TransactItems: objectsToUpdate
    }
    return await dynamo.transactWrite(params).promise();
  }

  //build the transactUpdate object array.
  public abstract getUpdateObjects(rels: any[], item: Model, updateSchema: any): any[];
}
