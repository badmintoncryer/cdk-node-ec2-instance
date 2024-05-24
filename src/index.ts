import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface NodeJsInstanceProps extends ec2.InstanceProps {
  nodeJsVersion?: string;
};

const supportedMachineImages = [
  ec2.AmazonLinuxImage,
];

export class NodeJsInstance extends ec2.Instance {
  constructor(scope: Construct, id: string, props: NodeJsInstanceProps) {
    if (!supportedMachineImages.some((image) => props.machineImage instanceof image)) {
      throw new Error(`Unsupported machine image. Supported: ${supportedMachineImages.join(', ')}`);
    }

    const nodejsUserData = props.userData ?? ec2.UserData.forLinux();
    nodejsUserData.addCommands(
      'touch ~/.bashrc',
      'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash',
      'source ~/.bashrc',
      'export NVM_DIR="$HOME/.nvm"',
      '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"',
      'nvm install --lts',
      `cat <<EOF >> /home/ec2-user/.bashrc
export NVM_DIR="/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
EOF`);

    const { nodeJsVersion, ...rest } = props;
    super(scope, id, { ...rest, userData: nodejsUserData });
  }
}