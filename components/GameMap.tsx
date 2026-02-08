'use client'

import dynamic from 'next/dynamic'
import { convertToLeafletCoords } from '@/utils/game'
import { useState, useEffect, useMemo } from 'react'
import InfoPanel from './InfoPanel'
import CoordinatePanel from './CoordinatePanel'
import { GraphNode, POIGraph } from '@/utils/graph'
import LeftSidebar from './LeftSidebar'
import SearchPanel from './SearchPanel'
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext'
import NavigationPanel from './nav/NavigationPanel'

const Map = dynamic(() => import('@/components/map/Map'), { 
  loading: () => <p>Loading map...</p>,
  ssr: false
})

const LandmarksLayer = dynamic(() => import('@/components/map/LandmarksLayer'), { 
  ssr: false
})

const TranslocatorsLayer = dynamic(() => import('@/components/map/TranslocatorsLayer'), { 
  ssr: false
})

const NavigationLayer = dynamic(() => import('@/components/nav/NavigationLayer'), {
  ssr: false
})

const TileLayer = dynamic(() => import('react-leaflet/TileLayer').then(mod => mod.TileLayer), {
  ssr: false
})


interface GameMapProps {
  nodes: GraphNode[]
}

function GameMapContent({ nodes }: GameMapProps) {
  const location = convertToLeafletCoords({ x: 0, y: 100, z: 0 })
  const [selectedPoint, setSelectedPoint] = useState<GraphNode | null>(null)
  const { isNavigating, startNavigation, clearNavigation, setGraph } = useNavigation()

  // Separate nodes into landmarks and translocators
  const lm = nodes.filter((n) => n.type === 'landmark')
  const tl = nodes.filter((n) => n.type === 'translocator')

  // Build graph from nodes
  const graph = useMemo(() => {
    const g = new POIGraph()
    
    // Add all nodes
    for (const node of nodes) {
      g.addNode(node.id, node.location, node.type, node.color)
    }

    // Link translocators (they come in pairs: "Name Origin" and "Name Destination")
    const translocators = nodes.filter(n => n.type === 'translocator')
    const origins = translocators.filter(n => n.id.endsWith(' Origin'))
    
    for (const origin of origins) {
      const baseName = origin.id.replace(' Origin', '')
      const destination = translocators.find(n => n.id === `${baseName} Destination`)
      if (destination) {
        g.linkTranslocators(origin.id, destination.id)
      }
    }

    return g
  }, [nodes])

  // Set graph in context
  useEffect(() => {
    setGraph(graph)
  }, [graph, setGraph])

  const handleNavigate = (node: GraphNode) => {
    startNavigation(node)
    setSelectedPoint(null)
  }

  const handleCloseNavigation = () => {
    clearNavigation()
  }

  return (
    <div style={{ 
        height: "100vh",
        width: "100%",
        }}>
      <Map 
        position={[location.z, location.x]} 
        zoom={-4}
        >
        {/* <TileLayer
          url="/world/5/{x}_{y}.png"
          tileSize={256}
          zIndex={-1000}
        /> */}
        <LandmarksLayer 
          landmarks={lm} 
          onPointClick={(node) => setSelectedPoint(node)}/>
        <TranslocatorsLayer 
          translocators={tl} 
          onPointClick={(node) => setSelectedPoint(node)}/>
        <NavigationLayer />
        <CoordinatePanel /> 
        <LeftSidebar>
          {!isNavigating && (
            <SearchPanel
              suggestions={nodes.map(n => n.id)}
              onSelect={(id) => {
                const node = nodes.find(n => n.id === id)
                if (node) {
                  setSelectedPoint(node)
                }
              }}
              nodes={nodes}
            />
          )}
          {isNavigating ? (
            <NavigationPanel 
              nodes={nodes}
              onClose={handleCloseNavigation}
            />
          ) : selectedPoint && (
            <InfoPanel 
              node={selectedPoint}
              onClose={() => setSelectedPoint(null)}
              onLinkedToClick={(nodeId) => setSelectedPoint(nodes.find(n => n.id === nodeId) || null)}
              onNavigate={handleNavigate}
            />
          )}
        </LeftSidebar>
      </Map>
    </div>
  )
}

export default function GameMap({ nodes }: GameMapProps) {
  return (
    <NavigationProvider>
      <GameMapContent nodes={nodes} />
    </NavigationProvider>
  )
}