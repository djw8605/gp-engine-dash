
import { Site } from '../lib/states'

function SummaryStat({ title, value }: { title: string, value: string }) {
  return (
    <>
      <div className='bg-slate-100 p-4 flex items-center justify-center gap-2'>
        <div className='flex flex-col gap-1 text-center'>
          <div className='text-2xl font-bold'>{value}</div>
          <div className='text-sm'>{title}</div>
        </div>
      </div>
    </>
  )
}

export default function SiteSummaryStats({ sites }: { sites: Site[] }) {

  return (
      <>
      <div className='text-xl font-bold py-2'>Summary Statistics</div>
      <div className='grid lg:grid-cols-4 grid-flow-col gap-2'>
        <SummaryStat title='Institutions' value={`${sites.length}`} />
        <SummaryStat title='Nodes Active' value={`${sites.reduce((acc, site) => acc + (site.nodes ? site.nodes.length : 0), 0)}`} />
        <SummaryStat title='GPUs' value={`${sites.reduce((acc, site) => acc + (site.nodes ? site.nodes.reduce((acc, node) => acc + node.gpus, 0) : 0), 0)}`} />
        <SummaryStat title='CPUs' value={`${sites.reduce((acc, site) => acc + (site.nodes ? site.nodes.reduce((acc, node) => acc + node.cpus, 0) : 0), 0)}`} />
      </div>
      </>
    )

}
