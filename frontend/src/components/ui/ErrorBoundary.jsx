import React from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';
import Button from './Button';
import Card from './Card';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary intercepted exception:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    if (window.confirm('Wipe all local configurations? This resets custom wealth milestones, offline logs, and theme settings.')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 antialiased text-slate-100 selection:bg-primary-500/30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.06),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(244,63,94,0.04),transparent_50%)] pointer-events-none" />
          
          <Card className="max-w-xl w-full p-8 border border-dark-border bg-dark-surface/65 backdrop-blur-xl shadow-glow flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-red to-amber-500" />
            
            <div className="w-16 h-16 rounded-2xl bg-accent-red/10 border border-accent-red/25 flex items-center justify-center text-accent-red mb-6 animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl font-extrabold text-white tracking-tight font-display mb-2">
              System Anomaly Intercepted
            </h1>
            <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
              ExpenseSO has isolated a runtime rendering exception. The session has been protected to prevent cascade failures.
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <Button 
                variant="primary" 
                icon={RefreshCw}
                onClick={this.handleReload}
              >
                Reload Window
              </Button>
              <Button 
                variant="ghost" 
                icon={Trash2}
                onClick={this.handleResetState}
                className="text-accent-red hover:bg-accent-red/10"
              >
                Reset App State
              </Button>
            </div>

            {this.state.error && (
              <div className="w-full text-left">
                <details className="group border border-dark-border/60 rounded-2xl overflow-hidden bg-dark-elevated/40">
                  <summary className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-dark-muted/20 select-none flex items-center justify-between">
                    <span>Inspect Diagnostics</span>
                    <span className="text-[10px] text-slate-600 transition-transform group-open:rotate-180">▼</span>
                  </summary>
                  <div className="p-4 border-t border-dark-border/40 font-mono text-[10px] text-slate-400 overflow-x-auto max-h-48 whitespace-pre-wrap select-all leading-normal bg-dark-bg/40">
                    <p className="font-bold text-accent-red mb-1">{this.state.error.toString()}</p>
                    <p>{this.state.errorInfo?.componentStack || 'No stack trace recorded.'}</p>
                  </div>
                </details>
              </div>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
