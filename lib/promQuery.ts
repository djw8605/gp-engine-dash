import { PrometheusDriver, QueryResult, RangeVector, SampleValue, InstantVector } from 'prometheus-query';

const prom = new PrometheusDriver({
  endpoint: "https://thanos.nrp-nautilus.io/",
  baseURL: "/api/v1", // default value
  timeout: 60000
});

type NamespaceValue = {
  namespace: string,
  value: number
}


export async function getUsage(nodes: string[]) {
  return new Promise<Object>((resolve, reject) => {

    // Create dates for start and end times, endtime is now, starttime is 1 month ago
    const endTime = new Date();
    const startTime = new Date();
    startTime.setMonth(startTime.getMonth() - 1);
    const step = 3600 * 24;

    // Join the nodes into a string
    const queryNodes = nodes.join('|');
    const query = `sum by (namespace, resource) (sum_over_time(namespace_allocated_resources{node=~'${queryNodes}'}[1d:1h]))`;

    // Log the query
    console.log(query);
    prom.rangeQuery(
      query,
      startTime,
      endTime,
      step
    ).then((result) => {
      //console.log(result);
      // log each result
      //result.result.forEach((r) => {
      //  console.log(r);
      //});

      // Group the results by time
      let groupedResults = new Map<number, NamespaceValue[]>();
      result.result.forEach((r: RangeVector) => {

        if (r.metric.labels && (r.metric.labels as { resource?: string }).resource && (r.metric.labels as { resource?: string }).resource !== "nvidia_com_gpu") {
          return;
        }
        r.values.forEach((v: SampleValue) => {
          let date = v.time;
          if (!r.metric.labels || !(r.metric.labels as { namespace: string }).namespace) {
            return;
          }
          let namespaceValue = { namespace: (r.metric.labels as { namespace: string }).namespace, value: v.value };
          if (groupedResults.has(date.getTime())) {
            groupedResults.get(date.getTime())?.push(namespaceValue);
          } else {
            groupedResults.set(date.getTime(), [namespaceValue]);
          }
        });
      });
      //console.log(groupedResults);
      // Convert from a map to an array of keys and values
      let groupedArray = Array.from(groupedResults, ([time, value]) => ({ time, value }));
      // Sort the array by time
      groupedArray.sort((a, b) => a.time - b.time);
      resolve(groupedArray);
    });
  });


}

async function queryProm(query: string, endTime: Date) {
  return new Promise<Object>((resolve, reject) => {
    // Join the nodes into a string
    // Log the query
    //console.log(query);
    prom.instantQuery(
      query,
      endTime
    ).then((result: QueryResult) => {

      // Loop through the result, returning a map of namespace to value
      let namespaceValues = new Map<string, number>();
      result.result.forEach((r: InstantVector) => {
        if (!r.metric.labels || !(r.metric.labels as { namespace: string }).namespace) {
          return;
        }
        namespaceValues.set((r.metric.labels as { namespace: string }).namespace, r.value.value);
      });

      // Convert from a map to an array of keys and values
      let groupedArray = Array.from(namespaceValues, ([namespace, value]) => ({ namespace, value }));
      resolve(groupedArray);
    });
  });
}

export async function getSummaryStats(nodes: string[], metric: string, range: number = 30) {

    // Create dates for start and end times, endtime is now, starttime is 1 month ago
    const queryNodes = nodes.join('|');
    let query: string;
    // If the range is larger than 30, make 30 day steps and do a sum at the end
    let results: any[] = [];
    let startEpoch = new Date('2023-10-01').getTime() / 1000;
    let endEpoch = startEpoch + 30 * 24 * 3600;
    while (endEpoch < new Date().getTime() / 1000) {
      query = `sum by (namespace, resource) (sum_over_time(namespace_allocated_resources{node=~'${queryNodes}',resource='${metric}'}[30d:1h]@${startEpoch}))`;
      let result = await queryProm(query, new Date(endEpoch));
      results.push(result);
      startEpoch = endEpoch;
      endEpoch = startEpoch + 30 * 24 * 3600;
    }
    query = `sum by (namespace, resource) (sum_over_time(namespace_allocated_resources{node=~'${queryNodes}',resource='${metric}'}[30d:1h]@${startEpoch}))`;
    let result = await queryProm(query, new Date(endEpoch));
    results.push(result);
    
    var namespace_results: Map<string, number> = new Map();
    // Loop through the results array 

    results.forEach( (element) => {
      element.forEach ( (namespace_value: {namespace: string, value: number}) => {
        let cur_value = namespace_results.get(namespace_value.namespace);
        if (cur_value == undefined) {
          cur_value = 0;
        }
        namespace_results.set(namespace_value.namespace, cur_value + namespace_value.value)
      });
    });

    // Convert the map to an array of key and values objects:
    let to_return = Array<{namespace: string, value: number}>();
    namespace_results.forEach((value, namespace) => {
      console.log([namespace, value]);
      to_return.push({namespace: namespace, value: value})
    })
    return to_return;



}