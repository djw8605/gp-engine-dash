import Layout from '../components/layout'
import { getSites } from '../lib/states';
import { TeamMember, getTeamMembers } from '../lib/team'
import { GetStaticProps } from 'next'
import type { Site, Node } from '../lib/states'
import { useSearchParams } from 'next/navigation'
import CloseSiteMap from '../components/closeSiteMap';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'


function NodeSummaryStatus({ node }: { node: Node }) {

  return (
    <>
      <div className='bg-slate-100 rounded-xl p-4 flex items-center gap-2'>
        <div className='flex items-center gap-2'>
          {node.active ? <CheckCircleIcon className='text-green-600 h-6 w-6' /> : <XCircleIcon className='text-red-600 h-6 w-6' />}
          <div className='text-sm'>{node.hostname}</div>
          <div className='flex'>
            {node.tags && node.tags.map((tag) => (
              <div className=' bg-slate-600 text-white rounded-lg p-1 text-xs'>{tag}</div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default function SiteDetail({ sites }: { sites: Site[] }) {

  // Get the site name from the URL
  const searchParams = useSearchParams();
  const siteName = searchParams.get('site');
  const site = sites.find((site) => site.name === siteName);
  if (!site) {
    return (
      <>
        <Layout>
          <section className='w-full flex py-4'>
            <div className='container mx-auto lg:grid lg:grid-cols-5 lg:gap-4'>
              <div className='hero-text text-green-800 bg-opacity-80 bg-white col-span-3'>
                <h1 className='text-3xl font-bold'>Site Not Found</h1>
                <p className='text-xl pt-4'>The requested site was not found.</p>
              </div>
            </div>
          </section>
        </Layout >
      </>
    )
  }

  return (
    <>
      <Layout>
        <section className='w-full flex py-4'>
          <div className='container mx-auto lg:grid lg:grid-cols-4 lg:gap-4'>
            <div className='hero-text col-span-2'>
              <div className="flex items-center gap-2 py-4">
                <img src={site.logo} alt={site.name} className='object-scale-down h-10 w-10' />
                <h1 className='text-3xl font-bold text-green-800'>{site?.name}</h1>
              </div>
              <div className='lg:grid lg:grid-cols-1 gap-4'>
                {site.nodes.map((node) => (
                  <NodeSummaryStatus node={node} key={node.hostname} />
                ))}
                <div className='flex flex-col gap-1'>
                  <div className='text-xl pt-4 font-bold'>
                    Legend
                  </div>
                  <div className='flex items-center gap-2'>
                    <CheckCircleIcon className='text-green-600 h-6 w-6' /> = Active
                  </div>
                  <div className='flex items-center gap-2'>
                    <XCircleIcon className='text-red-600 h-6 w-6' /> = Inactive
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className=' bg-slate-600 text-white rounded-lg p-1 text-xs'>gp-engine</div> = purchased by GP-ENGINE
                  </div>
                  <div className='flex items-center gap-2'>
                    <div>
                      <div className=' bg-slate-600 text-white rounded-lg p-1 text-xs'>gp-argo</div>
                    </div>
                    <div> = purchased by <a className='underline' href="https://gp-argo.greatplains.net/">GP-ARGO</a>
                    </div>
                  </div>
                </div>
              </div>
              <p className='text-xl pt-4'></p>
            </div>

            <div className='col-span-2 lg:min-h-[20em] min-h-[10em] w-full h-full rounded-xl drop-shadow-md'>
              <CloseSiteMap site={site} />
            </div>


          </div>
        </section>
      </Layout >
    </>
  )


}


// Static preload sites data
export const getStaticProps: GetStaticProps = async () => {

  const sites = getSites();
  return {
    props: {
      sites
    },
  };
};