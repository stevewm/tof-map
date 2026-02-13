import { POI } from "@/types/poi"

/**
 * Represents a node in the navigation graph
 */
export interface GraphNode {
    id: string
    location: POI
    type: 'landmark' | 'translocator'
    description?: string
    /** For translocators: the ID of the linked translocator */
    linkedTranslocatorId?: string
    /** Custom color for the node */
    color?: string
}

/**
 * Result of a pathfinding operation
 */
export interface PathResult {
    nodes: string[]
    totalDistance: number
    segments: PathSegment[]
}

export interface PathSegment {
    from: string
    to: string
    type: 'walk' | 'teleport'
    distance: number
}

/**
 * Configuration for the pathfinding algorithm
 */
export interface PathfindingConfig {
    maxWalkDistance: number
    /** Weight multiplier for walking (higher = less preferred) */
    walkWeightMultiplier: number
    /** Weight for teleport edges (lower = more preferred) */
    teleportWeight: number
}

const DEFAULT_CONFIG: PathfindingConfig = {
    maxWalkDistance: 500,
    walkWeightMultiplier: 1.0,
    teleportWeight: 0.1,
}

/**
 * Calculates Euclidean distance between two nodes (ignoring Y)
 */
export function calculateDistance(a: GraphNode, b: GraphNode): number {
    const dx = a.location.x - b.location.x
    const dz = a.location.z - b.location.z
    return Math.sqrt(dx * dx + dz * dz)
}

type State = { nodeId: string; canWalk: boolean }

/**
 * Navigation graph for finding optimal paths between POIs.
 *
 * Constraints:
 * - Landmarks can only be start or end points, never intermediate waypoints
 * - Walking distance between any two points must not exceed maxWalkDistance
 * - Translocator travel is preferred over walking
 * - Must teleport after walking to a translocator (can't walk TL -> TL without teleporting)
 */
export class POIGraph {
    private nodes: Map<string, GraphNode> = new Map()
    private translocatorLinks: Map<string, string> = new Map()

    /**
     * Adds a node to the graph
     */
    addNode(id: string, location: POI, type: GraphNode['type'], description?: string, color?: string): void {
        this.nodes.set(id, {
            id,
            location,
            type,
            description: description || '',
            color: color
        })
    }

    /**
     * Links two translocator nodes bidirectionally
     */
    linkTranslocators(idA: string, idB: string): void {
        const nodeA = this.nodes.get(idA)
        const nodeB = this.nodes.get(idB)

        if (!nodeA || !nodeB) {
            throw new Error(`Cannot link: node not found`)
        }
        if (nodeA.type !== 'translocator' || nodeB.type !== 'translocator') {
            throw new Error(`Cannot link: both nodes must be translocators`)
        }

        nodeA.linkedTranslocatorId = idB
        nodeB.linkedTranslocatorId = idA
        this.translocatorLinks.set(idA, idB)
        this.translocatorLinks.set(idB, idA)
    }

    /**
     * Removes a node from the graph
     */
    removeNode(id: string): void {
        const node = this.nodes.get(id)
        if (node?.linkedTranslocatorId) {
            const linked = this.nodes.get(node.linkedTranslocatorId)
            if (linked) {
                linked.linkedTranslocatorId = undefined
            }
            this.translocatorLinks.delete(id)
            this.translocatorLinks.delete(node.linkedTranslocatorId)
        }
        this.nodes.delete(id)
    }

    /**
     * Gets a node by ID
     */
    getNode(id: string): GraphNode | undefined {
        return this.nodes.get(id)
    }

    /**
     * Gets all nodes
     */
    getAllNodes(): GraphNode[] {
        return Array.from(this.nodes.values())
    }

    /**
     * Gets the display color for a node
     */
    getNodeColor(id: string): string | undefined {
        const node = this.nodes.get(id)
        return node?.color
    }

    /**
     * Finds the shortest path between two points.
     *
     * Uses Dijkstra's algorithm with state tracking to enforce:
     * - Landmarks only at start/end
     * - Translocator links must be taken (can't walk between unlinked TLs)
     * - Walking distance constraints
     */
    findPath(startId: string, endId: string, config: Partial<PathfindingConfig> = {}): PathResult | null {
        const fullConfig = { ...DEFAULT_CONFIG, ...config }
        const startNode = this.nodes.get(startId)
        const endNode = this.nodes.get(endId)

        if (!startNode || !endNode) {
            return null
        }

        const dist = new Map<string, number>()
        const prev = new Map<string, { state: State; edgeType: 'walk' | 'teleport' }>()
        const visited = new Set<string>()
        const queue: { state: State; distance: number }[] = []

        const startState: State = { nodeId: startId, canWalk: true }
        dist.set(this.stateKey(startState), 0)
        queue.push({ state: startState, distance: 0 })

        let bestEndState: State | null = null
        let bestEndDist = Infinity

        while (queue.length > 0) {
            queue.sort((a, b) => a.distance - b.distance)
            const current = queue.shift()!
            const currentKey = this.stateKey(current.state)

            if (visited.has(currentKey)) continue
            visited.add(currentKey)

            if (current.distance >= bestEndDist) continue

            if (current.state.nodeId === endId) {
                if (current.distance < bestEndDist) {
                    bestEndDist = current.distance
                    bestEndState = current.state
                }
                continue
            }

            const neighbors = this.getNeighbors(current.state, endId, fullConfig)

            for (const neighbor of neighbors) {
                const neighborKey = this.stateKey(neighbor.state)
                const newDist = current.distance + neighbor.weight

                if (newDist < (dist.get(neighborKey) ?? Infinity)) {
                    dist.set(neighborKey, newDist)
                    prev.set(neighborKey, { state: current.state, edgeType: neighbor.edgeType })
                    queue.push({ state: neighbor.state, distance: newDist })
                }
            }
        }

        if (!bestEndState) return null

        return this.reconstructPath(bestEndState, prev)
    }

    private stateKey(state: State): string {
        return `${state.nodeId}:${state.canWalk}`
    }

    /**
     * Gets valid neighbors from the current state
     */
    private getNeighbors(
        current: State,
        endId: string,
        config: PathfindingConfig
    ): { state: State; weight: number; edgeType: 'walk' | 'teleport' }[] {
        const neighbors: { state: State; weight: number; edgeType: 'walk' | 'teleport' }[] = []
        const currentNode = this.nodes.get(current.nodeId)!

        // Option 1: Teleport via translocator link (always available if link exists)
        if (currentNode.type === 'translocator' && currentNode.linkedTranslocatorId) {
            neighbors.push({
                state: { nodeId: currentNode.linkedTranslocatorId, canWalk: true },
                weight: config.teleportWeight,
                edgeType: 'teleport',
            })
        }

        // Option 2: Walk (only if canWalk is true)
        if (current.canWalk) {
            // Can walk directly to destination if within range
            const endNode = this.nodes.get(endId)
            if (endNode) {
                const distToEnd = calculateDistance(currentNode, endNode)
                if (distToEnd <= config.maxWalkDistance) {
                    neighbors.push({
                        state: { nodeId: endId, canWalk: true },
                        weight: distToEnd * config.walkWeightMultiplier,
                        edgeType: 'walk',
                    })
                }
            }

            // Can walk to any translocator within range
            for (const [nodeId, node] of this.nodes) {
                if (node.type !== 'translocator') continue
                if (nodeId === current.nodeId) continue

                // Don't walk to own linked translocator (must teleport instead)
                if (currentNode.linkedTranslocatorId === nodeId) continue

                const distance = calculateDistance(currentNode, node)
                if (distance <= config.maxWalkDistance) {
                    neighbors.push({
                        // After walking to a TL, canWalk becomes false (must teleport next)
                        state: { nodeId, canWalk: false },
                        weight: distance * config.walkWeightMultiplier,
                        edgeType: 'walk',
                    })
                }
            }
        }

        return neighbors
    }

    /**
     * Reconstructs the path from the predecessor map
     */
    private reconstructPath(
        endState: State,
        prev: Map<string, { state: State; edgeType: 'walk' | 'teleport' }>
    ): PathResult {
        const nodes: string[] = []
        const segments: PathSegment[] = []

        interface ChainEntry {
            state: State
            edgeType?: 'walk' | 'teleport'
        }

        const stateChain: ChainEntry[] = []
        let current: State | undefined = endState

        while (current) {
            const key = this.stateKey(current)
            const predecessor = prev.get(key)
            stateChain.unshift({ state: current, edgeType: predecessor?.edgeType })
            current = predecessor?.state
        }

        let totalDistance = 0
        for (let i = 0; i < stateChain.length; i++) {
            const { state, edgeType } = stateChain[i]
            nodes.push(state.nodeId)

            if (i > 0 && edgeType) {
                const fromNode = this.nodes.get(stateChain[i - 1].state.nodeId)!
                const toNode = this.nodes.get(state.nodeId)!
                const distance = edgeType === 'teleport' ? 0 : calculateDistance(fromNode, toNode)

                segments.push({
                    from: stateChain[i - 1].state.nodeId,
                    to: state.nodeId,
                    type: edgeType,
                    distance: Math.round(distance),
                })

                totalDistance += distance
            }
        }

        return {
            nodes,
            totalDistance: Math.round(totalDistance),
            segments,
        }
    }

    /**
     * Clears all nodes from the graph
     */
    clear(): void {
        this.nodes.clear()
        this.translocatorLinks.clear()
    }
}