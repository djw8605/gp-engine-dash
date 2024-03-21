import type { NextApiRequest, NextApiResponse } from 'next'
import sitesList from '../../data/sites.json';
import { getSummaryStats } from '../../lib/promQuery';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // Get the site name from the URL
  const supportedMetrics = ['cpu', 'memory', 'gpu'];

  // Check if req.query.site exists
  if (req.query.metric) {
    const metric = req.query.metric.toString();
    let correctedMetric: string;
    switch (metric) {
      case 'cpu':
        correctedMetric = 'cpu';
        break;
      case 'memory':
        correctedMetric = 'memory';
        break;
      case 'gpu':
        correctedMetric = 'nvidia_com_gpu';
        break;
      default:
        correctedMetric = 'gpu';
    }

    // Calculate how many days since October 1, 2023
    // Get the now time in milliseconds
    const now = new Date().getTime();
    // Get the time of October 1, 2023 in milliseconds
    const oct1 = new Date('2023-10-01').getTime();
    // Calculate the difference in milliseconds
    const diff = now - oct1;
    // Convert the difference to days
    const days = diff / (1000 * 60 * 60 * 24);
    // Convert days to an integer
    const daysInt = Math.floor(days);

    // Check for the site name in the query
    if (req.query.site) {
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

      // Get all the node hostnames at the site
      const nodes = site.nodes.map((node) => node.hostname);

      // If the site exists
      if (nodes) {
        var usage = await getSummaryStats(nodes, correctedMetric, daysInt);
        res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate')
        res.status(200).json(usage);
      } else {
        // Return a 404
        res.status(404).json({ error: `Unable to find any nodes in the site list` });
      }
    } else {

      // Get all the node hostnames at all the sites
      const nodes = sitesList.sites.map((site) => site.nodes ? site.nodes.map((node) => node.hostname) : null).flat();

      // Eliminate the nulls from the array
      const nonNullNodes = nodes.filter((node) => node != null) as string[];

      // If the site exists
      if (nonNullNodes) {
        var usage = await getSummaryStats(nonNullNodes, correctedMetric, daysInt);
        console.log("In handler for metric: " + correctedMetric + " Got: " + usage);
        res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate')
        res.status(200).json(usage);
      } else {
        // Return a 404
        res.status(404).json({ error: `Unable to find any nodes in the site list` });
      }
    }
  } else {
    // Return a 400
    res.status(400).json({ error: 'Site name not specified' });
  }


}