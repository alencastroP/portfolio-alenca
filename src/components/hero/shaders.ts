/**
 * Shaders do hero. Toda a animação por partícula roda na GPU: o JavaScript
 * só atualiza meia dúzia de uniforms por quadro, independente de quantas
 * partículas existem.
 */

export const MONOGRAM_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uScatter;
  uniform vec3 uPointer;
  uniform float uStrength;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uOpacity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  attribute vec3 aStart;
  attribute float aRandom;
  attribute float aAccent;

  varying vec3 vColor;
  varying float vAlpha;

  float easeOutCubic(float t) {
    return 1.0 - pow(1.0 - t, 3.0);
  }

  void main() {
    // Montagem escalonada: cada partícula tem o próprio atraso, então a
    // marca se condensa em vez de aparecer de uma vez.
    float delay = aRandom * 0.45;
    float progress = easeOutCubic(clamp((uProgress - delay) / 0.55, 0.0, 1.0));

    // No trajeto a nebulosa gira em torno do eixo Y e desenrola ao chegar.
    float angle = (1.0 - progress) * (2.4 + aRandom * 2.2);
    vec3 origin = aStart;
    origin.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * origin.xz;

    vec3 pos = mix(origin, position, progress);

    // Respiração em repouso: amplitude mínima, mas nunca parado de todo.
    float phase = uTime * (0.6 + aRandom * 0.8) + aRandom * 6.2831;
    pos += vec3(sin(phase) * 0.012, cos(phase * 1.3) * 0.012, sin(phase * 0.7) * 0.035) * progress;

    // Repulsão do ponteiro: as partículas abrem caminho e saltam em Z.
    vec2 away = pos.xy - uPointer.xy;
    float force = smoothstep(0.95, 0.0, length(away)) * uStrength * progress;
    pos.xy += normalize(away + 1e-4) * force * 0.55;
    pos.z += force * 0.9;

    // Saída pelo scroll: a marca se desfaz de volta em poeira.
    pos += normalize(aStart + 1e-4) * uScatter * (1.4 + aRandom * 3.2);

    vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * viewPosition;

    float size = uSize * (0.55 + aRandom * 0.9) * (1.0 + aAccent * 0.7) * (1.0 + force * 1.3);
    gl_PointSize = size * uPixelRatio / -viewPosition.z;

    // Gradiente de assinatura atravessando a letra na diagonal.
    float blend = clamp((position.x + position.y) * 0.24 + 0.5, 0.0, 1.0);
    vec3 color = mix(uColorA, uColorB, blend);
    color = mix(color, uColorC, aAccent);
    vColor = color + force * 0.3;

    vAlpha = (0.3 + 0.7 * progress) * (1.0 - uScatter * 0.9) * (0.5 + aRandom * 0.5) * uOpacity;
  }
`;

export const DUST_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uScatter;

  attribute float aRandom;

  varying float vAlpha;

  void main() {
    vec3 pos = position;
    pos.y += sin(uTime * 0.12 + aRandom * 6.2831) * 0.25;
    pos.x += cos(uTime * 0.08 + aRandom * 12.0) * 0.2;

    vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = (6.0 + aRandom * 10.0) * uPixelRatio / -viewPosition.z;

    float twinkle = 0.5 + 0.5 * sin(uTime * (0.6 + aRandom * 1.4) + aRandom * 40.0);
    vAlpha = (0.12 + 0.38 * twinkle) * (1.0 - uScatter * 0.6);
  }
`;

export const MONOGRAM_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Ponto redondo com borda macia; a potência concentra o brilho no centro.
    float falloff = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
    gl_FragColor = vec4(vColor, pow(falloff, 1.6) * vAlpha);
  }
`;

export const DUST_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float falloff = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
    gl_FragColor = vec4(uColor, falloff * vAlpha);
  }
`;
