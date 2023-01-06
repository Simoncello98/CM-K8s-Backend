import { DynamoDB } from "aws-sdk";
import {
  DocumentClient,
  TransactWriteItemList,
  TransactWriteItemsInput,
} from "aws-sdk/clients/dynamodb";

declare module "aws-sdk/clients/dynamodb" {
  interface DocumentClient {
    queryGetAll(
      params: DynamoDB.DocumentClient.QueryInput
    ): Promise<DynamoDB.DocumentClient.ItemList>;

    transactWriteAll(items: TransactWriteItemList);
  }
}

async function queryGetAll(
  params: DynamoDB.DocumentClient.QueryInput
): Promise<DynamoDB.DocumentClient.ItemList> {
  let dynamo = new DynamoDB.DocumentClient();
  let items = [];
  let finished = false;
  while (!finished) {
    let data = await dynamo.query(params).promise();
    if (data.$response.error) {
      return null;
    }
    items = [...items, ...data.Items]; //TODO: change spread operator with another solution.But keep in mind cocntat seems to not work properly.
    if (data.LastEvaluatedKey) {
      params.ExclusiveStartKey = data.LastEvaluatedKey;
    } else finished = true;
  }
  return items;
}
DocumentClient.prototype.queryGetAll = queryGetAll;

async function transactWriteAll(items: TransactWriteItemList) {
  let dynamo = new DynamoDB.DocumentClient();

  let currentItems = [];

  // Executing transact (max 25 items at a time)
  for (let i = 0; i < items.length; ++i) {
    currentItems.push(items[i]);

    if (i > 0 && i % 20 == 0) {
      let transactParams: TransactWriteItemsInput = {
        ReturnConsumedCapacity: "TOTAL",
        ReturnItemCollectionMetrics: "SIZE",
        TransactItems: currentItems,
      };
      await dynamo.transactWrite(transactParams).promise();

      currentItems = [];
    }
  }

  if (currentItems.length > 0) {
    let transactParams: TransactWriteItemsInput = {
      ReturnConsumedCapacity: "TOTAL",
      ReturnItemCollectionMetrics: "SIZE",
      TransactItems: currentItems,
    };
    await dynamo.transactWrite(transactParams).promise();
  }
}
DocumentClient.prototype.transactWriteAll = transactWriteAll;
