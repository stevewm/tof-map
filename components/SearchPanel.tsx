import { useMap } from 'react-leaflet'
import { convertToLeafletCoords } from '@/utils/game'
import { GraphNode } from '@/utils/graph'
import { IconSearch } from '@tabler/icons-react'
import AutocompleteInput from './AutocompleteInput'

interface SearchPanelProps {
  suggestions: string[]
  onSelect: (id: string) => void
  nodes: GraphNode[]
}

export default function SearchPanel({ suggestions, onSelect, nodes }: SearchPanelProps) {
  const map = useMap()
  
  const handleSelect = (id: string) => {
    const node = nodes.find(n => n.id === id)
    if (node) {
      const coords = convertToLeafletCoords(node.location)
      map.setView([coords.z, coords.x], -1)
    }
    onSelect(id)
  }

  return (
    <div className="w-80">
      <AutocompleteInput
        suggestions={suggestions}
        onSelect={handleSelect}
        placeholder="Search places..."
        icon={<IconSearch className="h-4 w-4 text-muted-foreground" />}
        className="border-0 shadow-xl rounded-xl bg-card"
      />
    </div>
  )
}