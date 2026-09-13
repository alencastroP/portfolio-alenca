/**
 * Amostra o monograma do favicon (o "P" e o ponto de destaque) em pontos 3D.
 *
 * O desenho vem do próprio `favicon.svg`: o path é rasterizado num canvas
 * 2D fora da tela e cada partícula sorteia um pixel preenchido. Sem fonte
 * para baixar e sem geometria de texto — a marca é a mesma da aba do navegador.
 */

import { MONOGRAM_DOT as DOT, MONOGRAM_PATH as P_PATH } from '@/lib/brand';

/** Pixels por unidade do viewBox 64×64 do favicon. */
const RESOLUTION = 8;
const CANVAS_SIZE = 64 * RESOLUTION;

/** Caixa do desenho (P + ponto) no viewBox: x 20→51, y 18→47. */
const CENTER_X = 35.5;
const CENTER_Y = 32.5;
const WORLD_UNIT = 0.11;

export const MONOGRAM_WIDTH = 31 * WORLD_UNIT;
export const MONOGRAM_HEIGHT = 29 * WORLD_UNIT;

/** Fração das partículas reservada ao ponto: ele é pequeno, mas precisa brilhar. */
const DOT_SHARE = 0.08;

export interface MonogramData {
  /** Posição final (o monograma montado). */
  positions: Float32Array;
  /** Posição inicial: uma nebulosa em disco achatado ao redor da marca. */
  start: Float32Array;
  random: Float32Array;
  /** 1 para as partículas do ponto de destaque. */
  accent: Float32Array;
}

export function sampleMonogram(count: number): MonogramData | null {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  // Canais separados: vermelho é a letra, verde é o ponto.
  context.scale(RESOLUTION, RESOLUTION);
  context.fillStyle = '#f00';
  context.fill(new Path2D(P_PATH), 'evenodd');
  context.fillStyle = '#0f0';
  context.beginPath();
  context.arc(DOT.cx, DOT.cy, DOT.r, 0, Math.PI * 2);
  context.fill();

  const { data } = context.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  const letter: number[] = [];
  const dot: number[] = [];

  for (let pixel = 0; pixel < CANVAS_SIZE * CANVAS_SIZE; pixel += 1) {
    if (data[pixel * 4] > 128) letter.push(pixel);
    else if (data[pixel * 4 + 1] > 128) dot.push(pixel);
  }

  if (letter.length === 0 || dot.length === 0) return null;

  const positions = new Float32Array(count * 3);
  const start = new Float32Array(count * 3);
  const random = new Float32Array(count);
  const accent = new Float32Array(count);
  const dotCount = Math.round(count * DOT_SHARE);

  for (let index = 0; index < count; index += 1) {
    const isDot = index < dotCount;
    const pool = isDot ? dot : letter;
    const pixel = pool[Math.floor(Math.random() * pool.length)];

    // Jitter dentro do pixel: sem ele a grade do raster aparece nas bordas.
    const x = ((pixel % CANVAS_SIZE) + Math.random()) / RESOLUTION;
    const y = (Math.floor(pixel / CANVAS_SIZE) + Math.random()) / RESOLUTION;

    const i3 = index * 3;
    positions[i3] = (x - CENTER_X) * WORLD_UNIT;
    positions[i3 + 1] = -(y - CENTER_Y) * WORLD_UNIT;
    // Uma laje com espessura, não um recorte chapado: é o que a rotação revela.
    positions[i3 + 2] = (Math.random() - 0.5) * (isDot ? 0.36 : 0.52);

    const radius = 2.4 + Math.random() ** 0.7 * 4.4;
    const theta = Math.random() * Math.PI * 2;
    start[i3] = Math.cos(theta) * radius;
    start[i3 + 1] = (Math.random() - 0.5) * 1.8 + Math.sin(theta) * radius * 0.22;
    start[i3 + 2] = Math.sin(theta) * radius * 0.6 - 1.4;

    random[index] = Math.random();
    accent[index] = isDot ? 1 : 0;
  }

  return { positions, start, random, accent };
}

/** Poeira de fundo: um volume largo e raso atrás da marca, para dar profundidade. */
export function scatterDust(count: number) {
  const positions = new Float32Array(count * 3);
  const random = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    const i3 = index * 3;
    positions[i3] = (Math.random() - 0.5) * 22;
    positions[i3 + 1] = (Math.random() - 0.5) * 12;
    positions[i3 + 2] = -8 + Math.random() * 9;
    random[index] = Math.random();
  }

  return { positions, random };
}
