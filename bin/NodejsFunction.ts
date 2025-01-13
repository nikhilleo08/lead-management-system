import { Construct } from "constructs";
import { TerraformAsset, AssetType } from "cdktf/lib/terraform-asset";
import { buildSync } from "esbuild";
import * as path from "path";
import { LambdaFunction } from "@cdktf/provider-aws/lib/lambda-function";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment";
import { join } from "path";
import { copyFilesToDestination } from "./util";

export class NodejsFunction extends Construct {
  public readonly lambdaFunction: LambdaFunction;

  constructor(scope: Construct, id: string, props: any) {
    super(scope, id);

    const workingDirectory = path.resolve(path.dirname(props.codePath));
    const outdir = path.resolve(workingDirectory, "dist");
    buildSync({
      entryPoints: [path.basename(props.codePath)],
      platform: "node",
      target: "es2018",
      bundle: true,
      format: "cjs",
      sourcemap: true,
      minify: false,
      outdir,
      absWorkingDir: workingDirectory,
      loader: {
        ".prisma": "file",
        ".so.node": "file",
      },
      assetNames: "[name]",
    });

    if (props.copyPrismaClient) {
      copyFilesToDestination(
        [
          join(
            process.cwd(),
            "../node_modules/src/generated/client/schema.prisma",
          ),
          join(
            process.cwd(),
            "../node_modules/src/generated/client/libquery_engine-rhel-openssl-3.0.x.so.node",
          ),
        ],
        join(props.codePath.split("/index.ts")[0], 'dist'),
      );
    }

    const asset = new TerraformAsset(this, "lambda-asset", {
      path: outdir,
      type: AssetType.ARCHIVE,
    });

    const role = new IamRole(this, `${props.name}-lambda-exec-role`, {
      description: `iams-${props.awsRegionShorthand}-${props.environment}-${props.prefix}-lambda-exec-role`,
      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Action: "sts:AssumeRole",
            Principal: {
              Service: "lambda.amazonaws.com",
            },
            Effect: "Allow",
          },
        ],
      }),
      inlinePolicy: [
        {
          name: "lambda-function-eventbridge-policy",
          policy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Action: ["events:PutEvents"],
                Resource: "*",
              },
            ],
          }),
        },
        {
          name: "lambda-function-sqs-policy",
          policy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Action: [
                  "sqs:ReceiveMessage",
                  "sqs:DeleteMessage",
                  "sqs:GetQueueAttributes",
                  "sqs:sendmessage",
                ],
                Resource: "*",
              },  
            ],
          }),
        },
      ],
      tags: props.tags,
    });

    new IamRolePolicyAttachment(this, `${props.name}-basic-execution-role`, {
      policyArn:
        "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
      role: role.name,
    });

    // Secrets Manager Policy
    new IamRolePolicyAttachment(this, "lambda-managed-policy-secrets-manager", {
      policyArn: "arn:aws:iam::aws:policy/SecretsManagerReadWrite",
      role: role.name,
    });

    new IamRolePolicyAttachment(
      this,
      `${props.name}-sqs-basic-execution-role`,
      {
        policyArn:
          "arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole",
        role: role.name,
      },
    );

    if (props.dbAndVpcConnectionRequired) {
      new IamRolePolicyAttachment(
        this,
        `iampa-${props.awsRegionShorthand}-${props.environment}-${props.prefix}-lambda-vpc-network-interface-operations-policy`,
        {
          policyArn:
            "arn:aws:iam::aws:policy/AmazonVPCCrossAccountNetworkInterfaceOperations",
          role: role.name,
        },
      );
    }

    this.lambdaFunction = !props.dbAndVpcConnectionRequired
      ? new LambdaFunction(this, "lambda-function", {
          functionName: `lmda-${props.awsRegionShorthand}-${props.environment}-${props.prefix}-${props.name}`,
          description: props.description,
          runtime: props.runtime,
          filename: asset.path,
          handler: props.handler,
          role: role.arn,
          environment: {
            variables: props.lambdaEnvironmentVariables,
          },
          reservedConcurrentExecutions: props.reservedConcurrentExecutions,
          layers: props.layers,
          memorySize: props.memorySize,
          timeout: props.timeout,
          tags: props.tags,
        })
      : new LambdaFunction(this, "lambda-function", {
          functionName: `lmda-${props.awsRegionShorthand}-${props.environment}-${props.prefix}-${props.name}`,
          description: props.description,
          runtime: props.runtime,
          filename: asset.path,
          handler: props.handler,
          role: role.arn,
          environment: {
            variables: props.lambdaEnvironmentVariables,
          },
          reservedConcurrentExecutions: props.reservedConcurrentExecutions,
          layers: props.layers,
          memorySize: props.memorySize,
          timeout: props.timeout,
          vpcConfig: props.vpcConfig,
          tags: props.tags,
        });
  }
}