import fs from 'fs';
import path from 'path';

// Export the sites type
export interface Site {
  name: string;
  lat: number;
  log: number;
  logo: string;
  url: string;
  hostname: string;
  dashboard: string;
  active: boolean;
  state: string;
  city: string;
}

export function getStates() {

  // Read in the ../data/us_states.json file
  const statesFile = fs.readFileSync(path.join(process.cwd(), 'data', 'high_res_states.geojson'), 'utf8');
  const states = JSON.parse(statesFile);

  // Create a list of state names we care about
  const stateNames = [
    'South Dakota',
    'Nebraska',
    'Missouri',
    'Kansas',
    'Oklahoma',
    'Arkansas'
  ];

  // Filter the states to only include the ones in stateNames
  states.features = states.features.filter((state: any) => stateNames.includes(state.properties.NAME));
  return states;

}

export function getSites() {
  // Read in the data/sites.json file
  const sitesFile = fs.readFileSync(path.join(process.cwd(), 'data', 'sites.json'), 'utf8');
  const sitesObj = JSON.parse(sitesFile);

  // Convert the json to a list of sites of type Site
  const sites: Site[] = sitesObj.sites.map((site: any) => {
    return site as Site;
  });
  return sites;
}