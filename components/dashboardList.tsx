import { use, useMemo } from 'react'
import { Site } from '../lib/states'
import Link from 'next/link'


function SiteDashboardButton({ site }: { site: Site }) {
  return (
    <>
      <Link href={{
        pathname: `${site.active ? '/site' : ''}`,
        query: site.active ? { site: site.name } : {}
      }}  className={'bg-white rounded-xl p-4 flex content-center ' +
      (site.active ? 'border-green-600 border-4 transform transition hover:scale-105' : 'hover:cursor-default')}>
        <div className='flex items-center gap-2'>
          <img src={site.logo} alt={site.name} className='object-scale-down h-12 w-12' />
          <div className='flex flex-col justify-start text-left'>
            <div className='font-bold'>{site.name}</div>
            <div className='text-sm font-thin'>{site.city}, {site.state}</div>
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
          <h1 className='text-xl p-4 text-center font-bold p-1'>Site Dashboards</h1>
          <div className='grid lg:grid-cols-4 lg:grid-rows-3 md:grid-cols-2 grid-cols-1 gap-4 p-1'>
            {sortedSites.map((site) => (
              <SiteDashboardButton site={site} key={site.name} />
            ))}
          </div>
        </div>
      </div >
    </>
  )
}