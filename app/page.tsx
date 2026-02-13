import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { Landmark, Translocator } from '@/types/poi'
import GameMap from '@/components/GameMap'
import { StrictMode } from 'react'
import { POIGraph } from '@/utils/graph'

async function getData<T>(fileName: string): Promise<T[]> {
  const filePath = path.join(process.cwd(), fileName);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return yaml.load(fileContents) as T[];
}

export default async function HomePage() {
  const landmarksData = await getData<Landmark>('landmarks.yaml');
  const translocatorsData = await getData<Translocator>('translocators.yaml');
  // TODO: move this somewhere more suitable
  const graph = new POIGraph()
  for (const landmark of landmarksData) {
    graph.addNode(landmark.name, landmark.location, 'landmark', landmark.desc)
  }
  for (const translocator of translocatorsData) {
    graph.addNode(translocator.name + " Origin", translocator.origin, 'translocator', translocator.desc, translocator.color)
    graph.addNode(translocator.name + " Destination", translocator.destination, 'translocator', translocator.desc, translocator.color)
    graph.linkTranslocators(translocator.name + " Origin", translocator.name + " Destination")
  }

  return (
    <main>
      <StrictMode>
      <GameMap 
        nodes={graph.getAllNodes()}
      />
      </StrictMode>
    </main>
  );
}