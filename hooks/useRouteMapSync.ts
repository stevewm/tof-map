import { useEffect } from 'react'
import { Map } from 'leaflet'
import { PathResult, POIGraph, GraphNode } from '@/utils/graph'
import { convertToLeafletCoords } from '@/utils/game'

interface UseRouteMapSyncOptions {
  map: Map
  route: PathResult | null
  graph: POIGraph | null
}

/**
 * Syncs the map view to fit the current route bounds.
 */
export function useRouteMapSync({ map, route, graph }: UseRouteMapSyncOptions) {
  useEffect(() => {
    if (!route || !graph) return

    const coords = route.nodes
      .map(id => graph.getNode(id))
      .filter((n): n is GraphNode => n !== undefined)
      .map(n => convertToLeafletCoords(n.location))

    if (coords.length > 1) {
      const bounds = coords.map(c => [c.z, c.x] as [number, number])
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [route, graph, map])
}