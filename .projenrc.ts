import { awscdk } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Kazuho CryerShinozuka',
  authorAddress: 'malaysia.cryer@gmail.com',
  cdkVersion: '2.143.0',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.4.0',
  name: 'cdk-node-ec2-instance',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/badmintoncryer/cdk-node-ec2-instance.git',
  description: 'CDK construct library for creating an EC2 instance with Node.js',
  keywords: ['aws', 'cdk', 'ec2', 'nodejs', 'aws-cdk'],
  gitignore: ['*.js', '*.d.ts', '!test/.*.snapshot/**/*', '.tmp'],
  // deps: [],                /* Runtime dependencies of this module. */
  devDeps: [
    '@aws-cdk/integ-runner@2.143.0-alpha.0',
    '@aws-cdk/integ-tests-alpha@2.143.0-alpha.0',
    '@open-constructs/aws-cdk',
  ],
  packageName: 'cdk-node-ec2-instance',
  publishToPypi: {
    distName: 'node-ec2-instance',
    module: 'node_ec2_instance',
  },
});
project.projectBuild.testTask.exec(
  'yarn tsc -p tsconfig.dev.json && yarn integ-runner',
);
project.synth();