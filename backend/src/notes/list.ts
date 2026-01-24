import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandInput,
} from "@aws-sdk/client-dynamodb";
import { apiError } from "../common/errors";
import { logError, logInfo } from "../common/logger";
import { jsonResponse } from "../common/responses";

const client = new DynamoDBClient({});

export const handler = async (event: any) => {
  try {
    const limit = event.queryStringParameters?.limit
      ? Number(event.queryStringParameters.limit)
      : 10;

    if (Number.isNaN(limit) || limit <= 0) {
      return apiError(400, "INVALID_INPUT", "limit must be a positive number");
    }

    const exclusiveStartKey = event.queryStringParameters?.cursor
      ? JSON.parse(
          Buffer.from(event.queryStringParameters.cursor, "base64").toString(
            "utf-8",
          ),
        )
      : undefined;

    const params: ScanCommandInput = {
      TableName: process.env.TABLE_NAME,
      Limit: limit,
      ExclusiveStartKey: exclusiveStartKey,
    };

    logInfo("Listing notes", { limit });

    const result = await client.send(new ScanCommand(params));

    const items =
      result.Items?.map((item) => ({
        noteId: item.noteId.S!,
        content: item.content.S!,
        createdAt: item.createdAt.S!,
      })) ?? [];

    const nextCursor = result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey), "utf-8").toString(
          "base64",
        )
      : null;

    return jsonResponse(200, {
      items,
      nextCursor,
    });
  } catch (error) {
    logError("Unexpected error listing notes", error);
    return apiError(500, "INTERNAL_ERROR", "unexpected error");
  }
};
