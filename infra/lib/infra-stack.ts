import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const healthLambda = new lambda.Function(this, "HealthLambda", {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "index.handler",
      code: lambda.Code.fromInline(`
        exports.handler = async () => ({
          statusCode: 200,
          body: JSON.stringify({ status: "ok" })
        });
      `),
    });

    const api = new apigw.RestApi(this, "NotesApi", {
      restApiName: "Notes API",
    });

    const health = api.root.addResource("health");
    health.addMethod("GET", new apigw.LambdaIntegration(healthLambda));
  }
}
