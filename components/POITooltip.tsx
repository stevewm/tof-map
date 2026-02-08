import { POI } from "@/types/poi";
import { Tooltip } from "react-leaflet";

interface POITooltipProps {
  name: string
  poi: POI
}

export default function POITooltip({ name, poi }: POITooltipProps) {
  return (
  <Tooltip>
    <p>
      <b>{ name }</b>
      <br />
      { poi.x }, { poi.y }, { poi.z }
    </p>
  </Tooltip>
  )
}