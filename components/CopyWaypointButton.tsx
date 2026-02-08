"use client"
import { IconCopy } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { POI } from "@/types/poi"

interface CopyCommandButtonProps {
    icon: string
    name: string
    location: POI
}

export function CopyCommandButton( { icon, name, location }: CopyCommandButtonProps ) {
  /* /waypoint addati [icon] [x] [y] [z] [pinned] [color] [title]: */
  const text = `/waypoint addati ${icon} ${location.x} ${location.y} ${location.z} true white ${name.replaceAll(' ', '_')}`
  return (
    <Button 
      variant="outline"
      title="Copy to clipboard"
      onClick={ () => {
        navigator.clipboard.writeText(text)
      } }
    >
      <IconCopy />
    </Button>
  )
}