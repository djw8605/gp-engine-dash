'use client'
import { Chart } from "chart.js";
import type { Site } from "../lib/states";
import useSWR from 'swr'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors
} from 'chart.js';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors
);
import { Bar } from "react-chartjs-2";


// Define the fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json());

type NodeMetrics = {
  time: number,
  value: {
    namespace: string,
    value: number
  }[]
}

function NodeChart({ data, title }: { data: NodeMetrics[], title: string }) {

  if (data == null) {
    return (
      <>
        <div>Loading...</div>
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

  console.log(chartData);
  const config = {
    plugins: {
      title: {
        display: true,
        text: title,
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true
      }
    }
  }

  return (
    <>
      <Bar data={chartData} options={config} />
    </>
  )
}

export default function SiteMetrics({ site }: { site: Site }) {
  // Get the prometheus metrics for the site

  // Query the API to get the cpu metrics

  // Query the API to get the memory metrics

  // Query the API to get the gpu metrics
  const { data, error } = useSWR(`/api/nodeMetrics?site=${site.name}&metric=gpu`, fetcher);
  console.log(data);

  return (
    <div className='bg-gray-100 py-4'>
      <NodeChart data={data} title="GPU Hours for last 30 days by namespace" />
    </div>
  )


}
