import { use, useMemo } from 'react'
import { Site } from '../lib/states'


function SiteDashboardButton({ site }: { site: Site }) {
  return (
    <button className={'bg-white rounded-xl p-4 flex items-center gap-2 ' + 
      (site.active ? 'border-green-600 border-4 transform transition hover:scale-105': 'hover:cursor-default')}>
      <img src={site.logo} alt={site.name} className='object-scale-down h-10 w-10' />
      <div className='flex flex-col justify-start text-left'>
        <div className='font-bold'>{site.name}</div>
        <div className='text-sm font-thin'>{site.city}, {site.state}</div>
      </div>
    </button>
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
      <div className='bg-gray-100 pt-4 pb-4'>
        <div className='container mx-auto'>
          <h1 className='text-xl p-4 text-center font-bold'>Site Dashboards</h1>
          <div className='grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4'>
            {sortedSites.map((site) => (
              <SiteDashboardButton site={site} key={site.name}/>
            ))}
          </div>
        </div>
      </div >
    </>
  )
}