import useSWR from "swr";
import { Site } from "../lib/states";
import { ArrowPathIcon, ComputerDesktopIcon, CpuChipIcon, UserGroupIcon } from "@heroicons/react/24/outline";

/* 

Color palette from https://coolors.co/166534-754668-b5dda4-f9eccc-ee6c4d
Primary Green: #166534
Eggplant :#754668
Light Green: #B5DDA4
light Yellow: #F9ECCC
Burnt orange: #EE6C4D
*/

// Define the fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SummaryStat({ title, value, icon, bgColor, error }: { title: string, value: number | null, icon?: any, bgColor?: string, error: string}) {
  return (
    <>
      <div className={`${!bgColor ? "bg-slate-100" : ""} rounded-sm p-4 py-6 flex text-white w-full`}
        style={{ backgroundColor: bgColor as string }}>
        <div className="flex lg:gap-8 gap-4 items-center w-full">
          {icon && <span className='text-gray-200 h-[5em] w-[7em]'>{icon}</span>}
          <div className='flex flex-col gap-1 w-full'>
            {value ? (
              <div className='text-4xl font-bold w-full'>{value && Math.round(value).toLocaleString()}
              </div>) : error ? (
                <div className='text-4xl font-bold w-full'>Error, please refresh</div>
              ) :
              (
                <div className="flex gap-2 items-center">
                  <div>
                    <ArrowPathIcon className='animate-spin h-6 w-6' />
                  </div>
                  <div className='text-4xl font-bold'>Loading...</div>
                </div>
              )
            }

            <div className='text-sm'>{title}</div>
            <div className="text-xs text-gray-200">Since October 1, 2023</div>
          </div>
        </div>
      </div>
    </>
  )
}


export default function SummaryStats({ sites, cachedData }: { sites: Site[], cachedData: any }) {

  // Calculate the name of all the nodes
  const nodes = sites.map((site) => site.nodes ? site.nodes.map((node) => node.hostname) : null).flat();
  const { data, error } = useSWR(`/api/summaryStats`, fetcher);

  // Calculate the total GPU hours from the data
  let totalGpuHours: number = 0;
  let totalCpuHours: number = 0;
  let totalGpuNamespaces: number = 0;
  let tmpData = cachedData;
  //console.log("Data: ", tmpData);
  if (data) {
    tmpData = data.data;
  }
  for (const [key, value] of Object.entries(tmpData)) {
    console.log(key, value);
    if (Object.hasOwn((value as {}), "cpu")) {
      totalCpuHours += (value as { cpu: number }).cpu;
    }

    // Loop the values regex for nvidia_com
    for (const [namespaceKey, namespaceValue] of Object.entries(value as {})) {
      if (namespaceKey.match(/nvidia_com.*/)) {
        totalGpuHours += (namespaceValue as number);
        totalGpuNamespaces++;
      }
    }
  }



  return (
    <>
      <div className='text-xl font-bold p-2'>Summary Statistics since Oct 1, 2023</div>
      <div className="grid grid-flow-auto lg:grid-cols-3 gap-2 p-2">
        <SummaryStat title='Research Groups Enabled' value={totalGpuNamespaces} icon={<UserGroupIcon />} bgColor="#754668" error={error} />
        <SummaryStat title='GPU Hours' value={totalGpuHours} icon={<ComputerDesktopIcon />} bgColor="#EE6C4D" error={error} />
        <SummaryStat title='CPU Hours' value={totalCpuHours} icon={<CpuChipIcon />} bgColor="#68805e" error={error} />
      </div>
    </>
  )

}
