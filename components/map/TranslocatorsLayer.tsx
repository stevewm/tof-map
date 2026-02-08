'use client'
import { CircleMarker, Polyline, Tooltip, useMap } from "react-leaflet"
import { calculateBlockDistance, convertToLeafletCoords } from "@/utils/game"
import POITooltip from "@/components/POITooltip"
import { Fragment } from 'react';
import { GraphNode } from '@/utils/graph';

interface TranslocatorsLayerProps {
  translocators: GraphNode[]
  onPointClick?: (node: GraphNode) => void
}

export default function TranslocatorsLayer({ translocators, onPointClick }: TranslocatorsLayerProps) {
  const map = useMap()
  
  // Track rendered links to avoid drawing lines twice
  const renderedLinks = new Set<string>()
  
  // Create a lookup map for quick access to linked nodes
  const nodeMap = new Map(translocators.map(t => [t.id, t]))
  
  return (
    <>
      {translocators.map((node) => {
        const pos = convertToLeafletCoords(node.location)
        const linkedNode = node.linkedTranslocatorId ? nodeMap.get(node.linkedTranslocatorId) : null
        const defaultColor = 'cyan';

        const shouldRenderLink = linkedNode && !renderedLinks.has(node.linkedTranslocatorId!)
        if (linkedNode) {
          renderedLinks.add(node.id)
        }
        
        const linkedPos = linkedNode ? convertToLeafletCoords(linkedNode.location) : null
        
        return (
          <Fragment key={node.id}>
            {/* Route Line */}
            {shouldRenderLink && linkedPos && (
              <Polyline
                eventHandlers={{
                  click: () => {
                    onPointClick?.(node)
                    map.setView([pos.z, pos.x], -1)
                  }
                }}
                positions={[[pos.z, pos.x], [linkedPos.z, linkedPos.x]]}
                pathOptions={{ 
                  color: node.color || defaultColor,
                  weight: 3, 
                  opacity: 0.8,
                }}
              >
                <Tooltip sticky={true}>
                  <p>
                    <b>{node.id.replace(' Origin', '').replace(' Destination', '')} Route</b><br />
                    {Math.round(calculateBlockDistance(node.location, linkedNode!.location))} blocks
                  </p>
                </Tooltip>
              </Polyline>
            )}
            
            {/* Translocator Node */}
            <CircleMarker
              eventHandlers={{
                click: () => { 
                  onPointClick?.(node)
                  map.setView([pos.z, pos.x], -1)
                }
              }}
              center={[pos.z, pos.x]}
              pathOptions={{ 
                color: "white",
                weight: 1.5, 
                fillOpacity: 1, 
                fillColor: node.color || defaultColor
              }}
              radius={5}
            >
              <POITooltip
                name={node.id}
                poi={node.location}
              />
            </CircleMarker>
          </Fragment>
        )
      })}
    </>
  )
}