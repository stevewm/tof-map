'use client'

import { Polyline } from 'react-leaflet'
import L from 'leaflet'
import { useNavigation } from '@/contexts/NavigationContext'
import { convertToLeafletCoords } from '@/utils/game'
import { GraphNode } from '@/utils/graph'
import { useMemo } from 'react'

export default function NavigationLayer() {
  const { route, origin, destination, graph } = useNavigation()

  const pathData = useMemo(() => {
    if (!route || !origin || !destination || !graph) return null

    const coords = route.nodes
      .map(id => graph.getNode(id))
      .filter((n): n is GraphNode => n !== undefined)
      .map(n => {
        const c = convertToLeafletCoords(n.location)
        return [c.z, c.x] as L.LatLngTuple
      })

    if (coords.length < 2) return null

    const originCoords = convertToLeafletCoords(origin.location)
    const destCoords = convertToLeafletCoords(destination.location)

    const intermediateTranslocators = route.nodes.slice(1, -1)
      .map(nodeId => graph.getNode(nodeId))
      .filter((n): n is GraphNode => n !== undefined && n.type === 'translocator')
      .map(n => {
        const c = convertToLeafletCoords(n.location)
        return [c.z, c.x] as L.LatLngTuple
      })

    return { coords, originCoords, destCoords, intermediateTranslocators }
  }, [route, origin, destination, graph])

  if (!pathData) return null

  return (
    <>
      <Polyline
        renderer={L.svg()}
        positions={pathData.coords}
        pathOptions={{
          color: '#22c55e',
          weight: 4,
          opacity: 1,
          dashArray: '10, 15',
          lineCap: 'round',
          lineJoin: 'round',
        }}
        className="animated-route-path"
      />
    </>
  )
}
