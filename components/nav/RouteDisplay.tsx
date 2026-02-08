import { IconWalk, IconSparkles, IconFlag } from '@tabler/icons-react'
import { PathResult, POIGraph, GraphNode } from '@/utils/graph'
import { calculateBlockDistance } from '@/utils/game'
import RouteStep from './RouteStep'

interface RouteDisplayProps {
  route: PathResult
  graph: POIGraph
  origin: GraphNode
  destination: GraphNode
}

/*
Walk speed (base):
https://www.vintagestory.at/forums/topic/7378-walking-speed-and-how-long-is-a-day/ 
*/
const baseWalkSpeedBlocksPerMinute = 204;

export default function RouteDisplay({ route, graph, origin, destination }: RouteDisplayProps) {
  return (
<div className="space-y-4">
      <p className="text-sm text-muted-foreground px-3">~{Math.round(route.totalDistance/baseWalkSpeedBlocksPerMinute)} minutes walk</p>
      

      <div className="space-y-2">
        {route.segments.map((segment) => {
          const toNode = graph.getNode(segment.to)
          const isWalk = segment.type === 'walk'

          return (
            <RouteStep
              key={`${segment.from}-${segment.to}`}
              icon={isWalk ? <IconWalk className="h-4 w-4" /> : <IconSparkles className="h-4 w-4" />}
              title={isWalk ? `Walk to ${segment.to}` : `Teleport to ${segment.to}`}
              subtitle={isWalk ? `${segment.distance} blocks` : 'Instant'}
              coordinates={toNode?.location}
            />
          )
        })}

        <RouteStep
          icon={<IconFlag className="h-4 w-4" />}
          title={`Arrive at ${destination.id}`}
          subtitle={`${Math.round(calculateBlockDistance(origin.location, destination.location))} blocks travelled (${route.totalDistance} walked)`}
        />
      </div>
    </div>
  )
}