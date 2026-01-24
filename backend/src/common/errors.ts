import { jsonResponse } from "./responses";

export type ApiErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "INTERNAL_ERROR";

export const apiError = (
  statusCode: number,
  code: ApiErrorCode,
  message: string,
) =>
  jsonResponse(statusCode, {
    error: {
      code,
      message,
    },
  });
