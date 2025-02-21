// types.ts
export interface Point {
    x: number;
    y: number;
  }
  
  export interface Shape {
    id: string;
    type: ShapeType;
    points: Point[];
    center: Point;
    rotation?: number;
    scale?: number;
  }
  
  export type ShapeType = 'triangle' | 'star' | 'arrow' | 'semicircle' | 'unknown';
  
  export interface ShapeTemplate {
    name: string;
    points: Point[];
    isArc?: boolean;
    radius?: number;
    startAngle?: number;
    endAngle?: number;
  }
  
  export interface DetectionResult {
    shapes: Shape[];
    error?: string;
  }