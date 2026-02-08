import { ReactNode, useCallback } from 'react'
import { useMap } from 'react-leaflet'

interface LeftSidebarProps {
  children: ReactNode
}

export default function LeftSidebar({ children }: LeftSidebarProps) {
  const map = useMap()

  // Disable map interactions when mouse enters sidebar
  const handleMouseEnter = useCallback(() => {
    map.dragging.disable()
    map.scrollWheelZoom.disable()
    map.doubleClickZoom.disable()
  }, [map])

  // Re-enable map interactions when mouse leaves sidebar
  const handleMouseLeave = useCallback(() => {
    map.dragging.enable()
    map.scrollWheelZoom.enable()
    map.doubleClickZoom.enable()
  }, [map])

  return (
    <div 
      className="absolute top-4 left-4 bottom-16 z-1000 w-80 flex flex-col gap-4 pointer-events-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <div key={index} className="pointer-events-auto min-h-0 flex flex-col">
              {child}
            </div>
          ))
        : <div className="pointer-events-auto min-h-0 flex flex-col">{children}</div>
      }
    </div>
  )
}