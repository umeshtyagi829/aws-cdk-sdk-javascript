const { Stack, Duration, RemovalPolicy } = require('aws-cdk-lib');
const s3 = require("aws-cdk-lib/aws-s3");
const s3Deploy = require("aws-cdk-lib/aws-s3-deployment");
const path = require("path");
const { ListRunningEc2 } = require('../utils/list-ec2');
class JavascriptTaskStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    const today = new Date();
    const date_time = `${today.getDate()}-${today.getMonth()}-${today.getFullYear()}-${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`;
    const fileName = `logs/ec2_running_instances_${date_time}.csv`;
    const bucketName = `umesh-presdio-training-2021`;
    
    ListRunningEc2(fileName,() => {
      const bucket = new s3.Bucket(this, "s3-bucket", {
        versioned: true,
        bucketName: bucketName,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true
      })
      new s3Deploy.BucketDeployment(this, "deploy_csv", {
        sources: [s3Deploy.Source.asset(path.join(__dirname,"./../logs"))],
        destinationBucket: bucket,
        LifecyclePolicy: [
          { expiration: Duration.days(30) }
        ]
      })
    })
  }
}

module.exports = { JavascriptTaskStack } 