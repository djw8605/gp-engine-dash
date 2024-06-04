import type { NextApiRequest, NextApiResponse } from 'next'
import sitesList from '../../data/sites.json';
import { PrometheusDriver, RangeVector, SampleValue } from 'prometheus-query';

const prom = new PrometheusDriver({
    endpoint: "https://thanos.nrp-nautilus.io/",
    baseURL: "/api/v1", // default value
    timeout: 60000
});

type NamespaceValue = {
  namespace: string,
  value: number
}


async function getUsage(nodes: string[]) {
  return new Promise<Object>((resolve, reject) => {

    // Create dates for start and end times, endtime is now, starttime is 1 month ago
    const endTime = new Date();
    const startTime = new Date();
    startTime.setMonth(startTime.getMonth() - 1);
    const step = 3600 * 24;

    // Join the nodes into a string
    const queryNodes = nodes.join('|');
    const query = `sum by (namespace) (sum_over_time(namespace_allocated_resources{node=~'${queryNodes}', resource=~"nvidia_com.*"}[1d:1h]))`;

    // Log the query
    console.log(query);
    prom.rangeQuery(
      query,
      startTime,
      endTime,
      step
    ).then((result) => {
      console.log(result);
      // log each result
      result.result.forEach((r) => {
        console.log(r);
      });

      // Group the results by time
      let groupedResults = new Map<number, NamespaceValue[]>();
      result.result.forEach((r: RangeVector) => {

        r.values.forEach((v: SampleValue) => {
          let date = v.time;
          if (!r.metric.labels || !(r.metric.labels as { namespace: string }).namespace) {
            return; 
          }
          let namespaceValue = { namespace: (r.metric.labels as {namespace: string}).namespace, value: v.value };
          if (groupedResults.has(date.getTime())) {
            groupedResults.get(date.getTime())?.push(namespaceValue);
          } else {
            groupedResults.set(date.getTime(), [namespaceValue]);
          }
        });
      });
      //console.log(groupedResults);
      // Convert from a map to an array of keys and values
      let groupedArray = Array.from(groupedResults, ([time, value]) => ({ time, value }));
      // Sort the array by time
      groupedArray.sort((a, b) => a.time - b.time);
      resolve(groupedArray);
    });
  });


}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // Get the site name from the URL
  const supportedMetrics = ['cpu', 'memory', 'gpu'];

  // Check if req.query.site exists
  if (req.query.site && req.query.metric) {
    // Get the site name from req.query.site
    const siteName = req.query.site.toString();
    // Find the site with the matching name
    const site = sitesList.sites.find((site) => site.name === siteName);

    // Combine the node names into a string array
    if (!site) {
      // Return a 404
      res.status(404).json({ error: `Site ${siteName} not found` });
      return;
    }
    if (!site.nodes) {
      // Return a 404
      res.status(404).json({ error: `Site ${siteName} has no nodes` });
      return;
    }
    const nodes = site.nodes.map((node) => node.hostname);
    // If the site exists
    if (site) {
      var usage = await getUsage(nodes);
      console.log("In handler" + usage);
      res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate')
      res.status(200).json(usage);
    } else {
      // Return a 404
      res.status(404).json({ error: `Site ${siteName} not found` });
    }
  } else {
    // Return a 400
    res.status(400).json({ error: 'Site name not specified' });
  }

}

