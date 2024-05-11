

export default async function downloadSummaryStats() {
  // Just download and return the results from https://s3-west.nrp-nautilus.io/dweitzel/gp-engine/website/summary_stats.json
  // This is a static file that is updated every day
  const url = 'https://s3-west.nrp-nautilus.io/dweitzel/gp-engine/website/summary_stats.json';
  const response = await fetch(url);
  const data = await response.json();
  return data;
}