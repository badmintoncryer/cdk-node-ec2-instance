import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { NodeJsInstance } from '../src';

describe('NodeJsInstance', () => {
  test('NodeJsInstance', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    const vpc = new ec2.Vpc(stack, 'Vpc');

    new NodeJsInstance(stack, 'Instance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.NANO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2023,
      }),
    });

    Template.fromStack(stack).hasResourceProperties('AWS::EC2::Instance', {
      InstanceType: 't3.nano',
      UserData: {
        'Fn::Base64': '#!/bin/bash\ntouch ~/.bashrc\ncurl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash\nsource ~/.bashrc\nexport NVM_DIR="$HOME/.nvm"\n[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"\nnvm install --lts\ncat <<EOF >> /home/ec2-user/.bashrc\nexport NVM_DIR="/.nvm"\n[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"\nEOF',
      },
    });
  });

  test('specify nodeJsVersion', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    const vpc = new ec2.Vpc(stack, 'Vpc');

    new NodeJsInstance(stack, 'Instance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.NANO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2023,
      }),
      nodeJsVersion: 'v20.13.1',
    });

    Template.fromStack(stack).hasResourceProperties('AWS::EC2::Instance', {
      InstanceType: 't3.nano',
      UserData: {
        'Fn::Base64': '#!/bin/bash\ntouch ~/.bashrc\ncurl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash\nsource ~/.bashrc\nexport NVM_DIR="$HOME/.nvm"\n[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"\nnvm install --lts\ncat <<EOF >> /home/ec2-user/.bashrc\nexport NVM_DIR="/.nvm"\n[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"\nEOF',
      },
    });
  });

  test.each([
    new ec2.WindowsImage(ec2.WindowsVersion.WINDOWS_SERVER_1709_ENGLISH_CORE_BASE),
    new ec2.GenericWindowsImage({
      'us-east-1': 'ami-12345678',
    }),
    ec2.MachineImage.genericLinux({
      'us-east-1': 'ami-12345678',
    }),
  ])('unsupported machine image: %s', (machineImage) => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    const vpc = new ec2.Vpc(stack, 'Vpc');

    expect(() => {
      new NodeJsInstance(stack, 'Instance', {
        vpc,
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.NANO),
        machineImage,
      });
    }).toThrow('Only AMAZON_LINUX, AMAZON_LINUX_2, AMAZON_LINUX_2022, and AMAZON_LINUX_2023 are supported.');
  });
});
