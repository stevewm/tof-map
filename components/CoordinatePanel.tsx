'use client'

import { useMapEvents } from 'react-leaflet'
import { useState } from 'react'
import { IconMapPin } from '@tabler/icons-react'

export default function CoordinatePanel() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  
  useMapEvents({
    mousemove: (e) => {
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })

  if (!coords) return null

  return (
    <div className="leaflet-bottom leaflet-left" style={{ pointerEvents: 'none' }}>
      <div className="leaflet-control m-4" style={{ pointerEvents: 'auto' }}>
        <div className="overflow-hidden shadow-xl rounded-xl bg-card px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconMapPin className="h-3.5 w-3.5" />
            <span>X: {coords.lng.toFixed(0)}, Z: {(-coords.lat).toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}