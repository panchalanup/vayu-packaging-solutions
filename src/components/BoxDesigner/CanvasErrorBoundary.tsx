/**
 * Canvas Error Boundary
 * Catches render errors (WebGL failures, lazy-chunk load errors, scene exceptions) so a problem in the
 * 3D view never white-screens the whole site.
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface CanvasErrorBoundaryProps {
  children: ReactNode;
  /** Rendered when a descendant throws. Call `reset` to try again. */
  fallback: (args: { error: Error; reset: () => void }) => ReactNode;
}

interface CanvasErrorBoundaryState {
  error: Error | null;
}

export default class CanvasErrorBoundary extends Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  state: CanvasErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): CanvasErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // SECURITY: log locally only; the error text and component stack are never sent to a remote service.
    console.error('[BoxDesigner] 3D view failed:', error, info.componentStack);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      return this.props.fallback({ error: this.state.error, reset: this.reset });
    }
    return this.props.children;
  }
}
