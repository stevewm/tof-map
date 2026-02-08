export interface POI {
    x: number;
    y: number;
    z: number;
}

export interface Landmark {
    name: string;
    icon: string;
    location: POI;
}

export interface Translocator {
    name: string;
    origin: POI;
    destination: POI;
    color?: string;
}