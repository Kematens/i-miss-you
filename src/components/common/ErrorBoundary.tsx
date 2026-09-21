import { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('[ErrorBoundary] Caught runtime exception:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F2E7] text-[#2C241E] flex flex-col items-center justify-center p-6 font-serif select-none">
          <div className="w-full max-w-sm rounded-3xl bg-[#FCF9F2] border-2 border-[#D4AF37]/60 shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#8C1D35]/10 border-2 border-[#8C1D35]/30 flex items-center justify-center text-[#8C1D35]">
              <AlertTriangle className="w-7 h-7 text-[#8C1D35]" />
            </div>

            <div>
              <span className="text-[10px] font-cinzel tracking-[0.2em] text-[#8C7658] block mb-1">
                LUMOS SHIELD · 魔法防护结界
              </span>
              <h2 className="text-base font-bold text-[#8C1D35] font-serif">
                心念微澜 · 灵犀暂时受阻
              </h2>
              <p className="text-xs text-[#524336] mt-2 leading-relaxed">
                星轨信号发生了短暂扰动，但请放心，你们的专属手札数据已安全妥善封存在本地魔法匣中。
              </p>
            </div>

            {this.state.error && (
              <div className="p-2.5 rounded-xl bg-[#FAF5EB] border border-[#D9C89E]/60 text-[10px] font-mono text-[#8C7658] text-left overflow-x-auto max-h-24">
                {this.state.error.message || 'Unknown Magic Anomaly'}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 rounded-xl text-xs font-serif bg-[#FAF5EB] text-[#524336] border border-[#D9C89E] hover:bg-[#F0E4D0] transition-colors cursor-pointer"
              >
                尝试修复
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 rounded-xl text-xs font-cinzel font-bold tracking-wider bg-gradient-to-r from-[#8C1D35] to-[#6B1226] text-[#FFFDF5] border border-[#D4AF37]/50 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重整星轨</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
