
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        // Here we would send to analytics service
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-red-50/50 rounded-3xl border border-red-100">
                    <div className="bg-red-100 p-4 rounded-full mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
                    <p className="text-slate-600 mb-6 max-w-sm">
                        The application encountered an unexpected error. Our team has been notified.
                    </p>
                    {this.state.error && (
                        <pre className="text-xs text-left bg-white p-4 rounded-lg border border-red-100 text-red-800 mb-6 w-full max-w-md overflow-x-auto">
                            {this.state.error.message}
                        </pre>
                    )}
                    <button
                        onClick={this.handleReset}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-500/20"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
