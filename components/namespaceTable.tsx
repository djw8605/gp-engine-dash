
// import swr
import useSWR from 'swr'
import { Site } from '../lib/states';
import { useState } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

// TData
type Namespace = {
  name: string,
  gpusHours: number,
  institution: string,
  pi: string,
}

// Default fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NamespaceTable({ sites }: { sites: Site[] }) {

  // Calculate the name of all the nodes
  const nodes = sites.map((site) => site.nodes ? site.nodes.map((node) => node.hostname) : null).flat();
  const { data, error } = useSWR(`/api/summaryStats?metric=gpu`, fetcher);

  // Data now includes the list of namespaces:

  // Set namespace data useState
  const [namespaceDataState, setNamespaceData] = useState<Namespace[]>([]);

  const { data: namespaceData, error: namespaceError } = useSWR(`/api/namespaceInfo`, fetcher, { refreshInterval: 10000 });

  if (data && namespaceData && namespaceDataState.length === 0) {
    // Create an emtpy array of namespaces
    let namespaceDataArray: Namespace[] = [];
    console.log(data);
    console.log(namespaceData);

    // Match the namespaces with the data in the namespaceData

    // For each namespace in the data, find the matching namespace in namespaceData
    data.forEach((d: { namespace: string, value: number }) => {

      let namespaceMeta = namespaceData.values.Namespaces.find((n: { Name: string }) => n.Name === d.namespace);

      if (namespaceMeta) {
        let namespaceForArray: Namespace = {
          name: namespaceMeta.Name,
          gpusHours: d.value,
          institution: namespaceMeta.Institution,
          pi: namespaceMeta.PI,
        }
        namespaceDataArray.push(namespaceForArray);
      }
    });

    // Sor the namespaceDataArray by gpusHours
    namespaceDataArray.sort((a, b) => b.gpusHours - a.gpusHours);
    setNamespaceData(namespaceDataArray);
  }

  if (data) {
    console.log(namespaceDataState);
  }

  const columnHelper = createColumnHelper<Namespace>();
  const columns = [
    columnHelper.accessor('name', {
      cell: info => <span className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>{info.getValue()}</span>,
      header: 'Namespace',
      footer: info => info.column.id,
    }),
    columnHelper.accessor('institution', {
      cell: info => info.getValue(),
      header: 'Institution',
      footer: info => info.column.id,
    }),
    columnHelper.accessor('pi', {
      cell: info => info.getValue(),
      header: 'PI',
      footer: info => info.column.id,
    }),
    columnHelper.accessor('gpusHours', {
      cell: info => info.getValue(),
      header: 'GPU Hours',
      footer: info => info.column.id,
    }),
  ];
  const table = useReactTable({
    data: namespaceDataState,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className='p-2'>
        <table className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400'>
          <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className='px-2 py-3' scope='col'>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className='px-2 py-1'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )

}