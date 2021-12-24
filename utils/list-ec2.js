// Load the AWS SDK for Node.js
const fs = require('fs');
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({ region: 'us-east-2' });
// Create EC2 service object

const today = new Date();
const date_time = `${today.getDate()}-${today.getMonth()}-${today.getFullYear()}-${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`;
const fileName = `logs/ec2_running_instances_${date_time}.csv`;
//const bucketName = `umesh-presdio-training-2021`;

const ListRunningEc2 = (fileName,callback) => {
    var ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });

    var params = {
        DryRun: false,
        Filters: [
            {
                Name: 'instance-type',
                Values: ['t2.micro']
            },
            {
                Name: 'instance-state-name',
                Values: ['running']
            },
        ]
    };
    // Call EC2 to retrieve policy for selected bucket

    let ec2data = [];
    console.log('fetching all the t2.micro running instances....');
    ec2.describeInstances(params, function (err, data) {
        if (err) {
            console.log("Error", err.stack);
        } else {
            const reservations = data['Reservations'];
            reservations.forEach(element => {
                const instances = element['Instances'];
                instances.forEach(instance => {
                    let inst = {};
                    inst['InstanceId'] = instance.InstanceId;
                    inst['LaunchTime'] = instance.LaunchTime;
                    inst['InstanceState'] = instance.State.Name;
                    const attachVolumes = instance.BlockDeviceMappings;
                    attachVolumes.forEach(volume => {
                        inst['rootVolume'] = volume.DeviceName;
                    });
                    const tags = instance.Tags;
                    let instanceName = '';
                    for (let index = 0; index < tags.length; index++) {
                        const tag = tags[index];
                        if (tag.Key === 'Name') {
                            instanceName = tag.Value;
                            break;
                        }
                    }
                    inst['instanceName'] = instanceName;
                    ec2data.push(inst);
                });

            });
        }
        console.log('writing data to CSV file......');
        let csv = 'InstanceId,LaunchTime,InstanceState,RootVolume,InstanceName\n';
        ec2data.forEach(ele => {
            csv += ele.InstanceId + "," + ele.LaunchTime + "," + ele.InstanceState + "," + ele.rootVolume + "," + ele.instanceName + "\n";
        })
        fs.writeFileSync(fileName, csv);
        callback();
    });
}
module.exports = {ListRunningEc2}

