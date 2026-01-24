import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";
import { apiError } from "../common/errors";
import { logError, logInfo } from "../common/logger";
import { jsonResponse } from "../common/responses";

const client = new DynamoDBClient({});

export const handler = async (event: any) => {
  try {
    if (!event.body) {
      return apiError(400, "INVALID_INPUT", "request body is required");
    }

    const body = JSON.parse(event.body);
    const { title, content } = body;

    if (!title) {
      return apiError(400, "INVALID_INPUT", "title is required");
    }

    if (!content || typeof content !== "string") {
      return apiError(400, "INVALID_INPUT", "content must be a string");
    }

    const noteId = randomUUID();

    logInfo("Creating note", { noteId });

    await client.send(
      new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
          noteId: { S: noteId },
          content: { S: content },
          createdAt: { S: new Date().toISOString() },
        },
      }),
    );

    return jsonResponse(201, {
      noteId,
      content,
    });
  } catch (error) {
    logError("Unexpected error creating note", error);
    return apiError(500, "INTERNAL_ERROR", "unexpected error");
  }
};
