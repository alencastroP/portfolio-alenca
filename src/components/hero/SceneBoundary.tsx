import { Component, type ReactNode } from 'react';

interface SceneBoundaryProps {
  children: ReactNode;
}

interface SceneBoundaryState {
  failed: boolean;
}

/**
 * Sem WebGL (driver bloqueado, contexto perdido, navegador antigo) o 3D
 * simplesmente não aparece: o palco já tem o brilho em CSS por baixo, e a
 * página nunca quebra por causa de um enfeite.
 */
export class SceneBoundary extends Component<SceneBoundaryProps, SceneBoundaryState> {
  state: SceneBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneBoundaryState {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
