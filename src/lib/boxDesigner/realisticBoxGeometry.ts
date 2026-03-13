/**
 * Realistic Cardboard Box Geometry Generator
 * Adapted from: https://github.com/uuuulala/Threejs-folding-cardboard-box-tutorial
 * Creates layered cardboard with flute pattern simulation
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface BoxParams {
  width: number;
  length: number;
  depth: number;
  thickness: number;
  fluteFreq: number;
  flapGap: number;
}

export interface BoxMeshes {
  frontHalf: {
    width: {
      top: THREE.Mesh;
      side: THREE.Mesh;
      bottom: THREE.Mesh;
    };
    length: {
      top: THREE.Mesh;
      side: THREE.Mesh;
      bottom: THREE.Mesh;
    };
  };
  backHalf: {
    width: {
      top: THREE.Mesh;
      side: THREE.Mesh;
      bottom: THREE.Mesh;
    };
    length: {
      top: THREE.Mesh;
      side: THREE.Mesh;
      bottom: THREE.Mesh;
    };
  };
}

export interface AnimationState {
  openingAngle: number;
  flapAngles: {
    backHalf: {
      width: { top: number; bottom: number };
      length: { top: number; bottom: number };
    };
    frontHalf: {
      width: { top: number; bottom: number };
      length: { top: number; bottom: number };
    };
  };
}

/**
 * Creates layered cardboard geometry with flute pattern
 * Adapted from reference implementation
 */
export function createSideGeometry(
  baseGeometry: THREE.PlaneGeometry,
  size: [number, number],
  folds: [boolean, boolean, boolean, boolean],
  hasMiddleLayer: boolean,
  params: BoxParams
): THREE.BufferGeometry {
  const geometriesToMerge: THREE.BufferGeometry[] = [];

  // Outer layer with flute pattern
  geometriesToMerge.push(
    getLayerGeometry((v: number) => -0.5 * params.thickness + 0.01 * Math.sin(params.fluteFreq * v))
  );

  // Inner layer with flute pattern
  geometriesToMerge.push(
    getLayerGeometry((v: number) => 0.5 * params.thickness + 0.01 * Math.sin(params.fluteFreq * v))
  );

  // Middle flute layer (for flaps)
  if (hasMiddleLayer) {
    geometriesToMerge.push(
      getLayerGeometry((v: number) => 0.5 * params.thickness * Math.sin(params.fluteFreq * v))
    );
  }

  function getLayerGeometry(offset: (v: number) => number): THREE.BufferGeometry {
    const layerGeometry = baseGeometry.clone();
    const positionAttr = layerGeometry.attributes.position;

    for (let i = 0; i < positionAttr.count; i++) {
      const x = positionAttr.getX(i);
      const y = positionAttr.getY(i);
      let z = positionAttr.getZ(i) + offset(x);
      z = applyFolds(x, y, z);
      positionAttr.setXYZ(i, x, y, z);
    }

    return layerGeometry;
  }

  function applyFolds(x: number, y: number, z: number): number {
    const modifier = (c: number, s: number) => 1 - Math.pow(c / (0.5 * s), 10);

    if ((x > 0 && folds[1]) || (x < 0 && folds[3])) {
      z *= modifier(x, size[0]);
    }
    if ((y > 0 && folds[0]) || (y < 0 && folds[2])) {
      z *= modifier(y, size[1]);
    }

    return z;
  }

  const mergedGeometry = mergeGeometries(geometriesToMerge, false);
  if (mergedGeometry) {
    mergedGeometry.computeVertexNormals();
    return mergedGeometry;
  }

  return geometriesToMerge[0];
}

/**
 * Creates all box elements (panels and flaps)
 */
export function createBoxGeometries(params: BoxParams, meshes: BoxMeshes): void {
  for (let halfIdx = 0; halfIdx < 2; halfIdx++) {
    for (let sideIdx = 0; sideIdx < 2; sideIdx++) {
      const half = halfIdx ? 'frontHalf' : 'backHalf';
      const side = sideIdx ? 'width' : 'length';

      const sideWidth = side === 'width' ? params.width : params.length;
      const flapWidth = sideWidth - 2 * params.flapGap;
      const flapHeight = 0.5 * params.width - 0.75 * params.flapGap;

      // Create base plane geometries
      const sidePlaneGeometry = new THREE.PlaneGeometry(
        sideWidth,
        params.depth,
        Math.floor(5 * sideWidth),
        Math.floor(0.2 * params.depth)
      );

      const flapPlaneGeometry = new THREE.PlaneGeometry(
        flapWidth,
        flapHeight,
        Math.floor(5 * flapWidth),
        Math.floor(0.2 * flapHeight)
      );

      // Create layered geometries
      const sideGeometry = createSideGeometry(
        sidePlaneGeometry,
        [sideWidth, params.depth],
        [true, true, true, true],
        false,
        params
      );

      const topGeometry = createSideGeometry(
        flapPlaneGeometry,
        [flapWidth, flapHeight],
        [false, false, true, false],
        true,
        params
      );

      const bottomGeometry = createSideGeometry(
        flapPlaneGeometry,
        [flapWidth, flapHeight],
        [true, false, false, false],
        true,
        params
      );

      // Position flap geometries
      topGeometry.translate(0, 0.5 * flapHeight, 0);
      bottomGeometry.translate(0, -0.5 * flapHeight, 0);

      // Assign geometries to meshes
      meshes[half][side].top.geometry = topGeometry;
      meshes[half][side].side.geometry = sideGeometry;
      meshes[half][side].bottom.geometry = bottomGeometry;

      // Position flaps
      meshes[half][side].top.position.y = 0.5 * params.depth;
      meshes[half][side].bottom.position.y = -0.5 * params.depth;
    }
  }
}

/**
 * Sets up hierarchy relationships between box elements
 */
export function setGeometryHierarchy(group: THREE.Group, meshes: BoxMeshes): void {
  // Clear existing children
  group.clear();

  // Add side panels to group
  group.add(
    meshes.frontHalf.width.side,
    meshes.frontHalf.length.side,
    meshes.backHalf.width.side,
    meshes.backHalf.length.side
  );

  // Add flaps to their respective side panels
  meshes.frontHalf.width.side.add(meshes.frontHalf.width.top, meshes.frontHalf.width.bottom);
  meshes.frontHalf.length.side.add(meshes.frontHalf.length.top, meshes.frontHalf.length.bottom);
  meshes.backHalf.width.side.add(meshes.backHalf.width.top, meshes.backHalf.width.bottom);
  meshes.backHalf.length.side.add(meshes.backHalf.length.top, meshes.backHalf.length.bottom);
}

/**
 * Updates panel positions and rotations based on animation state
 */
export function updatePanelsTransform(
  params: BoxParams,
  meshes: BoxMeshes,
  animated: AnimationState
): void {
  // Position width-sides aside of length-sides
  meshes.frontHalf.width.side.position.x = 0.5 * params.length;
  meshes.backHalf.width.side.position.x = -0.5 * params.length;

  // Rotate width-sides based on opening angle
  meshes.frontHalf.width.side.rotation.y = animated.openingAngle;
  meshes.backHalf.width.side.rotation.y = animated.openingAngle;

  // Move length-sides to keep box centered
  const cos = Math.cos(animated.openingAngle);
  meshes.frontHalf.length.side.position.x = -0.5 * cos * params.width;
  meshes.backHalf.length.side.position.x = 0.5 * cos * params.width;

  // Move length-sides to define box inner space
  const sin = Math.sin(animated.openingAngle);
  meshes.frontHalf.length.side.position.z = 0.5 * sin * params.width;
  meshes.backHalf.length.side.position.z = -0.5 * sin * params.width;

  // Rotate flaps
  meshes.frontHalf.width.top.rotation.x = -animated.flapAngles.frontHalf.width.top;
  meshes.frontHalf.length.top.rotation.x = -animated.flapAngles.frontHalf.length.top;
  meshes.frontHalf.width.bottom.rotation.x = animated.flapAngles.frontHalf.width.bottom;
  meshes.frontHalf.length.bottom.rotation.x = animated.flapAngles.frontHalf.length.bottom;

  meshes.backHalf.width.top.rotation.x = animated.flapAngles.backHalf.width.top;
  meshes.backHalf.length.top.rotation.x = animated.flapAngles.backHalf.length.top;
  meshes.backHalf.width.bottom.rotation.x = -animated.flapAngles.backHalf.width.bottom;
  meshes.backHalf.length.bottom.rotation.x = -animated.flapAngles.backHalf.length.bottom;
}

/**
 * Creates the cardboard material with optional texture
 */
export function createCardboardMaterial(
  texture?: THREE.Texture,
  color?: string | number
): THREE.MeshStandardMaterial {
  const materialColor = color || 0xC9A87C; // Default to kraft tan
  
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(materialColor),
    map: texture || null,
    side: THREE.DoubleSide,
    roughness: 0.93,
    metalness: 0.0,
  });
}

/**
 * Creates a cardboard material with shipping icons
 */
export function createCardboardMaterialWithIcons(
  baseTexture: THREE.CanvasTexture,
  color?: string | number
): THREE.MeshStandardMaterial {
  return createCardboardMaterial(baseTexture, color);
}
