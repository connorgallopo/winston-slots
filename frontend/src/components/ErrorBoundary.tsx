import { Component, type ReactNode } from 'react';
import { Card, CardBody, Button } from './index';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <Card className="w-full max-w-2xl">
            <CardBody className="text-center py-16 space-y-6">
              <div className="text-6xl">⚠️</div>
              <div>
                <h1 className="text-4xl font-bold text-red-500 mb-4">
                  {this.props.fallbackTitle || 'Something went wrong'}
                </h1>
                <p className="text-xl text-gray-300">
                  An unexpected error occurred
                </p>
              </div>
              {this.state.error && (
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-400 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={this.handleReset}
              >
                Reload Application
              </Button>
            </CardBody>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
