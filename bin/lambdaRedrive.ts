import { Construct } from "constructs";
import { resolve } from "path";
import { SchedulerSchedule } from "@cdktf/provider-aws/lib/scheduler-schedule";
import { NodejsFunction } from "./NodejsFunction";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamRolePolicy } from "@cdktf/provider-aws/lib/iam-role-policy";
import { DataAwsCallerIdentity } from "@cdktf/provider-aws/lib/data-aws-caller-identity";
import { ref } from "cdktf";

export class DLQRedriveConstruct extends Construct {
  readonly redriveLambda: NodejsFunction;
  readonly schedularSchedule: SchedulerSchedule;
  readonly schedulerRole: IamRole;
  constructor(scope: Construct, id: string, props: any) {
    super(scope, id);
    console.log("PROPS in DLQ Redrive", props);
    this.redriveLambda = new NodejsFunction(
      this,
      `lmda-${props.awsRegionShorthand}-${props.environment}-${props.prefix}-redrive-messages-from-dlq-to-sqs-lambda`,
      {
        ...props,
        memorySize: 512,
        name: `redrive-messages-from-dlq-to-sqs-lambda`,
        timeout: 1,
        handler: "index.handler",
        runtime: "nodejs20.x",
        description: `Lambda Function to pull messages from DLQ and push them to respective SQS queues to perform reprocessing: ${props.prefix}-${props.environment}`,
        codePath: resolve(__dirname, "../", "src/helpers/index.ts"),
        reservedConcurrentExecutions: 50,
        lambdaEnvironmentVariables: props.environmentVariables,
      }
    );

    // Lambda IAM Role
    const lambdaExecutionRole = new IamRole(
      this,
      `iams-${props.awsRegionShorthand}-${props.environment}-${props.prefix}-schedular-lambda-execution-role`,
      {
        name: `iams-${props.awsRegionShorthand}-${props.environment}-${props.prefix}-schedular-lambda-execution-role`,
        assumeRolePolicy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Action: "sts:AssumeRole",
              Principal: { Service: "lambda.amazonaws.com" },
              Effect: "Allow",
              Sid: "",
            },
          ],
        }),
      }
    );

    // Lambda IAM Role Policy for Logs
    new IamRolePolicy(
      this,
      `iamp-${props.awsRegionShorthand}-${props.environment}-${props.prefix}-schedular-lambda-logs-policy`,
      {
        name: `iamp-${props.awsRegionShorthand}-${props.environment}-${props.prefix}-schedular-lambda-logs-policy`,
        role: lambdaExecutionRole.name,
        policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Sid: "AllowLambdaFunctionToCreateLogs",
              Action: ["logs:*"],
              Effect: "Allow",
              Resource: [
                `arn:aws:logs:*:${ref(
                  new DataAwsCallerIdentity(this, "CurrentAccount", {})
                    .accountId
                )}:log-group:/aws/lambda/${
                  this.redriveLambda.lambdaFunction.functionName
                }:*`,
              ],
            },
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
      }
    );

    // Scheduler IAM Role
    this.schedulerRole = new IamRole(
      this,
      `iams-${props.awsRegionShorthand}-${props.environment}-${props.prefix}-schedular-role`,
      {
        name: `iams-${props.awsRegionShorthand}-${props.environment}-${props.prefix}-schedular-role`,
        assumeRolePolicy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Action: "sts:AssumeRole",
              Effect: "Allow",
              Principal: { Service: "scheduler.amazonaws.com" },
            },
          ],
        }),
      }
    );

    // Scheduler IAM Role Policy for Lambda invocation
    new IamRolePolicy(
      this,
      `iamp-${props.awsRegionShorthand}-${props.environment}-${props.prefix}-schedular-policy`,
      {
        name: `iamp-${props.awsRegionShorthand}-${props.environment}-${props.prefix}-schedular-policy`,
        role: this.schedulerRole.name,
        policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Sid: "AllowEventBridgeToInvokeLambda",
              Action: ["lambda:InvokeFunction"],
              Effect: "Allow",
              Resource: this.redriveLambda.lambdaFunction.arn,
            },
          ],
        }),
      }
    );

    this.schedularSchedule = new SchedulerSchedule(
      this,
      `ebsc-${props.awsRegionShorthand}-${props.environment}-${props.prefix}-event-bridge-scheduler`,
      {
        name: `ebsc-${props.awsRegionShorthand}-${props.environment}-${props.prefix}-event-bridge-scheduler`,
        description: `Event Bridge Scheduler to Trigger lambda function to run schedular to update lead status: ${props.prefix}-${props.awsRegionShorthand}-${props.environment}-event-bridge-scheduler`,
        target: {
          arn: this.redriveLambda.lambdaFunction.arn,
          roleArn: this.schedulerRole.arn,
        },
        scheduleExpression: "rate(10 minutes)",
        flexibleTimeWindow: {
          mode: "FLEXIBLE",
          maximumWindowInMinutes: 1,
        },
      }
    );
  }
}
