import sitesList from '../data/sites.json';
import { getSummaryStats } from './promQuery';
import aws from 'aws-sdk';
//const aws = import('aws-sdk');


function getS3() {
  return new aws.S3({
    accessKeyId: process.env.NAUTILUS_ID,
    secretAccessKey: process.env.NAUTILUS_ACCESS_KEY,
    endpoint: 'https://s3-west.nrp-nautilus.io',
    signatureVersion: 'v4',
    s3ForcePathStyle: true,
    /*
    httpOptions: {
      agent: new https.Agent({ rejectUnauthorized: false })
    }
    */
  });
}


async function calculateUsage() {
  //lastCalculated = null;
  /*
  if (!lastCalculated) {
    lastCalculated = new Date('2023-10-01');
  }
  */


  let startTime = new Date('2023-10-01');

  // Get all the node hostnames at all the sites
  const nodes = sitesList.sites.map((site) => site.nodes ? site.nodes.map((node) => node.hostname) : null).flat();

  // Eliminate the nulls from the array
  const nonNullNodes = nodes.filter((node) => node != null) as string[];

  var usage = await getSummaryStats(nonNullNodes, startTime);
  //console.log(usage);


  // Convert usage to a object of objects with the namespace as the key
  let usageMap = new Map<string, {}>();
  usage.forEach((values, namespace) => {
    usageMap.set(namespace, Object.fromEntries(values));
  });
  let usageObj = Object.fromEntries(usageMap);

  //console.log(JSON.stringify(usageObj));
  const to_upload = {
    last_calculated: new Date().toISOString(),
    data: usageObj
  }

  const uploadParams = {
    Bucket: 'dweitzel',
    Key: 'gp-engine/website/summary_stats.json',
    Body: JSON.stringify(to_upload),
    ContentType: 'application/json',
    ACL: 'public-read'
  };

  // Upload to s3
  let s3 = getS3();
  s3.upload(uploadParams, function (err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      console.log(data);
    }
  });

  //console.log("In handler for metric: " + correctedMetric + " Got: " + usage);
  //console.log(usage);
  //var totalGpuHours = usage.reduce((acc: number, d: { namespace: string, value: number }) => acc + d.value, 0);
  //console.log("Total hours: " + totalGpuHours);
}


calculateUsage();


