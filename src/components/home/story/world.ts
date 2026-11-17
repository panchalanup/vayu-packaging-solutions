/**
 * The 3D world of the home story, built once as plain three.js objects (like BoxRig) so scrolling never re-renders
 * React: update(p) just moves what beats.ts says should move. PHASE A BLOCKOUT: grey primitives with the final
 * timing, camera and layout; Phase B/C swap them for BoxRig, real materials and the RenderTexture monitor.
 *
 * Layout: the desk and the monitor sit at the origin; the map and the doorstep are further along x (see WORLD).
 */

import * as THREE from 'three';
import { deskNote } from '@/content/story';
import {
  PALLET_BOXES,
  REVEAL_SWAP,
  SCENES,
  SWATCH_COUNT,
  WORLD,
  clamp01,
  doorDropAt,
  easeInOut,
  easeOutCubic,
  foldAt,
  jarRiseAt,
  makeAt,
  measureAt,
  miniAt,
  openAt,
  sceneAt,
  shipAt,
} from './beats';

const IDX = Object.fromEntries(SCENES.map((s) => [s.id, s.index])) as Record<(typeof SCENES)[number]['id'], number>;
const DEG = Math.PI / 180;

const GREY = { dark: '#1B1F1D', mid: '#3A403C', light: '#8C938F', paper: '#F4EFE6', kraft: '#C49A6C', green: '#23803A', ink: '#0F1A14' } as const;
/** Same order as SWATCH_COUNT in beats.ts: kraft, white, black, red, blue, brand green */
const TINTS = [GREY.kraft, '#F4EFE6', GREY.ink, '#B42318', '#1F4E8C', GREY.green] as const;

const lit = (color: string, extra: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...extra });
const flat = (color: string, extra: THREE.MeshBasicMaterialParameters = {}) => new THREE.MeshBasicMaterial({ color, ...extra });

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
}

// --- Props ---------------------------------------------------------------------------------------------------------

interface Carton {
  group: THREE.Group;
  material: THREE.MeshStandardMaterial;
  /** 0 = closed, 1 = flaps wide open */
  setOpen(k: number): void;
}

/** An open-topped slotted carton with four hinged flaps: closed it looks sealed, open it shows the inside */
function buildCarton(w: number, h: number, d: number, color: string): Carton {
  const group = new THREE.Group();
  const material = lit(color, { roughness: 0.9 });
  const t = Math.min(w, d, h) * 0.06;
  const wall = (sx: number, sy: number, sz: number, x: number, y: number, z: number) => group.add(mesh(new THREE.BoxGeometry(sx, sy, sz), material, x, y, z));
  wall(w, t, d, 0, t / 2, 0);
  wall(w, h, t, 0, h / 2, d / 2 - t / 2);
  wall(w, h, t, 0, h / 2, -d / 2 + t / 2);
  wall(t, h, d - 2 * t, w / 2 - t / 2, h / 2, 0);
  wall(t, h, d - 2 * t, -w / 2 + t / 2, h / 2, 0);

  const flap = (sx: number, sz: number, px: number, py: number, pz: number, cx: number, cz: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(px, py, pz);
    pivot.add(mesh(new THREE.BoxGeometry(sx, t * 0.8, sz), material, cx, 0, cz));
    group.add(pivot);
    return pivot;
  };
  // Major flaps meet in the middle; the minor ones sit a hair lower so they never fight them for the same pixels
  const front = flap(w, d / 2, 0, h, d / 2, 0, -d / 4);
  const back = flap(w, d / 2, 0, h, -d / 2, 0, d / 4);
  const right = flap(w / 2 - t, d - 2 * t, w / 2, h - t, 0, -(w / 2 - t) / 2, 0);
  const left = flap(w / 2 - t, d - 2 * t, -w / 2, h - t, 0, (w / 2 - t) / 2, 0);

  return {
    group,
    material,
    setOpen(k) {
      const a = clamp01(k) * 115 * DEG;
      front.rotation.x = a;
      back.rotation.x = -a;
      right.rotation.z = -a;
      left.rotation.z = a;
    },
  };
}

/** A glass-jar stand-in: body, label band and lid. Origin at the base */
function buildJar(scale = 1): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(1, 1, 2.2, 28), lit('#B9803A', { roughness: 0.35 }), 0, 1.1, 0));
  g.add(mesh(new THREE.CylinderGeometry(1.015, 1.015, 0.8, 28), lit(GREY.paper), 0, 1.0, 0));
  g.add(mesh(new THREE.CylinderGeometry(1.04, 1.04, 0.4, 28), lit('#C9A74E', { metalness: 0.5, roughness: 0.4 }), 0, 2.4, 0));
  g.scale.setScalar(scale);
  return g;
}

/** Sticky note texture: the occasion (seasonal) and the order size */
function noteTexture(): THREE.CanvasTexture {
  const [line1, line2] = deskNote();
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 180;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#F2D46B';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#E0BF4E';
    ctx.fillRect(0, 0, c.width, 26);
    ctx.fillStyle = '#5A4A12';
    ctx.font = '700 34px Satoshi, system-ui, sans-serif';
    ctx.fillText(line1, 16, 82, 224);
    ctx.font = '500 32px Satoshi, system-ui, sans-serif';
    ctx.fillText(line2, 16, 130, 224);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function edges(geo: THREE.BufferGeometry, color: string, opacity = 1): THREE.LineSegments {
  return new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
}

// --- The world -----------------------------------------------------------------------------------------------------

export interface StoryWorld {
  root: THREE.Group;
  update(p: number): void;
  dispose(): void;
}

export function buildWorld(): StoryWorld {
  const root = new THREE.Group();

  // Lights: a soft key, a cool fill, and warm sources that only light up for the burst and the unboxing
  root.add(new THREE.AmbientLight('#ffffff', 0.9));
  const key = new THREE.DirectionalLight('#fff4e0', 2.2);
  key.position.set(10, 20, 12);
  root.add(key);
  const fill = new THREE.DirectionalLight('#bcd2ff', 0.6);
  fill.position.set(-8, 6, -10);
  root.add(fill);
  const burst = new THREE.PointLight('#FFD58A', 0, 40, 1.6);
  burst.position.set(WORLD.screenCenter[0] + 3, WORLD.screenCenter[1], WORLD.screenCenter[2] + 1);
  root.add(burst);
  const glow = new THREE.PointLight('#FFC873', 0, 30, 1.4);
  glow.position.set(WORLD.door[0], 3.4, WORLD.door[2] + 2);
  root.add(glow);

  // ---- Desk and monitor (revealed in scene 3a) ----
  // The desk comes in three parts so the reveal never shows the keyboard or stand overlapping the spotlight scene
  const desk = new THREE.Group(); // surface and monitor frame
  const props = new THREE.Group(); // stand, keyboard, mouse
  const decor = new THREE.Group(); // chai, the customer's jar, the note
  desk.add(mesh(new THREE.BoxGeometry(70, 0.5, 42), lit('#4A3626'), 0, -0.25, 6));
  const [sx, sy, sz] = WORLD.screenCenter;
  const [sw, sh] = WORLD.screenSize;
  desk.add(mesh(new THREE.BoxGeometry(sw + 1.4, sh + 1.4, 0.7), lit(GREY.dark), sx, sy, sz - 0.45));
  props.add(mesh(new THREE.BoxGeometry(1.6, 3.2, 0.8), lit(GREY.mid), sx, 1.6, sz - 0.5));
  props.add(mesh(new THREE.CylinderGeometry(3.4, 3.8, 0.35, 32), lit(GREY.mid), sx, 0.18, sz - 0.2));
  props.add(mesh(new THREE.BoxGeometry(9, 0.35, 3), lit(GREY.mid), 0, 0.18, -1.6));
  const mouse = mesh(new THREE.BoxGeometry(1.2, 0.5, 2), lit(GREY.mid), 7.5, 0.25, -1.2);
  props.add(mouse);
  const chai = new THREE.Group();
  chai.add(mesh(new THREE.CylinderGeometry(0.9, 0.7, 1.9, 20), lit('#B0723A', { transparent: true, opacity: 0.85 }), 0, 0.95, 0));
  chai.position.set(-13, 0, 2.5);
  decor.add(chai);
  const customerJar = buildJar(0.85);
  customerJar.position.set(-16, 0, -1.5);
  decor.add(customerJar);
  const noteTex = noteTexture();
  const note = mesh(new THREE.PlaneGeometry(3.4, 2.4), new THREE.MeshBasicMaterial({ map: noteTex }), -9.2, 0.03, 3.4);
  note.rotation.set(-Math.PI / 2, 0, 0.18);
  decor.add(note);
  desk.visible = props.visible = decor.visible = false;
  root.add(desk, props, decor);

  // ---- On the monitor: the spotlight stage (scenes 1-2) ----
  const stage = new THREE.Group();
  stage.position.set(...WORLD.stage);
  // Backdrop exactly on the monitor glass, in the stage's own coordinates
  // It starts oversized, so the close-up scenes never show its edge, and closes in onto the monitor during the reveal
  const backdrop = mesh(new THREE.PlaneGeometry(sw, sh), flat('#0A120D'), sx - WORLD.stage[0], sy - WORLD.stage[1], sz + 0.05 - WORLD.stage[2]);
  backdrop.scale.setScalar(3);
  stage.add(backdrop);
  stage.add(mesh(new THREE.CylinderGeometry(3.1, 3.1, 0.5, 40), lit('#3A3A31'), 0, 0.25, 0));
  const stageJar = buildJar();
  stageJar.position.y = 0.5;
  stage.add(stageJar);
  const stageCarton = buildCarton(3.4, 4.2, 3.4, GREY.kraft);
  stageCarton.group.position.y = 0.5;
  stage.add(stageCarton.group);
  const outline = edges(new THREE.BoxGeometry(3.7, 4.5, 3.7), '#3DBA5A');
  outline.position.y = 0.5 + 2.25;
  stage.add(outline);
  const vLine = mesh(new THREE.BoxGeometry(0.05, 2.2, 0.05), flat('#3DBA5A'), -1.5, 0, 0.6);
  const hLine = mesh(new THREE.BoxGeometry(2, 0.05, 0.05), flat('#3DBA5A'), 0, 3.25, 0.6);
  stage.add(vLine, hLine);
  root.add(stage);

  // ---- On the monitor: the mini designer (scenes 3b-3c). Screen space is 570 x 320 like the real tool ----
  const ui = new THREE.Group();
  ui.position.set(sx, sy, sz + 0.06);
  const X = (px: number) => (px / 570 - 0.5) * sw;
  const Y = (py: number) => (0.5 - py / 320) * sh;
  const rect = (x0: number, y0: number, x1: number, y1: number, color: string, z = 0) => {
    const m = mesh(new THREE.PlaneGeometry(((x1 - x0) / 570) * sw, ((y1 - y0) / 320) * sh), flat(color), X((x0 + x1) / 2), Y((y0 + y1) / 2), z);
    ui.add(m);
    return m;
  };
  rect(0, 0, 570, 320, '#F4EFE6');
  rect(0, 0, 570, 26, GREY.ink, 0.01);
  rect(0, 26, 24, 320, '#17231C', 0.01);
  rect(24, 26, 174, 320, '#FBF8F3', 0.01);
  const swatches = Array.from({ length: SWATCH_COUNT }, (_, i) => {
    const s = mesh(new THREE.CircleGeometry(0.24, 20), flat(TINTS[i]), X(41 + i * 20), Y(80), 0.03);
    ui.add(s);
    return s;
  });
  const ring = mesh(new THREE.RingGeometry(0.3, 0.38, 24), flat(GREY.ink), X(41), Y(80), 0.04);
  ui.add(ring);
  rect(34, 110, 164, 148, '#FFFFFF', 0.02);
  const logoMark = rect(44, 118, 70, 140, GREY.green, 0.03);
  logoMark.visible = false;
  const plyButtons = [0, 1, 2].map((i) => rect(34 + i * 44, 172, 75 + i * 44, 188, '#FFFFFF', 0.02));
  [0, 1, 2].forEach((i) => rect(34 + i * 44, 212, 75 + i * 44, 228, '#FFFFFF', 0.02));
  const quote = rect(470, 5, 562, 21, '#2E9B47', 0.02);

  const miniCarton = buildCarton(3.4, 4.2, 3.4, GREY.kraft);
  miniCarton.group.scale.setScalar(0.85);
  miniCarton.group.position.set(X(372), Y(268), 0.06);
  ui.add(miniCarton.group);
  const miniLogo = mesh(new THREE.PlaneGeometry(1.6, 1.2), flat(GREY.paper), X(372), Y(268) + 1.9, 0.06 + 1.45);
  miniLogo.visible = false;
  ui.add(miniLogo);
  const ghost = edges(new THREE.BoxGeometry(2.9, 3.6, 2.9), GREY.green);
  ghost.position.set(X(372), Y(268) + 1.8, 0.06 + 1.45);
  ghost.visible = false;
  ui.add(ghost);

  const cursor = new THREE.Group();
  const arrow = new THREE.Shape();
  arrow.moveTo(0, 0);
  arrow.lineTo(0, -0.95);
  arrow.lineTo(0.27, -0.7);
  arrow.lineTo(0.5, -1.2);
  arrow.lineTo(0.68, -1.1);
  arrow.lineTo(0.45, -0.62);
  arrow.lineTo(0.8, -0.62);
  arrow.closePath();
  cursor.add(mesh(new THREE.ShapeGeometry(arrow), flat('#FFFFFF')));
  const ripple = mesh(new THREE.RingGeometry(0.4, 0.5, 28), flat('#3DBA5A', { transparent: true }), 0, 0, -0.01);
  cursor.add(ripple);
  cursor.position.z = 0.2;
  ui.add(cursor);
  ui.visible = false;
  root.add(ui);

  // ---- The box that steps out of the screen and lands on the desk ----
  const landed = buildCarton(3.4, 4.2, 3.4, GREY.green);
  landed.group.visible = false;
  root.add(landed.group);
  const exitFrom = new THREE.Vector3(sx + X(372), sy + Y(268), sz + 0.12);
  const exitTo = new THREE.Vector3(...WORLD.pallet);

  // ---- Pallet of 500 ----
  const pallet = new THREE.Group();
  pallet.position.set(...WORLD.pallet);
  pallet.add(mesh(new THREE.BoxGeometry(8.6, 0.5, 6.4), lit('#8A6440'), 0, 0.25, 0));
  const cellGeo = new THREE.BoxGeometry(3.9, 2.5, 2.9);
  const cellEdges = new THREE.EdgesGeometry(cellGeo);
  const cellMat = lit(GREY.green);
  const edgeMat = new THREE.LineBasicMaterial({ color: GREY.ink });
  const cells = Array.from({ length: PALLET_BOXES }, (_, i) => {
    const layer = Math.floor(i / 4);
    const col = i % 2;
    const row = Math.floor((i % 4) / 2);
    const m = mesh(cellGeo, cellMat, (col - 0.5) * 4.1, 0.5 + 1.25 + layer * 2.55, (row - 0.5) * 3.05);
    m.add(new THREE.LineSegments(cellEdges, edgeMat));
    pallet.add(m);
    return { mesh: m, baseY: m.position.y };
  });
  pallet.visible = false;
  root.add(pallet);

  // ---- Map and truck ----
  const map = new THREE.Group();
  map.position.set(...WORLD.map);
  map.add(mesh(new THREE.PlaneGeometry(90, 56), lit('#101A14'), 0, 0, 0).rotateX(-Math.PI / 2));
  const grid = new THREE.GridHelper(90, 45, 0x2e9b47, 0x1d2a22);
  grid.position.y = 0.02;
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.35;
  map.add(grid);
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-26, 0.1, 11), new THREE.Vector3(-10, 0.1, -7), new THREE.Vector3(6, 0.1, 5), new THREE.Vector3(26, 0.1, -9)]);
  const ROUTE_POINTS = 120;
  const routeGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(ROUTE_POINTS - 1));
  routeGeo.setDrawRange(0, 0);
  const routeLine = new THREE.Line(routeGeo, new THREE.LineBasicMaterial({ color: '#3DBA5A' }));
  map.add(routeLine);
  map.add(mesh(new THREE.SphereGeometry(1.5, 16, 12), flat('#3DBA5A'), -26, 0.6, 11));
  map.add(mesh(new THREE.TorusGeometry(2, 0.3, 8, 24), flat('#3DBA5A'), 26, 0.3, -9).rotateX(Math.PI / 2));
  const truck = new THREE.Group();
  truck.add(mesh(new THREE.BoxGeometry(2.8, 2.8, 6.4), lit(GREY.green), 0, 1.9, -0.6));
  truck.add(mesh(new THREE.BoxGeometry(2.4, 2.2, 1.9), lit('#E9E1D3'), 0, 1.5, 3.4));
  [[-1.4, -2], [1.4, -2], [-1.4, 3.2], [1.4, 3.2]].forEach(([x, z]) => truck.add(mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 14), lit(GREY.ink), x, 0.55, z).rotateZ(Math.PI / 2)));
  truck.scale.setScalar(1.8);
  map.add(truck);
  map.visible = false;
  root.add(map);

  // ---- Doorstep ----
  const door = new THREE.Group();
  door.position.set(...WORLD.door);
  door.add(mesh(new THREE.PlaneGeometry(36, 16), lit('#1F241D'), 0, 8, -5));
  door.add(mesh(new THREE.PlaneGeometry(4.6, 9), lit('#5A4130'), -4, 4.5, -4.95));
  door.add(mesh(new THREE.PlaneGeometry(3.4, 3.4), flat('#FFD58A'), 7, 6.2, -4.95));
  door.add(mesh(new THREE.PlaneGeometry(14, 40), lit('#2A2B24'), 0, -0.02, 14).rotateX(-Math.PI / 2));
  door.add(mesh(new THREE.PlaneGeometry(7, 4.2), lit('#4A3A28'), 0, 0.02, -2).rotateX(-Math.PI / 2));
  const parcel = buildCarton(3, 3, 3, GREY.green);
  parcel.group.position.set(0, 0, 2);
  door.add(parcel.group);
  const innerJar = buildJar(0.8);
  innerJar.position.set(0, 0.3, 2);
  door.add(innerJar);
  door.visible = false;
  root.add(door);

  const spotlightIdx = IDX.reveal;
  const tmp = new THREE.Vector3();
  const tan = new THREE.Vector3();

  return {
    root,
    update(p) {
      const s = sceneAt(p);
      const i = s.index;

      // Stage on the monitor: scenes 1-2 and the first part of the reveal
      const onScreen = i < spotlightIdx || (i === spotlightIdx && s.local < REVEAL_SWAP);
      stage.visible = onScreen;
      backdrop.scale.setScalar(i === spotlightIdx ? 3 - 2 * easeInOut(clamp01(s.local / 0.7)) : 3);
      const measure = measureAt(p);
      vLine.visible = hLine.visible = i === 0;
      vLine.position.y = 0.5 + 1.1 * measure;
      vLine.scale.y = Math.max(0.001, measure);
      hLine.scale.x = Math.max(0.001, measure);
      stageJar.rotation.y = p * 8;
      const fold = foldAt(p);
      stageCarton.group.visible = i >= IDX.fit;
      stageCarton.group.scale.y = i === IDX.fit ? Math.max(0.02, fold) : 1;
      stageJar.visible = i < IDX.fit || (i === IDX.fit && fold < 0.75);
      outline.visible = i === IDX.fit;

      // Desk appears as the camera pulls back
      const revealing = i === spotlightIdx;
      const afterReveal = i > spotlightIdx;
      desk.visible = afterReveal || (revealing && s.local > 0.1);
      decor.visible = afterReveal || (revealing && s.local > 0.3);
      props.visible = afterReveal || (revealing && s.local >= REVEAL_SWAP);

      // Mini designer
      const mini = miniAt(p);
      ui.visible = (i === spotlightIdx && s.local >= REVEAL_SWAP) || (i > spotlightIdx && i <= IDX.make);
      if (ui.visible) {
        miniCarton.material.color.set(TINTS[mini.colorIndex]);
        miniLogo.visible = mini.logo && mini.exit < 0.05;
        miniCarton.group.visible = mini.exit < 0.05;
        ghost.visible = mini.exit >= 0.05;
        ring.position.x = swatches[mini.colorIndex].position.x;
        logoMark.visible = mini.logo;
        plyButtons.forEach((b, k) => (b.material as THREE.MeshBasicMaterial).color.set(k === mini.ply ? GREY.green : '#FFFFFF'));
        (quote.material as THREE.MeshBasicMaterial).color.set(mini.quoteHot ? '#3DBA5A' : '#2E9B47');
        cursor.position.set(X(mini.cursor[0] * 570), Y(mini.cursor[1] * 320), 0.2);
        ripple.scale.setScalar(0.6 + (1 - mini.click) * 1.4);
        (ripple.material as THREE.MeshBasicMaterial).opacity = mini.click;
        ripple.visible = mini.click > 0.01;
        mouse.position.set(7.5 + (mini.cursor[0] - 0.5) * 3, 0.25, -1.2 + (mini.cursor[1] - 0.5) * 2.4);
      }

      // Order: the box steps out of the screen and lands on the desk, then the pallet takes over
      const exit = mini.exit;
      const make = makeAt(p);
      const palletBoxes = make * PALLET_BOXES;
      landed.group.visible = exit > 0 && (i < IDX.make || (i === IDX.make && palletBoxes < 1));
      if (landed.group.visible) {
        const e = exit;
        landed.group.position.lerpVectors(exitFrom, exitTo, e);
        landed.group.position.y += Math.sin(Math.PI * e) * 5;
        landed.group.scale.setScalar(0.85 + 0.15 * e);
        landed.group.rotation.set(0, e * 0.8, Math.sin(Math.PI * e) * 0.15);
      }
      burst.intensity = i === IDX.order ? 60 * Math.sin(Math.PI * clamp01(exit)) : 0;

      // Pallet
      pallet.visible = i >= IDX.make;
      if (pallet.visible) {
        cells.forEach((c, k) => {
          const a = clamp01(palletBoxes - k);
          c.mesh.visible = a > 0;
          c.mesh.position.y = c.baseY + (1 - easeOutCubic(a)) * 7;
        });
      }

      // Map, truck and route
      map.visible = i >= IDX.make && i <= IDX.door;
      const ship = shipAt(p);
      routeGeo.setDrawRange(0, Math.floor(ship * ROUTE_POINTS));
      curve.getPointAt(clamp01(ship), tmp);
      curve.getTangentAt(clamp01(ship), tan);
      truck.position.copy(tmp);
      truck.lookAt(tmp.x + tan.x, tmp.y, tmp.z + tan.z);

      // Doorstep
      door.visible = i >= IDX.door;
      const drop = doorDropAt(p);
      parcel.group.visible = drop.visible;
      parcel.group.position.y = drop.height;
      const open = openAt(p);
      parcel.setOpen(open);
      const rise = jarRiseAt(p);
      innerJar.visible = i === IDX.open && rise > 0;
      innerJar.position.y = 0.3 + rise * 4.2;
      glow.intensity = open * 45;
    },
    dispose() {
      root.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => {
          (x as THREE.MeshBasicMaterial).map?.dispose?.();
          x.dispose();
        });
      });
      noteTex.dispose();
    },
  };
}
