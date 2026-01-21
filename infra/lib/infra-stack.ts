import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const notesTable = new dynamodb.Table(this, "NotesTable", {
      tableName: "Notes",
      partitionKey: {
        name: "noteId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const createNotesLambda = new NodejsFunction(this, "NotesLambda", {
      runtime: lambda.Runtime.NODEJS_24_X,
      entry: "../backend/notes/create.ts",
      handler: "handler",
      environment: {
        TABLE_NAME: notesTable.tableName,
      },
      bundling: {
        forceDockerBundling: false,
      },
    });

    const listNotesLambda = new NodejsFunction(this, "ListNotesLambda", {
      runtime: lambda.Runtime.NODEJS_24_X,
      entry: "../backend/notes/list.ts",
      handler: "handler",
      environment: {
        TABLE_NAME: notesTable.tableName,
      },
      bundling: {
        forceDockerBundling: false,
      },
    });

    notesTable.grantWriteData(createNotesLambda);
    notesTable.grantReadData(listNotesLambda);

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

    const notesResource = api.root.addResource("notes");

    notesResource.addMethod(
      "POST",
      new apigw.LambdaIntegration(createNotesLambda),
    );
    notesResource.addMethod(
      "GET",
      new apigw.LambdaIntegration(listNotesLambda),
    );

    const health = api.root.addResource("health");
    health.addMethod("GET", new apigw.LambdaIntegration(healthLambda));
  }
}
