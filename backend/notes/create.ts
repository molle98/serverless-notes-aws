import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});

export const handler = async (event: any) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Request body is required" }),
      };
    }

    const body = JSON.parse(event.body);
    const { content } = body;

    if (!content || typeof content !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "content must be a string" }),
      };
    }

    const noteId = randomUUID();

    const command = new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        noteId: { S: noteId },
        content: { S: content },
        createdAt: { S: new Date().toISOString() },
      },
    });

    await client.send(command);

    return {
      statusCode: 201,
      body: JSON.stringify({
        noteId,
        content,
      }),
    };
  } catch (error) {
    console.error("Error creating note:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
