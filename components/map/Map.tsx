import { MapContainer } from "react-leaflet"
import L from 'leaflet';
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { ReactNode } from "react";

type MapProps = {
  position: [number, number]
  zoom: number
  children?: ReactNode
}

export default function Map({ position, zoom, children }: MapProps) {
  return (
    <MapContainer
      crs={L.CRS.Simple}
      renderer={L.canvas({ padding: 1.0})}
      center={position}
      scrollWheelZoom={true}
      zoom={zoom}
      minZoom={-5}
      maxZoom={1}
      zoomControl={false}
      style={{ 
        height: "100%", 
        width: "100%"

      }}
    >
      {children}
    </MapContainer>
  )
}