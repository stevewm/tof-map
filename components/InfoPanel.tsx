import { Button } from "./ui/button"
import { ButtonGroup } from "./ui/button-group"
import { IconX, IconMapPin, IconArrowRight, IconNavigationFilled } from "@tabler/icons-react"
import { GraphNode } from "@/utils/graph"
import { CopyCommandButton } from "./CopyWaypointButton"
import Image from "next/image"
import { useMap } from "react-leaflet"
import { convertToLeafletCoords } from "@/utils/game"
import { useEffect } from "react"
import slugify from "slugify"

interface InfoPanelProps {
  node: GraphNode
  onClose: () => void
  onLinkedToClick?: (linkedTLId: string) => void
  onNavigate?: (node: GraphNode) => void
}

export default function InfoPanel({ node, onClose, onLinkedToClick, onNavigate }: InfoPanelProps) {
  const map = useMap()

  useEffect(() => {
    const coords = convertToLeafletCoords(node.location)
    map.setView([coords.z, coords.x], map.getZoom())
  }, [node.id, map, node.location])

  const handleClose = () => {
    map.dragging.enable()
    map.scrollWheelZoom.enable()
    map.doubleClickZoom.enable()
    onClose()
  }

  return (
    <div className="w-80 overflow-hidden shadow-xl rounded-xl bg-card">
      {/* Hero Image */}
      <div className="relative h-40 w-full bg-muted">
        <Image
          src={`/images/${slugify(node.id).toLowerCase()}.png`}
          alt={node.id}
          fill
          className="object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={handleClose}
        >
          <IconX className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title & Location */}
        <div>
          <h3 className="font-semibold text-lg leading-tight">{node.id}</h3>
          <h4 className="text-sm text-muted-foreground">{node.type.charAt(0).toUpperCase() + node.type.slice(1)}</h4>
          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
            <IconMapPin className="h-3.5 w-3.5" />
            <span>{node.location.x}, {node.location.y}, {node.location.z}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <ButtonGroup>
          <Button 
            variant="outline" 
            title="Navigate to waypoint"
            onClick={() => onNavigate?.(node)}
          >
            <IconNavigationFilled className="h-4 w-4" /> Navigate
          </Button>
          {node.type === 'translocator' && node.linkedTranslocatorId && (
            <Button
              variant="outline"
              onClick={() => { 
                onLinkedToClick?.(node.linkedTranslocatorId!)
              }}
            >
              <IconArrowRight className="h-4 w-4" />
              Show linked
            </Button>
          )}
          <CopyCommandButton icon="home" name={node.id} location={node.location} />
        </ButtonGroup>
      </div>
    </div>
  )
}