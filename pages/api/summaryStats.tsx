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
        var usage = await getSummaryStats(nodes, correctedMetric);
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
        var usage = await getSummaryStats(nonNullNodes, correctedMetric);
        console.log("In handler" + usage);
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