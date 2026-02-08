'use client'
import { LayerGroup, Marker, useMap } from "react-leaflet"
import { convertToLeafletCoords } from "@/utils/game"
import POITooltip from "@/components/POITooltip"
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { GraphNode } from '@/utils/graph';

interface LandmarksLayerProps {
  landmarks: GraphNode[]
  onPointClick?: (node: GraphNode) => void
}

interface DiamondIconProps {
  bg?: string;
  label?: string;
}

function DiamondIcon({ bg = '#4a90d9', label }: DiamondIconProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          width: 14,
          height: 14,
          background: bg,
          border: '2px solid #fff',
          transform: 'rotate(45deg)',
          boxShadow: '0 0 4px #000',
        }}
      />
      {label && (
        <span
          style={{
            marginTop: 6,
            whiteSpace: 'nowrap',
            color: '#fff',
            fontSize: 12,
            textShadow: '1px 1px 2px #000',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

function createIcon(bg?: string, label?: string) {
  const html = renderToStaticMarkup(<DiamondIcon bg={bg} label={label} />);
  return L.divIcon({
    className: '',
    html,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export default function LandmarksLayer({ landmarks, onPointClick }: LandmarksLayerProps) {
  const map = useMap()

  return (
    <LayerGroup>
      {landmarks.map((landmark, index) => {
        const c = convertToLeafletCoords(landmark.location)
        return (
          <Marker
            eventHandlers={{
              click: () => { 
                onPointClick?.(landmark)
                map.setView([c.z, c.x], -1)
              },
            }}
            key={landmark.id || index} 
            position={[c.z, c.x]}
            icon={createIcon(landmark.color, landmark.id)}
          >
            <POITooltip 
              name={landmark.id} 
              poi={landmark.location} 
            />
          </Marker>
        )
      })}
    </LayerGroup>
  )
}