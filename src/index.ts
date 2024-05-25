import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

/**
 * Properties for NodeJsInstance
 */
export interface NodeJsInstanceProps extends ec2.InstanceProps {
  /**
   * The version of Node.js to install.
   * nvm will be used to install the specified version.
   *
   * @example '20.13.1'
   * @example 'node' - latest version
   *
   * @see https://github.com/nvm-sh/nvm?tab=readme-ov-file#usage
   *
   * @default - latest LTS version
   */
  readonly nodeJsVersion?: string;
};

const supportedMachineImages = [
  ec2.AmazonLinuxImage,
];

/**
 * Create an EC2 instance with Node.js installed
 */
export class NodeJsInstance extends ec2.Instance {
  constructor(scope: Construct, id: string, props: NodeJsInstanceProps) {
    if (!supportedMachineImages.some((image) => props.machineImage instanceof image)) {
      throw new Error('Only AMAZON_LINUX, AMAZON_LINUX_2, AMAZON_LINUX_2022, and AMAZON_LINUX_2023 are supported.');
    }

    const nodejsUserData = props.userData ?? ec2.UserData.forLinux();
    nodejsUserData.addCommands(
      'touch ~/.bashrc',
      'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash',
      'source ~/.bashrc',
      'export NVM_DIR="$HOME/.nvm"',
      '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"',
      `nvm install ${props.nodeJsVersion ?? '--lts'}`,
      `cat <<EOF >> /home/ec2-user/.bashrc
export NVM_DIR="/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
EOF`);

    const { nodeJsVersion, ...rest } = props;
    super(scope, id, { ...rest, userData: nodejsUserData });
  }
}