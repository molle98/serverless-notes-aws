import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async (event: any) => {
  try {
    const tableName = process.env.TABLE_NAME;

    if (!tableName) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "TABLE_NAME not configured" }),
      };
    }

    // 1️⃣ Parsear limit
    const limit = Math.min(
      Number(event.queryStringParameters?.limit) || 10,
      50,
    );

    // 2️⃣ Parsear nextToken
    let exclusiveStartKey;
    const nextToken = event.queryStringParameters?.nextToken;

    if (nextToken) {
      exclusiveStartKey = JSON.parse(
        Buffer.from(nextToken, "base64").toString("utf-8"),
      );
    }

    // 3️⃣ Ejecutar Scan
    const result = await client.send(
      new ScanCommand({
        TableName: tableName,
        Limit: limit,
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );

    // 4️⃣ Mapear items
    const items =
      result.Items?.map((item) => ({
        noteId: item.noteId?.S,
        content: item.content?.S,
        createdAt: item.createdAt?.S,
      })) ?? [];

    const newNextToken = result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey), "utf-8").toString(
          "base64",
        )
      : null;

    return {
      statusCode: 200,
      body: JSON.stringify({ items, nextToken: newNextToken }),
    };
  } catch (error) {
    console.error("Error listing notes:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
