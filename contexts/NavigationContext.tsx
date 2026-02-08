'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react'
import { GraphNode, PathResult, POIGraph, PathfindingConfig } from '@/utils/graph'

interface NavigationState {
  isNavigating: boolean
  origin: GraphNode | null
  destination: GraphNode | null
  route: PathResult | null
  maxWalkDistance: number
}

interface NavigationContextValue extends NavigationState {
  startNavigation: (destination: GraphNode) => void
  setOrigin: (node: GraphNode | null) => void
  setDestination: (node: GraphNode | null) => void
  setMaxWalkDistance: (distance: number) => void
  clearNavigation: () => void
  graph: POIGraph | null
  setGraph: (graph: POIGraph) => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false)
  const [origin, setOriginState] = useState<GraphNode | null>(null)
  const [destination, setDestinationState] = useState<GraphNode | null>(null)
  const [maxWalkDistance, setMaxWalkDistanceState] = useState(500)
  const [graph, setGraphState] = useState<POIGraph | null>(null)

  // Derive route from current state
  const route = useMemo(() => {
    if (!graph || !origin || !destination) return null
    const config: Partial<PathfindingConfig> = { maxWalkDistance }
    return graph.findPath(origin.id, destination.id, config)
  }, [graph, origin, destination, maxWalkDistance])

  const setGraph = useCallback((g: POIGraph) => setGraphState(g), [])

  const startNavigation = useCallback((dest: GraphNode) => {
    setIsNavigating(true)
    setDestinationState(dest)
    setOriginState(null)
  }, [])

  const setOrigin = useCallback((node: GraphNode | null) => setOriginState(node), [])
  const setDestination = useCallback((node: GraphNode | null) => setDestinationState(node), [])
  const setMaxWalkDistance = useCallback((distance: number) => setMaxWalkDistanceState(distance), [])

  const clearNavigation = useCallback(() => {
    setIsNavigating(false)
    setOriginState(null)
    setDestinationState(null)
    // No need to clear route, it's derived
  }, [])

  const value = useMemo<NavigationContextValue>(() => ({
    isNavigating,
    origin,
    destination,
    route,
    maxWalkDistance,
    startNavigation,
    setOrigin,
    setDestination,
    setMaxWalkDistance,
    clearNavigation,
    graph,
    setGraph,
  }), [
    isNavigating, origin, destination, route, maxWalkDistance,
    startNavigation, setOrigin, setDestination, setMaxWalkDistance,
    clearNavigation, graph, setGraph,
  ])

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}