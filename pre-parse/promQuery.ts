import { PrometheusDriver, QueryResult, RangeVector, SampleValue, InstantVector } from 'prometheus-query';

const prom = new PrometheusDriver({
  endpoint: "https://thanos.nrp-nautilus.io/",
  baseURL: "/api/v1", // default value
  timeout: 60000
});

type NamespaceValue = Map<string, Map<string, number>>;

/*
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
*/
async function queryProm(query: string, endTime: Date) {
  return new Promise<NamespaceValue>((resolve, reject) => {
    // Join the nodes into a string
    // Log the query
    //console.log(query);
    //console.log(endTime);
    let namespaceValues = new Map<string, Map<string, number>>();
    prom.instantQuery(
      query
    ).then((result: QueryResult) => {
      // Loop through the result, returning a map of namespace to value
      result.result.forEach((r: InstantVector) => {
        //console.log(r);
        if (!r.metric.labels || !(r.metric.labels as { namespace: string }).namespace) {
          //console.log("No namespace");
          return;
        }
        if (!r.metric.labels || !(r.metric.labels as { resource: string }).resource) {
          //console.log("No resource");
          return;
        }
        let namespace_name = (r.metric.labels as { namespace: string }).namespace
        let resource = (r.metric.labels as { resource: string }).resource;
        if (!namespaceValues.has(namespace_name)) {
          namespaceValues.set(namespace_name, new Map<string, number>());
        }
        let resourceMap = namespaceValues.get(namespace_name);
        resourceMap?.set(resource, r.value.value);
      });
      // Convert from a map to an array of keys and values
      //let groupedArray = Array.from(namespaceValues, ([namespace, value]) => ({ namespace, value }));
      resolve(namespaceValues);
    });
  });
}

export async function getSummaryStats(nodes: string[], startDate: Date) {

    // Create dates for start and end times, endtime is now, starttime is 1 month ago
    const queryNodes = nodes.join('|');
    let query: string;
    // If the range is larger than 30, make 30 day steps and do a sum at the end
    let results: NamespaceValue[] = [];
    let startEpoch = startDate.getTime() / 1000;
    let endEpoch = startEpoch + 30 * 24 * 3600;
    while (startEpoch < new Date().getTime() / 1000) {
      console.log("Querying between " + new Date(startEpoch*1000) + " and " + new Date(endEpoch*1000));
      query = `sum by (namespace, resource) (sum_over_time(namespace_allocated_resources{node=~'${queryNodes}'}[30d:1h]@${endEpoch}))`;
      let result = await queryProm(query, new Date(endEpoch));
      results.push(result);
      
      /*
      if (metric == "nvidia_com_gpu") {
        // Add all of the gpu values together
        let total = 0;
        result.forEach ( (namespace_value: {namespace: string, value: number}) => {
          total += namespace_value.value;
        });
        console.log("Between " + new Date(startEpoch*1000) + " and " + new Date(endEpoch*1000) + " Total: " + total);
      }
      */
      
      startEpoch = endEpoch;
      endEpoch = startEpoch + 30 * 24 * 3600;
    }
    //console.log("Metric: " + metric + ", Querying between " + new Date(startEpoch*1000) + " and " + new Date(endEpoch*1000));
    /*
    query = `sum by (namespace, resource) (sum_over_time(namespace_allocated_resources{node=~'${queryNodes}',resource='${metric}'}[30d:1h]@${startEpoch}))`;
    let result = await queryProm(query, new Date(endEpoch));
    results.push(result);
    if (metric == "nvidia_com_gpu") {
      // Add all of the gpu values together
      let total = 0;
      result.forEach ( (namespace_value: {namespace: string, value: number}) => {
        total += namespace_value.value;
      });
      console.log("Between " + new Date(startEpoch*1000) + " and " + new Date(endEpoch*1000) + " Total: " + total);
    }
    */
    var namespace_results: NamespaceValue = new Map<string, Map<string, number>>();
    // Loop through the results array 

    //console.log(results);
    results.forEach( (element) => {
      //console.log(element);
      element.forEach ( (values, namespace) => {
        let cur_namespace = namespace_results.get(namespace);
        if (cur_namespace == undefined) {
          cur_namespace = new Map<string, number>();
          namespace_results.set(namespace, cur_namespace);
        }
        values.forEach( (value, resource) => {
          let cur_value = cur_namespace.get(resource);
          if (cur_value == undefined) {
            cur_value = 0;
          }
          cur_namespace.set(resource, cur_value + value);
        });
      });
    });

    //console.log(namespace_results);

    /*
    // Convert the map to an array of key and values objects:
    let to_return = Array<{namespace: string, value: number}>();
    namespace_results.forEach((value, namespace) => {
      //console.log([namespace, value]);
      to_return.push({namespace: namespace, value: value})
    })
    */
    return namespace_results;



}