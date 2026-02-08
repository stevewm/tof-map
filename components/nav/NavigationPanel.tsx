'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useMap } from 'react-leaflet'
import { useNavigation } from '@/contexts/NavigationContext'
import { GraphNode } from '@/utils/graph'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import AutocompleteInput from '../AutocompleteInput'
import { IconX, IconFlag, IconMapPin, IconArrowsUpDown } from '@tabler/icons-react'
import RouteDisplay from './RouteDisplay'
import { useRouteMapSync } from '@/hooks/useRouteMapSync'

interface NavigationPanelProps {
  nodes: GraphNode[]
  onClose: () => void
}

export default function NavigationPanel({ nodes, onClose }: NavigationPanelProps) {
  const map = useMap()
  const originInputRef = useRef<HTMLInputElement>(null)
  
  const {
    origin,
    destination,
    route,
    maxWalkDistance,
    setOrigin,
    setDestination,
    setMaxWalkDistance,
    clearNavigation,
    graph,
  } = useNavigation()

  const suggestions = nodes.map(n => n.id)

  // Local input state - only used while typing, synced on selection
  const [originText, setOriginText] = useState(origin?.id ?? '')
  const [destinationText, setDestinationText] = useState(destination?.id ?? '')

  // Map sync hook
  useRouteMapSync({ map, route, graph })

  // Focus origin input on mount
  useEffect(() => {
    const timer = setTimeout(() => originInputRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleOriginChange = useCallback((value: string) => {
    setOriginText(value)
    if (!value) setOrigin(null)
  }, [setOrigin])

  const handleOriginSelect = useCallback((id: string) => {
    const node = nodes.find(n => n.id === id)
    if (node) {
      setOriginText(node.id)
      setOrigin(node)
    }
  }, [nodes, setOrigin])

  const handleDestinationChange = useCallback((value: string) => {
    setDestinationText(value)
    if (!value) setDestination(null)
  }, [setDestination])

  const handleDestinationSelect = useCallback((id: string) => {
    const node = nodes.find(n => n.id === id)
    if (node) {
      setDestinationText(node.id)
      setDestination(node)
    }
  }, [nodes, setDestination])

  const handleSwapLocations = useCallback(() => {
    const prevOrigin = origin
    const prevDestination = destination
    setOrigin(prevDestination)
    setDestination(prevOrigin)
    setOriginText(prevDestination?.id ?? '')
    setDestinationText(prevOrigin?.id ?? '')
  }, [origin, destination, setOrigin, setDestination])

  const handleClose = useCallback(() => {
    map.dragging.enable()
    map.scrollWheelZoom.enable()
    map.doubleClickZoom.enable()
    clearNavigation()
    onClose()
  }, [map, clearNavigation, onClose])

  return (
    <div className="w-80 overflow-hidden shadow-xl rounded-xl bg-card flex flex-col max-h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2 shrink-0">
        <h3 className="font-semibold text-lg leading-tight">Navigation</h3>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={handleClose}
        >
          <IconX className="h-4 w-4" />
        </Button>
      </div>

      {/* Location Inputs */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 items-center">
          <div className="flex flex-col gap-2 flex-1">
            <AutocompleteInput
              ref={originInputRef}
              suggestions={suggestions}
              value={originText}
              onChange={handleOriginChange}
              onSelect={handleOriginSelect}
              placeholder="Choose starting point..."
              icon={<IconMapPin className="h-4 w-4 text-emerald-500" />}
              className="h-9 text-sm"
            />
            <AutocompleteInput
              suggestions={suggestions}
              value={destinationText}
              onChange={handleDestinationChange}
              onSelect={handleDestinationSelect}
              placeholder="Choose destination..."
              icon={<IconFlag className="h-4 w-4 text-rose-500" />}
              className="h-9 text-sm"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwapLocations}
            disabled={!origin && !destination}
            className="shrink-0"
          >
            <IconArrowsUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Walk Distance Slider */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Max walk distance</span>
            <span>{maxWalkDistance} blocks</span>
          </div>
          <input
            type="range"
            min={100}
            max={5000}
            step={100}
            value={maxWalkDistance}
            onChange={(e) => setMaxWalkDistance(Number(e.target.value))}
            className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      <Separator className="shrink-0" />

      {/* Route Display */}
      <div className="px-4 py-3 overflow-y-auto min-h-0 flex-1">
        {!origin && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Select a starting point to see directions
          </p>
        )}
        {origin && destination && !route && (
          <p className="text-sm text-rose-500 text-center py-4">
            No route found. Try increasing the walk distance.
          </p>
        )}
        {route && graph && origin && destination && (
          <RouteDisplay route={route} graph={graph} origin={origin} destination={destination} />
        )}
      </div>
    </div>
  )
}