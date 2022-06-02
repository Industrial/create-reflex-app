import React, { ReactElement } from 'react';

export type ErrorBoundaryProps = {
  children?: Array<ReactElement> | ReactElement;
};

export type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary
  extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: undefined,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, _errorInfo: unknown) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return <h1>{this.state.error?.message}</h1>;
    }

    return this.props.children;
  }
}
