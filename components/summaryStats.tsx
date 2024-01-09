'use client';

import useSWR from "swr";
import { Site } from "../lib/states";
import { ComputerDesktopIcon, CpuChipIcon, UserGroupIcon } from "@heroicons/react/24/outline";

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

function SummaryStat({ title, value, icon, bgColor }: { title: string, value: number | null, icon?: any, bgColor?: string }) {
  return (
    <>
      <div className={`${!bgColor ? "bg-slate-100" : ""} rounded-xl p-4 py-6 flex gap-2 text-white`}
      style={{ backgroundColor: bgColor as string }}>
        <div className="flex gap-4 items-center">
          {icon && <span className='text-gray-200 h-12 w-12'>{icon}</span>}
          <div className='flex flex-col gap-1 text-center'>
            <div className='text-2xl font-bold w-full'>{value && Math.round(value).toLocaleString()}</div>
            <div className='text-sm'>{title}</div>
          </div>
        </div>
      </div>
    </>
  )
}


export default function SummaryStats({ sites }: { sites: Site[] }) {

  // Calculate the name of all the nodes
  const nodes = sites.map((site) => site.nodes ? site.nodes.map((node) => node.hostname) : null).flat();
  const { data, error } = useSWR(`/api/summaryStats?metric=gpu`, fetcher);
  const { data: cpuData, error: error2 } = useSWR(`/api/summaryStats?metric=cpu`, fetcher);
  console.log(data);
  let totalGpuHours: number | null = null;
  if (data) {
    totalGpuHours = data.reduce((acc: number, d: { namespace: string, value: number }) => acc + d.value, 0);
  }
  let totalCpuHours: number | null = null;
  if (cpuData) {
    totalCpuHours = cpuData.reduce((acc: number, d: { namespace: string, value: number }) => acc + d.value, 0);
  }

  return (
    <>
      <div className='text-xl font-bold py-2'>Summary Statistics of last 30 days</div>
      <div className="grid lg:grid-cols-4 gap-2 py-4">
        <SummaryStat title='Research Groups Enabled' value={data ? data.length : null} icon={<UserGroupIcon />} bgColor="#754668" />
        <SummaryStat title='GPU Hours' value={totalGpuHours} icon={<ComputerDesktopIcon />} bgColor="#EE6C4D"/>
        <SummaryStat title='CPU Hours' value={totalCpuHours} icon={<CpuChipIcon />} bgColor="#68805e"/>
      </div>
    </>
  )

}