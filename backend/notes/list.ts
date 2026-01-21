import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async () => {
  try {
    const tableName = process.env.TABLE_NAME;

    if (!tableName) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "TABLE_NAME not configured" }),
      };
    }

    const result = await client.send(
      new ScanCommand({
        TableName: tableName,
        Limit: 50,
      }),
    );

    const notes =
      result.Items?.map((item) => ({
        noteId: item.noteId?.S,
        content: item.content?.S,
        createdAt: item.createdAt?.S,
      })) ?? [];

    return {
      statusCode: 200,
      body: JSON.stringify(notes),
    };
  } catch (error) {
    console.error("Error listing notes:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
