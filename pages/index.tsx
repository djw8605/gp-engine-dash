import Head from 'next/head';
import Layout from '../components/layout';
import { GetStaticProps } from 'next';
import Map, { Source, Layer, Marker, Popup } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import { useEffect, useState, useMemo, useRef, ReactElement } from 'react';
import { getStates, getSites, Site } from '../lib/states';
import type { FillLayer, LineLayer, MapRef } from 'react-map-gl';
import bbox from '@turf/bbox';
import DashboardList from '../components/dashboardList';


const sw = new mapboxgl.LngLat(-73.9876, 40.7661);
const ne = new mapboxgl.LngLat(-73.9397, 40.8002);
const llb = new mapboxgl.LngLatBounds(sw, ne);

export default function Home(
  { statesGeoJson, sites }: { statesGeoJson: GeoJSON.FeatureCollection, sites: Site[] }
) {

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapSectionContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef>(null);

  // Set the fill layer
  const gpEngineLayer: FillLayer = {
    id: 'gp-engine-states',
    type: 'fill',
    source: 'states',
    //'source-layer': 'landuse',
    //filter: ['==', 'class', 'park'],
    paint: {
      'fill-color': '#166534',
      'fill-opacity': 0.5
    }
  };

  const gpEngineBorders: LineLayer = {
    'id': 'state-borders',
    'type': 'line',
    'source': 'states',
    'layout': {},
    'paint': {
      'line-color': '#14532d',
      'line-width': 2
    }
  }

  // Calcualte the bounding box of the states

  // Initialize the initial view state
  const initialViewState = useMemo(() => {
    const [minLng, minLat, maxLng, maxLat] = bbox(statesGeoJson);
    const sw = new mapboxgl.LngLat(minLng, minLat);
    const ne = new mapboxgl.LngLat(maxLng, maxLat);
    const llb = new mapboxgl.LngLatBounds(sw, ne);

    return {
      bounds: llb,
      fitBoundsOptions: {
        padding: 20
      },
      //projection: 'globe'
    };
  }, []);

  let firstSymbolId = "";
  useEffect(() => {
    // Get the layers from the map
    const layers = mapRef.current?.getStyle().layers;
    if (!layers) return;
    // Find the index of the first symbol layer in the map style.
    for (const layer of layers) {
      if (layer.type === 'symbol') {
        firstSymbolId = layer.id;
        break;
      }
    }
  }, []);

  const [popupInfo, setPopupInfo] = useState<Site | null>(null);
  const pins = useMemo(() => {
    return sites.map((site) => {
      console.log("Site: " + site.name);
      console.log("Lat: " + site.lat);
      console.log("Log: " + site.log);
      return (
        <Marker key={site.name}
          longitude={site.log}
          latitude={site.lat}
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setPopupInfo(site);
          }}
        >
          <img src={site.logo} alt={site.name} className='object-scale-down h-10 w-10' />
        </Marker>
      )
    });
  }, []);

  console.log("pins: " + pins)

  /*
  useEffect(() => {
    const [minLng, minLat, maxLng, maxLat] = bbox(statesGeoJson);
    const sw = new mapboxgl.LngLat(minLng, minLat);
    const ne = new mapboxgl.LngLat(maxLng, maxLat);
    const llb = new mapboxgl.LngLatBounds(sw, ne);
    // Need to figure out how to offset the map to center in the right

    let offset = 0;
    // Calculate the center of both the mapContainer and the mapSectionContainer
    if (mapContainer.current != null && mapSectionContainer.current != null) {
      const mapContainerRect = mapContainer.current.getBoundingClientRect();
      const mapContainerCenterX = mapContainerRect.left + (mapContainerRect.width / 2);
      const mapSectionContainerRect = mapSectionContainer.current.getBoundingClientRect();
      const mapSectionContainerCenterX = mapSectionContainerRect.left + (mapSectionContainerRect.width / 2);
      offset = mapContainerCenterX / 2 - mapSectionContainerCenterX / 2;
      console.log("offset: " + offset);
    } else {
      if (mapContainer.current == null) console.log("mapContainer is null");
      if (mapSectionContainer.current == null) console.log("mapSectionContainer is null");
    }
    mapRef.current?.fitBounds(llb, {
      offset: [offset, 0],
      padding: 20
    });
  }, [mapContainer.current?.getBoundingClientRect(), mapSectionContainer.current?.getBoundingClientRect()]);

  */

  return (
    <>
      <Head>
        <title>GP-ENGINE Dashboard</title>
      </Head>
      <Layout home>
        <section className='w-full flex relative py-4' ref={mapSectionContainer}>
          <div className='container mx-auto lg:grid lg:grid-cols-5 lg:gap-4 z-10'>
            <div className='hero-text text-green-800 bg-opacity-80 bg-white col-span-2'>
              <h1 className='text-3xl font-bold'>Great Plains Extended Network of GPUs for Interactive Experimenters</h1>
              <p className='text-xl pt-4'>Welcome to the GP-ENGINE Dashboard</p>
            </div>
            <div ref={mapContainer} className='map-container lg:min-h-[30em] min-h-[10em] w-full h-full col-span-3 rounded-xl drop-shadow-md'>
              <Map
                ref={mapRef}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                mapStyle="mapbox://styles/djw8605/clqxzrwwi00q201nveq5sas1r"
                initialViewState={initialViewState}
              >
                <Source id="states" type="geojson" data={statesGeoJson}>
                  <Layer {...gpEngineLayer} beforeId={firstSymbolId} />
                  <Layer {...gpEngineBorders} beforeId={firstSymbolId} />
                </Source>

                {pins}

                {popupInfo && (
                  <Popup
                    anchor="top"
                    longitude={popupInfo.log}
                    latitude={popupInfo.lat}
                    onClose={() => setPopupInfo(null)}
                  >
                    <h2>{popupInfo.name}</h2>
                  </Popup>

                )}
              </Map>
            </div>
          </div>
          <div className='absolute inset-0 flex items-center justify-center'>

          </div>

        </section >
        <section>
          <DashboardList sites={sites} />
        </section>

      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {

  // Load in the geojson in data/us_states.geojson
  const statesGeoJson = getStates();
  const sites = getSites();
  return {
    props: {
      statesGeoJson,
      sites
    },
  };
};
