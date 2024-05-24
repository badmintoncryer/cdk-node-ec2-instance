import { IntegTest } from '@aws-cdk/integ-tests-alpha';
import * as ocf from '@open-constructs/aws-cdk';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { NodeJsInstance } from '../src';

const app = new App();

class TestStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 1,
      natGateways: 0,
      subnetConfiguration: [
        { cidrMask: 28, name: 'Public', subnetType: ec2.SubnetType.PUBLIC },
      ],
    });

    const eicEndpoint = new ocf.aws_ec2.InstanceConnectEndpoint(
      this,
      'InstanceConnectEndpoint',
      {
        vpc,
      },
    );

    const instance = new NodeJsInstance(this, 'Instance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.NANO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2023,
      }),
      nodeJsVersion: 'v20.13.1',
    });

    eicEndpoint.connections.allowTo(instance, ec2.Port.tcp(22));
  }
}

const stack = new TestStack(app, 'testStack');

new IntegTest(app, 'Test', {
  testCases: [stack],
});
