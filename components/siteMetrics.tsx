'use client'
import type { Site } from "../lib/states";
import useSWR from 'swr'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
  LineController,
  BarController
} from 'chart.js';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors,
  LineController,
  BarController
);
import { Bar, Chart } from "react-chartjs-2";
import { ArrowPathIcon } from "@heroicons/react/24/outline";


// Define the fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json());

type NodeMetrics = {
  time: number,
  value: {
    namespace: string,
    value: number
  }[]
}

function NodeChart({ data, title, site, setSelectedNamespace }: { data: NodeMetrics[], title: string, site: Site, setSelectedNamespace: (namespace: string | null) => void }) {

  if (data == null) {
    return (
      <>
        <div className="flex gap-2 items-center">
          <div>
            <ArrowPathIcon className='animate-spin h-6 w-6' />
          </div>
          <div className='text-4xl font-bold'>Loading...</div>
        </div>
      </>
    )
  }
  // Get all the labels
  let dateLabels = new Set<string>();
  data.forEach((d) => {
    dateLabels.add(new Date(d.time).toLocaleDateString());
  });

  // Get all the namespaces
  let namespaceLabels = new Set<string>();
  data.forEach((d) => {
    d.value.forEach((v) => {
      namespaceLabels.add(v.namespace);
    });
  });

  // Create the chart.js data object
  let labels = Array.from(dateLabels);
  const chartData = {
    labels,
    datasets: Array.from(namespaceLabels).map((n) => {
      return {
        label: n,
        type: 'bar' as "bar" | "line",
        data: data.map((d) => {
          let value = d.value.find((v) => v.namespace === n);
          if (value) {
            return value.value;
          } else {
            return 0;
          }
        })
      }
    })
  }

  // Create a dataset for a line for the maximum expected number of gpus, to show utilization

  // Calculate the sum of gpus for the site
  let totalGpus = 0;
  site.nodes.forEach((node) => {
    if (node.active)
      totalGpus += node.gpus;
  });

  totalGpus = totalGpus * 24;

  // Create a dataset for the line
  const lineData = {
    label: 'Max GPUs',
    type: 'line' as const,
    data: data.map((d) => totalGpus),
    //borderColor: 'red',
    fill: false,
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 0,
    pointHitRadius: 0,
  }

  // Add it to the chartData
  chartData.datasets.push(lineData);


  //console.log(chartData);
  const config = {
    plugins: {
      title: {
        display: true,
        text: title,
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true
      }
    },
    onHover: function (e: any, elements: any, chart: any) {
      if (elements.length > 0) {
        setSelectedNamespace(chartData.datasets[elements[0].datasetIndex].label);
      } else {
        setSelectedNamespace(null);
      }
    }
  }

  return (
    <>
      <Chart type="bar" data={chartData} options={config} />
    </>
  )
}

export default function SiteMetrics({ site, setSelectedNamespace }: { site: Site, setSelectedNamespace: (namespace: string | null) => void }) {
  // Get the prometheus metrics for the site

  // Query the API to get the cpu metrics

  // Query the API to get the memory metrics

  // Query the API to get the gpu metrics
  const { data, error } = useSWR(`/api/nodeMetrics?site=${site.name}&metric=gpu`, fetcher);
  //console.log(data);

  return (
    <div className='bg-gray-100 py-4 lg:min-h-[40em]'>
      <NodeChart data={data} title="GPU Hours for last 30 days by namespace" site={site} setSelectedNamespace={setSelectedNamespace} />
    </div>
  )


}
