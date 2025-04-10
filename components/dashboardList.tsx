import { use, useMemo } from 'react'
import { Site } from '../lib/states'
import Link from 'next/link'


function SiteDashboardButton({ site }: { site: Site }) {
  // Add the tags as badges
  // Loop through each of the nodes, gathering unique tags
  // and then display them as badges
  const tags = site.nodes ? site.nodes.map((node) => node.tags ? node.tags : []).flat() : [];
  const uniqueTags = [...new Set(tags)];
  // No matter what, if one of the tags is "gp-engine", make that first
  const gpEngineTagIndex = uniqueTags.indexOf('gp-engine');
  if (gpEngineTagIndex > -1) {
    uniqueTags.splice(gpEngineTagIndex, 1);
    uniqueTags.unshift('gp-engine');
  }
  const badges = uniqueTags.map((tag) => (
    <div className='bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300' key={tag}>{tag}</div>
  ));



  return (
    <>
      <Link href={{
        pathname: `${site.active ? '/site' : ''}`,
        query: site.active ? { site: site.name } : {}
      }}  className={'bg-white p-3 flex content-center drop-shadow-md ' +
      (site.active ? 'border-green-600 border-4 transform transition hover:scale-105' : 'hover:cursor-default')}>
        <div className='flex items-center gap-2'>
          <img src={site.logo} alt={site.name} className='object-scale-down h-12 w-12' />
          <div className='flex flex-col justify-start text-left'>
            <div className='font-bold'>{site.name}</div>
            <div className='text-sm font-thin'>{site.city}, {site.state}</div>
            <div className='flex flex-wrap gap-1 mt-2'>
              {badges}
            </div>
          </div>
        </div>
      </Link>
    </>
  )
}


export default function DashboardList({ sites }: { sites: Site[] }) {

  // Sort the sites by name
  const sortedSites = useMemo(() => {
    return sites.sort((a, b) => a.name.localeCompare(b.name));
  }
    , [sites]);

  return (
    <>
      <div className='bg-gray-100 py-4'>
        <div className='container mx-auto'>
          <h1 className='text-4xl font-bold py-4'>Site Dashboards</h1>
          <div className='grid lg:grid-cols-4 lg:grid-rows-3 md:grid-cols-2 grid-cols-1 gap-4'>
            {sortedSites.map((site) => (
              <SiteDashboardButton site={site} key={site.name} />
            ))}
          </div>
        </div>
      </div >
    </>
  )
}