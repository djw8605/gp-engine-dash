import type { NextApiRequest, NextApiResponse } from 'next'
import downloadSummaryStats from '../../lib/downloadSummaryStats'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  
  // Just download and return the results from https://s3-west.nrp-nautilus.io/dweitzel/gp-engine/website/summary_stats.json
  // This is a static file that is updated every day
  let data = await downloadSummaryStats();
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate')
  res.status(200).json(data);


}