import "dotenv/config";
import { Construct } from "constructs";
import { App, Fn, TerraformStack } from "cdktf";
import { provider } from "@cdktf/provider-aws";
import { z, parseEnv } from "znv";
import { DataAwsVpc } from "@cdktf/provider-aws/lib/data-aws-vpc";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { DataAwsSsmParameter } from "@cdktf/provider-aws/lib/data-aws-ssm-parameter";
import { DataAwsRdsCluster } from "@cdktf/provider-aws/lib/data-aws-rds-cluster";
import { DataAwsDbSubnetGroup } from "@cdktf/provider-aws/lib/data-aws-db-subnet-group";
import { SecurityGroupRule } from "@cdktf/provider-aws/lib/security-group-rule";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: any) {
    super(scope, id);

    // Define AWS Provider
    new provider.AwsProvider(this, "AWS", {
      region: "us-east-1", // specify your AWS region
    });

    const vpcIdParam = new DataAwsSsmParameter(this, "vpcIdParam", {
      name: `/config/aps1/${props.environment}/leadManagementApp/vpcid`,
    });

    const rdsClusterParams = new DataAwsSsmParameter(
      this,
      "rdsClusterIdParam",
      {
        name: `/config/aps1/${props.environment}/leadManagementApp/rdsClusterId`,
      },
    );

    const VPC_ID = vpcIdParam.value;

    const RDS_INSTANCE_NAME = rdsClusterParams.value;

    // Use a data source to get the existing VPC
    const vpc = new DataAwsVpc(this, id + "VPC", {
      id: VPC_ID, // Change to your existing VPC ID
    });

    const rdsCluster = new DataAwsRdsCluster(this, "existing-rds-instance", {
      clusterIdentifier: RDS_INSTANCE_NAME,
    });

    const rdsSubnetGroup = new DataAwsDbSubnetGroup(this, "rds-subnet-group", {
      name: rdsCluster.dbSubnetGroupName,
    });

    const rdsSubnetIds = rdsSubnetGroup.subnetIds;
    props.subnets = rdsSubnetIds;

    // Create a new security group
    const securityGroup = new SecurityGroup(this, id + "secruityGroup", {
      name: `ue1-${props.environment}-mjdb-db-access`,
      description: "Allow SSH and HTTP access",
      vpcId: vpc.id, // Replace with your VPC ID
      egress: [
        {
          fromPort: 0,
          toPort: 0,
          protocol: "-1",
          cidrBlocks: ["0.0.0.0/0"],
        },
      ],
      tags: props.tags,
    });

    new SecurityGroupRule(this, "allow-lambda-access-to-rds", {
      type: "ingress",
      fromPort: 5432,
      toPort: 5432,
      protocol: "tcp",
      sourceSecurityGroupId: securityGroup.id,
      securityGroupId: Fn.element(rdsCluster.vpcSecurityGroupIds, 0),
    });

    props.securityGroups = securityGroup.id;

    
  }
}

// @ts-ignore
const environment = process.env.NODE_ENV || "development"; // Defaults to 'development'

const env = parseEnv(process.env, {
  SECRET_MANAGER_ARN: z.string(),
});

const app = new App();

// development environment
new MyStack(app, `lead-management-dev`, {
  environment: "dev",
  awsRegionShorthand: "ue1",
  environmentVariables: env,
  prefix: 'lead-management',
  region: 'ap-south-1',
  tags: {
    environment: "dev",
    project: "lead-management-app",
    repo: "https://gitlab.com/crosscountryhealthcare/cch-aws-dev-ats/ats",
    created_by: "nramrakh@ccrn.com",
  },
  securityGroups: "",
  subnets: [""],
});

app.synth();