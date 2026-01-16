import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async () => {
  return {
    statusCode: 501,
    body: JSON.stringify({ message: "Not implemented yet" }),
  };
};
