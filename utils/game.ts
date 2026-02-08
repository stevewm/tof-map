import { POI } from '@/types/poi';

// VS uses a different coords system to leaflet
export function convertToLeafletCoords(point: POI): POI {
    return {
        x: point.x,
        y: point.y,
        z: -point.z
    };
}

export function calculateBlockDistance(a: POI, b: POI): number {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
}
