import React, { useState, useEffect } from 'react';
import { Stock } from '../types';
import { StockChart } from './StockChart';
import { ArrowUp, ArrowDown, Bot, ExternalLink, X, TrendingUp, TrendingDown, Clock, BarChart3, DollarSign, Target } from 'lucide-react';
import { getFundamentalAnalysis, getTechnicalAnalysis } from '../services/geminiService';
import { formatCurrency, formatLargeNumber } from '../utils/formatters';

interface StockDetailProps {
  stock: Stock;
  onClose: () => void;
  addToWatchlist: (stock: Stock) => void;
  isInWatchlist: boolean;
}

export const StockDetail: React.FC<StockDetailProps> = ({ stock, onClose, addToWatchlist, isInWatchlist }) => {
  const [activeAnalysis, setActiveAnalysis] = useState<'technical' | 'fundamental'>('technical');
  const [analysisText, setAnalysisText] = useState<string>("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [chartMode, setChartMode] = useState<'native' | 'tradingview'>('native');

  const isPositive = stock.change >= 0;

  useEffect(() => {
    fetchAnalysis();
  }, [stock.symbol, activeAnalysis]);

  const fetchAnalysis = async () => {
    setLoadingAnalysis(true);
    setAnalysisText("Analyzing market data...");
    
    let result = "";
    if (activeAnalysis === 'technical') {
      result = await getTechnicalAnalysis(stock);
    } else {
      result = await getFundamentalAnalysis(stock);
    }
    
    setAnalysisText(result);
    setLoadingAnalysis(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0b1221] w-full max-w-[1600px] h-full md:h-[90vh] md:rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Header Bar */}
        <div className="h-16 px-4 md:px-6 border-b border-slate-800 flex items-center justify-between bg-[#0f172a]">
          <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
             <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-lg shadow-inner">
                {stock.symbol[0]}
             </div>
             <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{stock.symbol}</h2>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">{stock.market}</span>
                </div>
                <span className="text-xs md:text-sm text-slate-400 block truncate">{stock.name}</span>
             </div>
             <div className="h-8 w-px bg-slate-700 mx-2 hidden md:block"></div>
             <div className="hidden md:flex flex-col">
                 <span className="text-2xl font-mono text-white tracking-tight leading-none">
                    {formatCurrency(stock.price, stock.market)}
                 </span>
                 <span className={`flex items-center text-xs font-bold mt-1 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isPositive ? <ArrowUp size={12} strokeWidth={3} /> : <ArrowDown size={12} strokeWidth={3} />}
                    {Math.abs(stock.change).toFixed(2)} ({Math.abs(stock.changePercent).toFixed(2)}%)
                </span>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="md:hidden text-right mr-2">
                 <div className="text-lg font-mono text-white">{formatCurrency(stock.price, stock.market)}</div>
                 <div className={`text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {stock.changePercent.toFixed(2)}%
                 </div>
             </div>
             <button 
              onClick={() => addToWatchlist(stock)}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                  isInWatchlist 
                  ? 'bg-slate-800 text-slate-400 border border-slate-700' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-emerald-900/50'
              }`}
            >
              {isInWatchlist ? 'Following' : '+ Follow'}
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Side: Charts & Stats */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#0b1221]">
            
            {/* Toolbar */}
            <div className="h-10 border-b border-slate-800 flex items-center justify-between px-4 bg-[#0f172a]/50">
                <div className="flex gap-4 text-xs font-medium text-slate-400">
                     <button className="text-emerald-400 border-b-2 border-emerald-500 h-10 px-1">Overview</button>
                     <button className="hover:text-slate-200 h-10 px-1 transition-colors">Financials</button>
                     <button className="hover:text-slate-200 h-10 px-1 transition-colors">News</button>
                </div>
                <div className="flex bg-slate-800/80 rounded p-0.5 border border-slate-700">
                    <button 
                        onClick={() => setChartMode('native')}
                        className={`px-3 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${chartMode === 'native' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Pro Chart
                    </button>
                    <button 
                        onClick={() => setChartMode('tradingview')}
                        className={`px-3 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${chartMode === 'tradingview' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        TradingView
                    </button>
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 relative min-h-[300px] border-b border-slate-800">
               {chartMode === 'native' ? (
                <div className="absolute inset-0 p-4 bg-gradient-to-b from-[#0b1221] to-[#0f172a]">
                  <StockChart stock={stock} />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0b1120]">
                    <div className="text-center p-8 border border-slate-800 rounded-lg bg-[#0f172a]">
                        <ExternalLink className="mx-auto w-10 h-10 text-slate-600 mb-4" />
                        <h4 className="text-slate-300 font-semibold">TradingView Integration</h4>
                        <p className="text-slate-500 text-sm mt-2">
                           Interactive {stock.symbol} chart loaded here.
                        </p>
                    </div>
                </div>
              )}
            </div>

            {/* Key Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-800/50 bg-[#0f172a] h-auto lg:h-32 border-b lg:border-none border-slate-800">
                <div className="p-4 flex flex-col justify-center hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <DollarSign className="w-3 h-3" />
                        <span className="text-xs font-bold uppercase tracking-wider">Market Cap</span>
                    </div>
                    <span className="text-xl font-mono text-slate-200 font-medium">
                        {formatLargeNumber(stock.marketCap * 1000000000)}
                    </span>
                </div>
                 <div className="p-4 flex flex-col justify-center hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <BarChart3 className="w-3 h-3" />
                        <span className="text-xs font-bold uppercase tracking-wider">Volume</span>
                    </div>
                    <span className="text-xl font-mono text-slate-200 font-medium">
                        {formatLargeNumber(stock.volume)}
                    </span>
                </div>
                 <div className="p-4 flex flex-col justify-center hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Target className="w-3 h-3" />
                        <span className="text-xs font-bold uppercase tracking-wider">52W High/Low</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-slate-400 font-mono">
                            <span>{formatCurrency(stock.low52Week, stock.market)}</span>
                            <span>{formatCurrency(stock.high52Week, stock.market)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-emerald-500/50" 
                                style={{ 
                                    width: `${Math.min(100, Math.max(0, ((stock.price - stock.low52Week) / (stock.high52Week - stock.low52Week)) * 100))}%` 
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
                 <div className="p-4 flex flex-col justify-center hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs font-bold uppercase tracking-wider">P/E Ratio</span>
                    </div>
                    <span className="text-xl font-mono text-slate-200 font-medium">{stock.peRatio || '--'}</span>
                </div>
            </div>
          </div>

          {/* Right Side: AI Analysis Panel */}
          <div className="w-full lg:w-[420px] bg-[#0f172a] border-l border-slate-800 flex flex-col h-[50vh] lg:h-auto">
            <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-purple-900/10 to-transparent">
               <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-purple-400">
                     <Bot className="w-5 h-5" />
                     <span className="font-bold text-sm tracking-wide">GEMINI INTELLIGENCE</span>
                   </div>
                   <div className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase rounded border border-purple-500/20">
                       PRO Analysis
                   </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 bg-[#0f172a] border-b border-slate-800">
              <button
                onClick={() => setActiveAnalysis('technical')}
                className={`py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                  activeAnalysis === 'technical' 
                  ? 'bg-purple-600/10 border-purple-500/50 text-purple-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Technical
                </div>
              </button>
              <button
                onClick={() => setActiveAnalysis('fundamental')}
                className={`py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                  activeAnalysis === 'fundamental' 
                  ? 'bg-purple-600/10 border-purple-500/50 text-purple-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                    <TrendingDown className="w-3 h-3" /> Fundamental
                </div>
              </button>
            </div>

            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar relative bg-[#0b1221]">
               {loadingAnalysis ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-4 bg-[#0b1221]/80 backdrop-blur-sm z-10">
                  <div className="relative">
                    <div className="w-10 h-10 border-2 border-slate-700 border-t-purple-500 rounded-full animate-spin"></div>
                  </div>
                  <span className="text-xs font-mono animate-pulse text-purple-400">PROCESSING MARKET DATA...</span>
                </div>
              ) : null}
              
              <div className="prose prose-invert prose-sm max-w-none">
                {analysisText.split('\n').map((line, i) => (
                    <p key={i} className={`text-slate-300 text-sm leading-relaxed ${line.includes('Bullish') ? 'text-emerald-400 font-bold' : line.includes('Bearish') ? 'text-red-400 font-bold' : ''}`}>
                        {line}
                    </p>
                ))}
              </div>

              {!loadingAnalysis && !analysisText && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-600">
                      <Bot className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs">Select analysis type to begin</span>
                  </div>
              )}
            </div>

            <div className="p-3 bg-[#0f172a] border-t border-slate-800">
                <div className="flex items-start gap-2 p-2 bg-yellow-900/10 border border-yellow-700/20 rounded text-yellow-500/70">
                    <div className="mt-0.5"><Clock className="w-3 h-3" /></div>
                    <p className="text-[10px] leading-tight">
                        AI analysis is experimental. Market conditions change rapidly. Always verify with official financial documents.
                    </p>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
