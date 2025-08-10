import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Optional: send to monitoring service
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, info);
    }
  }

  private handleRetry = () => {
    // Simple recovery strategy: full reload
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
          <div className="max-w-md w-full rounded-xl border bg-white p-6 shadow-sm text-center">
            <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-600 mb-4">
              An unexpected error occurred. Please try reloading the page.
            </p>
            <div className="text-left bg-gray-50 rounded-md p-3 mb-4 overflow-auto max-h-40">
              <pre className="text-xs text-gray-500 whitespace-pre-wrap break-words">
                {this.state.error?.message}
              </pre>
            </div>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
