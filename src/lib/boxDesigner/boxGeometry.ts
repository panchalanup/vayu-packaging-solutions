/**
 * Custom Box Geometry Builder (Adapted from reference implementation)
 * Creates realistic 3D corrugated box geometry with proper flute patterns
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

interface BoxGeometryParams {
  width: number;      // cm
  length: number;     // cm  
  depth: number;      // cm (height)
  thickness: number;  // mm
  fluteFreq: number;  // flute frequency (3-7)
  flapGap: number;    // gap between flaps (mm)
}

interface BoxElements {
  frontHalf: {
    width: {
      top: THREE.BufferGeometry;
      side: THREE.BufferGeometry;
      bottom: THREE.BufferGeometry;
    };
    length: {
      top: THREE.BufferGeometry;
      side: THREE.BufferGeometry;
      bottom: THREE.BufferGeometry;
    };
  };
  backHalf: {
    width: {
      top: THREE.BufferGeometry;
      side: THREE.BufferGeometry;
      bottom: THREE.BufferGeometry;
    };
    length: {
      top: THREE.BufferGeometry;
      side: THREE.BufferGeometry;
      bottom: THREE.BufferGeometry;
    };
  };
}

/**
 * Creates a single layer of corrugated geometry with vertex offset
 */
function getLayerGeometry(
  baseGeometry: THREE.PlaneGeometry,
  size: [number, number],
  folds: [boolean, boolean, boolean, boolean],
  fluteFreq: number,
  thickness: number,
  offsetFn: (v: number) => number
): THREE.BufferGeometry {
  const layerGeometry = baseGeometry.clone();
  const position = layerGeometry.attributes.position;
  
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    
    // Apply corrugation pattern with fold dampening
    let offset = offsetFn(x);
    
    // Dampen offset near fold lines
    const foldWidth = 0.1;
    const eps = 0.01;
    
    if (folds[0] && y > 0.5 * size[1] - foldWidth) { // top fold
      offset *= Math.max(0, (0.5 * size[1] - y) / foldWidth + eps);
    }
    if (folds[1] && x > 0.5 * size[0] - foldWidth) { // right fold
      offset *= Math.max(0, (0.5 * size[0] - x) / foldWidth + eps);
    }
    if (folds[2] && y < -0.5 * size[1] + foldWidth) { // bottom fold
      offset *= Math.max(0, (y + 0.5 * size[1]) / foldWidth + eps);
    }
    if (folds[3] && x < -0.5 * size[0] + foldWidth) { // left fold
      offset *= Math.max(0, (x + 0.5 * size[0]) / foldWidth + eps);
    }
    
    position.setZ(i, offset);
  }
  
  position.needsUpdate = true;
  layerGeometry.computeVertexNormals();
  
  return layerGeometry;
}

/**
 * Creates a complete side/flap geometry with corrugation layers
 */
function createSideGeometry(
  baseGeometry: THREE.PlaneGeometry,
  size: [number, number],
  folds: [boolean, boolean, boolean, boolean],
  hasMiddleLayer: boolean,
  fluteFreq: number,
  thickness: number
): THREE.BufferGeometry {
  const geometriesToMerge: THREE.BufferGeometry[] = [];
  
  // Outer layer (back side)
  geometriesToMerge.push(
    getLayerGeometry(
      baseGeometry,
      size,
      folds,
      fluteFreq,
      thickness,
      (v) => -0.5 * thickness + 0.01 * Math.sin(fluteFreq * v)
    )
  );
  
  // Inner layer (front side)
  geometriesToMerge.push(
    getLayerGeometry(
      baseGeometry,
      size,
      folds,
      fluteFreq,
      thickness,
      (v) => 0.5 * thickness + 0.01 * Math.sin(fluteFreq * v)
    )
  );
  
  // Middle flute layer (for flaps and visible corrugation)
  if (hasMiddleLayer) {
    geometriesToMerge.push(
      getLayerGeometry(
        baseGeometry,
        size,
        folds,
        fluteFreq,
        thickness,
        (v) => 0.5 * thickness * Math.sin(fluteFreq * v)
      )
    );
  }
  
  const mergedGeometry = mergeGeometries(geometriesToMerge, false);
  mergedGeometry.computeVertexNormals();
  
  return mergedGeometry;
}

/**
 * Creates all box elements based on parameters
 */
export function createBoxElements(params: BoxGeometryParams): BoxElements {
  const { width, length, depth, thickness, fluteFreq, flapGap } = params;
  
  // Convert mm to cm
  const thicknessCm = thickness / 10;
  const flapGapCm = flapGap / 10;
  
  const elements: BoxElements = {
    frontHalf: {
      width: { top: new THREE.BufferGeometry(), side: new THREE.BufferGeometry(), bottom: new THREE.BufferGeometry() },
      length: { top: new THREE.BufferGeometry(), side: new THREE.BufferGeometry(), bottom: new THREE.BufferGeometry() },
    },
    backHalf: {
      width: { top: new THREE.BufferGeometry(), side: new THREE.BufferGeometry(), bottom: new THREE.BufferGeometry() },
      length: { top: new THREE.BufferGeometry(), side: new THREE.BufferGeometry(), bottom: new THREE.BufferGeometry() },
    },
  };
  
  // Create geometries for each half and side
  for (let halfIdx = 0; halfIdx < 2; halfIdx++) {
    for (let sideIdx = 0; sideIdx < 2; sideIdx++) {
      const half = halfIdx ? 'frontHalf' : 'backHalf';
      const side = sideIdx ? 'width' : 'length';
      
      const sideWidth = side === 'width' ? width : length;
      const flapWidth = sideWidth - 2 * flapGapCm;
      const flapHeight = 0.5 * width - 0.75 * flapGapCm;
      
      // Create base plane geometries
      const sidePlaneGeometry = new THREE.PlaneGeometry(
        sideWidth,
        depth,
        Math.floor(5 * sideWidth),
        Math.floor(0.2 * depth)
      );
      
      const flapPlaneGeometry = new THREE.PlaneGeometry(
        flapWidth,
        flapHeight,
        Math.floor(5 * flapWidth),
        Math.floor(0.2 * flapHeight)
      );
      
      // Create side panel
      const sideGeometry = createSideGeometry(
        sidePlaneGeometry,
        [sideWidth, depth],
        [true, true, true, true], // all edges have folds
        false, // no middle layer for main sides
        fluteFreq,
        thicknessCm
      );
      
      // Create top flap
      const topGeometry = createSideGeometry(
        flapPlaneGeometry,
        [flapWidth, flapHeight],
        [false, false, true, false], // only bottom edge (attached to side) has fold
        true, // has middle layer for flaps
        fluteFreq,
        thicknessCm
      );
      topGeometry.translate(0, 0.5 * flapHeight, 0);
      
      // Create bottom flap
      const bottomGeometry = createSideGeometry(
        flapPlaneGeometry,
        [flapWidth, flapHeight],
        [true, false, false, false], // only top edge (attached to side) has fold
        true, // has middle layer for flaps
        fluteFreq,
        thicknessCm
      );
      bottomGeometry.translate(0, -0.5 * flapHeight, 0);
      
      // Assign to elements
      elements[half][side].side = sideGeometry;
      elements[half][side].top = topGeometry;
      elements[half][side].bottom = bottomGeometry;
    }
  }
  
  return elements;
}

/**
 * Helper to get flute frequency from ply type
 */
export function getFluteFreqFromType(fluteType?: 'A' | 'B' | 'C' | 'E'): number {
  const fluteMap = {
    'A': 4,  // Larger waves
    'B': 6,  // Tighter waves
    'C': 5,  // Medium waves
    'E': 7,  // Fine waves
  };
  return fluteMap[fluteType || 'C'];
}

/**
 * Calculate transform data for positioning box elements
 */
export interface TransformData {
  openingAngle: number; // 0 to Math.PI/2
  flapAngles: {
    frontHalf: {
      width: { top: number; bottom: number };
      length: { top: number; bottom: number };
    };
    backHalf: {
      width: { top: number; bottom: number };
      length: { top: number; bottom: number };
    };
  };
}

export function getDefaultTransform(): TransformData {
  return {
    openingAngle: 0.02 * Math.PI, // Slightly open for better view
    flapAngles: {
      frontHalf: {
        width: { top: 0, bottom: 0 },
        length: { top: 0, bottom: 0 },
      },
      backHalf: {
        width: { top: 0, bottom: 0 },
        length: { top: 0, bottom: 0 },
      },
    },
  };
}
