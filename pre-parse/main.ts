import {Name} from 'aws-sdk/clients/appstream';
import sitesList from '../data/sites.json';
import {getSummaryStats} from './promQuery';
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

type NamespaceValue = Map<string, Map<string, number>>;
type ReturnNamespaceDate = {
  namespaceValue: NamespaceValue,
  lastDate: Date
};

async function downloadSummaryStats(filePath: string) {
  return new Promise<ReturnNamespaceDate>((resolve, reject) => {
    let s3 = getS3();
    let params = {
      Bucket: 'dweitzel',
      Key: filePath
    };

    s3.getObject(params, function (err: any, data: any) {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      } else {
        let summaryStats = JSON.parse(data.Body.toString());
        console.log(summaryStats);
        let lastDate = new Date(summaryStats.last_calculated);
        let namespaceValue = new Map<string, Map<string, number>>();
        Object.entries(summaryStats.namespaceValue).forEach(([namespace, value]) => {
          namespaceValue.set(namespace, new Map(Object.entries(value)));
        });
        resolve({namespaceValue, lastDate});
      }
    });
  });
}

async function getTimeToCalculate() {
  //

  // Loop through the months from the current
  let startTime = new Date('2023-10-01');

  // Loop through all the months from the start time to now
  let culminatedStats = new Map<string, Map<string, number>>();

  // Get the first date of this month
  let endTime = new Date();
  endTime.setDate(1);
  endTime.setHours(0);
  endTime.setMinutes(0);
  endTime.setSeconds(0);
  endTime.setMilliseconds(0);

  let now = new Date();
  while (startTime < endTime) {
    // Calculate the monthly name of the file
    let currentMonth = startTime.getMonth();
    let currentYear = startTime.getFullYear();
    let filePath = `gp-engine/website/summary_stats_${currentYear}_${currentMonth}.json`;

    try {
      var stats = await downloadSummaryStats(filePath);
    } catch (err) {
      // Failed to get the stats
      console.log("Failed to get the stats for: " + filePath);
      break;
    }

    console.log(stats);
    // Merge the stats
    stats.namespaceValue.forEach((value, namespace) => {
      if (culminatedStats.has(namespace)) {
        let currentNamespace = culminatedStats.get(namespace);
        value.forEach((resourceValue, resource) => {
          if (currentNamespace.has(resource)) {
            let currentResource = currentNamespace.get(resource);
            currentNamespace.set(resource, currentResource + resourceValue);
          } else {
            currentNamespace.set(resource, resourceValue);
          }
        });
      } else {
        culminatedStats.set(namespace, value);
      }
    });

    // Increment the month
    startTime.setMonth(startTime.getMonth() + 1);
  }

  // startTime is now the last calculated date

  return new Promise<ReturnNamespaceDate>((resolve, reject) => {
    resolve({namespaceValue: culminatedStats, lastDate: startTime});
  });

}

async function uploadStats(stats: { namespaceValue: Object, lastDate: string }, filePath: string) {
  return new Promise<void>((resolve, reject) => {
    /*
    const to_upload = {
        last_calculated: new Date().toISOString(),
        data: stats.namespaceValue
    }
    */
    console.log("In uploadStats, stats: " + stats);

    const uploadParams = {
      Bucket: 'dweitzel',
      Key: filePath,
      Body: JSON.stringify(stats),
      ContentType: 'application/json',
      ACL: 'public-read'
    };

    // Upload to s3
    let s3 = getS3();
    s3.upload(uploadParams, function (err: any, data: any) {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function convertNamespaceValueToObject(namespaceValue: NamespaceValue) {
  let usageMap = new Map<string, {}>();
  namespaceValue.forEach((values, namespace) => {
    usageMap.set(namespace, Object.fromEntries(values));
  });
  return Object.fromEntries(usageMap);
}


async function calculateUsage() {
  //lastCalculated = null;
  /*
  if (!lastCalculated) {
    lastCalculated = new Date('2023-10-01');
  }
  */

  // Get the last calculated date
  let lastCaclulated = await getTimeToCalculate();

  console.log("Last calculated: " + lastCaclulated);

  let startTime = new Date('2023-10-01');
  startTime = lastCaclulated.lastDate;
  let endTime = new Date();

  // Get all the node hostnames at all the sites
  const nodes = sitesList.sites.map((site) => site.nodes ? site.nodes.map((node) => node.hostname) : null).flat();

  // Eliminate the nulls from the array
  const nonNullNodes = nodes.filter((node) => node != null) as string[];

  let culminatedUsage = lastCaclulated.namespaceValue;

  // Get the summary stats for each missing month
  while (startTime < endTime) {
    let currentMonth = startTime.getMonth();
    let currentYear = startTime.getFullYear();
    let filePath = `gp-engine/website/summary_stats_${currentYear}_${currentMonth}.json`;
    let stats: NamespaceValue;

    try {

      var returnedStats = await downloadSummaryStats(filePath);
      stats = returnedStats.namespaceValue;
    } catch (err) {
      // Failed to get the stats
      console.log("Failed to get the stats for: " + filePath + ": calculating:...");
      // Get the usage for the month
      let monthEndTime = new Date(startTime)
      monthEndTime.setMonth(startTime.getMonth() + 1);
      stats = await getSummaryStats(nonNullNodes, startTime, monthEndTime);
      let to_upload = {namespaceValue: convertNamespaceValueToObject(stats), lastDate: new Date().toISOString()};
      // Upload the stats
      console.log("Uploading: " + filePath);
      console.log(`to_upload: ${JSON.stringify(to_upload)}`);
      await uploadStats(to_upload, filePath);
      console.log("Uploaded: " + filePath);
    }


    console.log("Merging culminated with: " + stats.size);
    // Merge the stats
    stats.forEach((value, namespace) => {
      if (culminatedUsage.has(namespace)) {
        let currentNamespace = culminatedUsage.get(namespace);
        if (!currentNamespace) {
          currentNamespace = new Map<string, number>();
          culminatedUsage.set(namespace, currentNamespace);
          return;
        }
        value.forEach((resourceValue, resource) => {
          if (currentNamespace.has(resource)) {
            let currentResource = currentNamespace.get(resource);
            currentNamespace.set(resource, currentResource + resourceValue);
          } else {
            currentNamespace.set(resource, resourceValue);
          }
        });
      } else {
        culminatedUsage.set(namespace, value);
      }
    });


    // Increment the month
    startTime.setMonth(startTime.getMonth() + 1);
  }
  //var usage = await getSummaryStats(nonNullNodes, startTime, endTime);
  //console.log(usage);


  console.log("stats: " + culminatedUsage);

  // Convert usage to a object of objects with the namespace as the key
  let usageMap = new Map<string, {}>();
  culminatedUsage.forEach((values, namespace) => {
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
  s3.upload(uploadParams, function (err: any, data: any) {
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


