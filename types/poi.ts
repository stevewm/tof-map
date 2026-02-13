export interface POI {
    x: number;
    y: number;
    z: number;
}

export interface Landmark {
    name: string;
    icon: string;
    location: POI;
    desc?: string;
}

export interface Translocator {
    name: string;
    origin: POI;
    destination: POI;
    color?: string;
    desc?: string;
}