import { Map, Marker } from "react-map-gl";
import type { Site } from "../lib/states";


// Do a close map of the site
export default function CloseSiteMap(
  { site }: { site: Site }) {

  // Initial view state
  const initialViewState={
    latitude: site.lat,
    longitude: site.log,
    zoom: 16,
    pitch: 50
  };



  return (
    <>
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/djw8605/clqxzrwwi00q201nveq5sas1r"
        interactive={true}
        initialViewState={initialViewState}
      >
        <Marker
          latitude={site.lat}
          longitude={site.log}
          anchor="bottom"
        >
          <div className="rounded-xl p-2 bg-white drop-shadow-xl close-in-map-marker">
            <img src={site.logo} alt={site.name} className='object-scale-down h-10 w-10' />
          </div>
        </Marker>
      </Map>
    </>
  )
}