import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Stock, MarketType, StockFilter, Watchlist } from './types';
import { initializeStocks, updateStockPrices } from './services/marketService';
import { StockDetail } from './components/StockDetail';
import { ChatWidget } from './components/ChatWidget';
import { TrendingUp, TrendingDown, Filter, Globe, Plus, Trash2, Key, Info, ArrowUpRight, ArrowDownRight, Search, X } from 'lucide-react';
import { formatCurrency, formatLargeNumber } from './utils/formatters';

interface StockRowProps {
    stock: Stock;
    onSelect: (stock: Stock) => void;
}

const StockRow: React.FC<StockRowProps> = ({ stock, onSelect }) => (
    <tr 
        onClick={() => onSelect(stock)}
        className="border-b border-slate-800/50 hover:bg-slate-800/40 cursor-pointer transition-colors group"
    >
        <td className="py-3 px-4">
            <div className="flex items-center gap-3">
                <div className={`w-1 h-8 rounded-full ${stock.change >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <div>
                    <div className="font-bold text-slate-200 text-sm group-hover:text-emerald-400 transition-colors">{stock.symbol}</div>
                    <div className="text-xs text-slate-500">{stock.market}</div>
                </div>
            </div>
        </td>
        <td className="py-3 px-4 hidden sm:table-cell">
            <div className="text-sm text-slate-400 font-medium truncate max-w-[140px]">{stock.name}</div>
            <div className="text-[10px] text-slate-600 uppercase tracking-wide">{stock.sector}</div>
        </td>
        <td className="py-3 px-4 text-right">
            <div className="font-mono text-slate-200 font-medium">{formatCurrency(stock.price, stock.market)}</div>
        </td>
        <td className="py-3 px-4 text-right">
            <div className={`font-mono text-sm inline-flex items-center gap-1 px-2 py-0.5 rounded ${stock.change >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                {stock.change >= 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
                {Math.abs(stock.changePercent).toFixed(2)}%
            </div>
        </td>
        <td className="py-3 px-4 text-right hidden md:table-cell">
            <div className="font-mono text-slate-400 text-sm">{formatLargeNumber(stock.volume)}</div>
        </td>
        <td className="py-3 px-4 text-right hidden lg:table-cell">
            <div className="font-mono text-slate-400 text-sm">{formatLargeNumber(stock.marketCap * 1000000000)}</div>
        </td>
        <td className="py-3 px-4 text-right">
             <div className="h-8 w-24 ml-auto opacity-70 group-hover:opacity-100 transition-opacity">
                 <svg viewBox="0 0 100 20" className="w-full h-full stroke-[1.5] fill-none">
                    <path 
                        d={`M0,10 ${stock.history.map((h, i) => `L${(i/stock.history.length)*100},${20 - ((h.price - stock.low52Week * 0.8)/(stock.high52Week*1.2 - stock.low52Week * 0.8))*20}`).join(' ')}`} 
                        className={stock.change >= 0 ? "stroke-emerald-500" : "stroke-red-500"}
                    />
                </svg>
             </div>
        </td>
    </tr>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showChat, setShowChat] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<MarketType | 'ALL'>('ALL');
  
  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const [filters, setFilters] = useState<StockFilter>({
    minCap: 0,
    maxCap: 10000,
    sectors: [],
    minVolume: 0,
    pattern: 'All'
  });

  // LocalStorage for Watchlist
  const [watchlist, setWatchlist] = useState<Watchlist>(() => {
    const saved = localStorage.getItem('tradeMindWatchlist');
    return saved ? JSON.parse(saved) : { id: 'default', name: 'My Watchlist', symbols: [] };
  });

  // Initialization
  useEffect(() => {
    const initialStocks = initializeStocks();
    setStocks(initialStocks);
  }, []);

  // Real-time Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks => updateStockPrices(prevStocks));
    }, 3000); 
    return () => clearInterval(interval);
  }, []);

  // Persist Watchlist
  useEffect(() => {
    localStorage.setItem('tradeMindWatchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatchlist = (stock: Stock) => {
    if (watchlist.symbols.includes(stock.symbol)) {
      setWatchlist(prev => ({ ...prev, symbols: prev.symbols.filter(s => s !== stock.symbol) }));
    } else {
      setWatchlist(prev => ({ ...prev, symbols: [...prev.symbols, stock.symbol] }));
    }
  };

  const availableSectors = useMemo(() => {
      const sectors = new Set(stocks.map(s => s.sector));
      return ['All', ...Array.from(sectors)];
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      if (selectedMarket !== 'ALL' && stock.market !== selectedMarket) return false;
      if (searchQuery && !stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) && !stock.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (sectorFilter !== 'All' && stock.sector !== sectorFilter) return false;
      // Additional numeric filters can go here
      return true;
    });
  }, [stocks, selectedMarket, searchQuery, sectorFilter]);

  const topGainers = [...filteredStocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const topLosers = [...filteredStocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

  const renderDashboard = () => (
    <div className="space-y-6 max-w-[1800px] mx-auto pb-10">
      
      {/* Ticker / Market Status Bar */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-[#1e293b] p-3 rounded-xl border border-slate-800 shadow-sm">
         <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full xl:w-auto">
            {(['ALL', 'USA', 'INDIA', 'CRYPTO'] as const).map(market => (
                <button
                key={market}
                onClick={() => setSelectedMarket(market)}
                className={`px-5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all whitespace-nowrap border ${
                    selectedMarket === market 
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                }`}
                >
                {market === 'ALL' ? 'GLOBAL' : market}
                </button>
            ))}
         </div>
         
         <div className="flex items-center gap-6 px-4 py-2 bg-[#0f172a] rounded-lg border border-slate-800 w-full xl:w-auto overflow-x-auto">
             <div className="flex flex-col items-start min-w-[100px]">
                 <span className="text-[10px] text-slate-500 font-bold uppercase">S&P 500</span>
                 <span className="text-emerald-500 font-mono text-sm font-bold">4,567.80 <span className="text-[10px]">+0.45%</span></span>
             </div>
             <div className="w-px h-6 bg-slate-800"></div>
             <div className="flex flex-col items-start min-w-[100px]">
                 <span className="text-[10px] text-slate-500 font-bold uppercase">NIFTY 50</span>
                 <span className="text-emerald-500 font-mono text-sm font-bold">22,120.50 <span className="text-[10px]">+0.8%</span></span>
             </div>
             <div className="w-px h-6 bg-slate-800"></div>
             <div className="flex flex-col items-start min-w-[100px]">
                 <span className="text-[10px] text-slate-500 font-bold uppercase">BITCOIN</span>
                 <span className="text-emerald-500 font-mono text-sm font-bold">$64,230 <span className="text-[10px]">+2.1%</span></span>
             </div>
         </div>
      </div>

      {/* Top Movers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="bg-[#1e293b] rounded-xl border border-slate-800 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2 text-emerald-500">
                    <TrendingUp className="w-5 h-5" />
                    <h3 className="font-bold text-sm tracking-wider uppercase text-white">Top Gainers</h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">24H CHANGE</span>
            </div>
            <div className="space-y-3">
                {topGainers.map(stock => (
                    <div key={stock.symbol} onClick={() => setSelectedStock(stock)} className="flex items-center justify-between group cursor-pointer hover:bg-slate-800 p-2 -mx-2 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-500 text-xs">{stock.symbol[0]}</div>
                             <div>
                                <span className="font-bold text-slate-200 group-hover:text-emerald-400 text-sm block">{stock.symbol}</span>
                                <span className="text-[10px] text-slate-500 uppercase">{stock.name}</span>
                             </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-sm text-slate-200 font-mono font-medium">{formatCurrency(stock.price, stock.market)}</span>
                            <span className="text-xs font-bold text-emerald-500">
                                +{stock.changePercent.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        {/* Top Losers */}
        <div className="bg-[#1e293b] rounded-xl border border-slate-800 p-5 shadow-lg">
             <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2 text-red-500">
                    <TrendingDown className="w-5 h-5" />
                    <h3 className="font-bold text-sm tracking-wider uppercase text-white">Top Losers</h3>
                </div>
                 <span className="text-xs text-slate-500 font-mono">24H CHANGE</span>
            </div>
             <div className="space-y-3">
                {topLosers.map(stock => (
                    <div key={stock.symbol} onClick={() => setSelectedStock(stock)} className="flex items-center justify-between group cursor-pointer hover:bg-slate-800 p-2 -mx-2 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center font-bold text-red-500 text-xs">{stock.symbol[0]}</div>
                            <div>
                                <span className="font-bold text-slate-200 group-hover:text-red-400 text-sm block">{stock.symbol}</span>
                                <span className="text-[10px] text-slate-500 uppercase">{stock.name}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-sm text-slate-200 font-mono font-medium">{formatCurrency(stock.price, stock.market)}</span>
                            <span className="text-xs font-bold text-red-500">
                                {stock.changePercent.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#1e293b] rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
         {/* Filters Bar */}
         <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-[#1e293b]">
            <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-slate-200 text-lg">Market Overview</h3>
                <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full border border-slate-700">{filteredStocks.length} Assets</span>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Filter by Symbol..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-64 bg-[#0f172a] border border-slate-700 text-slate-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-600"
                    />
                </div>
                
                <div className="relative">
                    <select 
                        value={sectorFilter}
                        onChange={(e) => setSectorFilter(e.target.value)}
                        className="w-full md:w-40 appearance-none bg-[#0f172a] border border-slate-700 text-slate-200 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                        {availableSectors.map(sector => (
                            <option key={sector} value={sector}>{sector}</option>
                        ))}
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
            </div>
         </div>

         <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-[#0f172a] text-xs uppercase text-slate-400 border-b border-slate-800 tracking-wider">
                        <th className="py-4 px-4 font-semibold">Asset</th>
                        <th className="py-4 px-4 font-semibold hidden sm:table-cell">Details</th>
                        <th className="py-4 px-4 font-semibold text-right">Price</th>
                        <th className="py-4 px-4 font-semibold text-right">Change</th>
                        <th className="py-4 px-4 font-semibold text-right hidden md:table-cell">Volume</th>
                        <th className="py-4 px-4 font-semibold text-right hidden lg:table-cell">Market Cap</th>
                        <th className="py-4 px-4 font-semibold text-right">Trend (1H)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                    {filteredStocks.map(stock => (
                        <StockRow key={stock.symbol} stock={stock} onSelect={setSelectedStock} />
                    ))}
                    {filteredStocks.length === 0 && (
                        <tr>
                            <td colSpan={7} className="text-center py-20 text-slate-500">
                                <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                No assets found matching criteria
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );

  const renderWatchlist = () => {
    const watchlistedStocks = stocks.filter(s => watchlist.symbols.includes(s.symbol));
    
    return (
      <div className="max-w-6xl mx-auto space-y-6">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#1e293b] p-6 rounded-xl border border-slate-800 shadow-lg">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">My Watchlist</h2>
                <p className="text-slate-400 text-sm">Tracking {watchlistedStocks.length} assets</p>
            </div>
            <button className="mt-4 md:mt-0 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors font-bold shadow-lg shadow-emerald-900/40">
                <Plus className="w-4 h-4" /> Add New Asset
            </button>
         </div>

         {watchlistedStocks.length === 0 ? (
            <div className="text-center py-24 bg-[#1e293b] rounded-xl border border-dashed border-slate-700">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                    <Globe className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-slate-300 text-lg font-medium">Your watchlist is empty</h3>
                <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm">Go to Markets to pin stocks here.</p>
            </div>
         ) : (
            <div className="bg-[#1e293b] rounded-xl border border-slate-800 overflow-hidden shadow-lg">
                <table className="w-full text-left">
                     <thead className="bg-[#0f172a] text-xs uppercase text-slate-500 border-b border-slate-800">
                        <tr>
                            <th className="p-4">Asset</th>
                            <th className="p-4 text-right">Price</th>
                            <th className="p-4 text-right">Change</th>
                            <th className="p-4 text-right hidden sm:table-cell">Day Range</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800/50">
                        {watchlistedStocks.map(stock => (
                             <tr key={stock.symbol} className="hover:bg-slate-800/50 transition-colors">
                                <td className="p-4 cursor-pointer" onClick={() => setSelectedStock(stock)}>
                                     <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-400 text-sm border border-slate-700">{stock.symbol[0]}</div>
                                         <div>
                                             <div className="font-bold text-slate-200">{stock.symbol}</div>
                                             <div className="text-xs text-slate-500">{stock.name}</div>
                                         </div>
                                     </div>
                                </td>
                                <td className="p-4 text-right font-mono text-slate-200 font-medium">
                                    {formatCurrency(stock.price, stock.market)}
                                </td>
                                <td className="p-4 text-right">
                                    <span className={`font-mono text-sm px-2 py-1 rounded font-bold ${stock.change >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                                        {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                    </span>
                                </td>
                                <td className="p-4 text-right hidden sm:table-cell">
                                    <div className="text-xs text-slate-500 font-mono">
                                        L: {formatCurrency(stock.low52Week, stock.market).split('.')[0]} - H: {formatCurrency(stock.high52Week, stock.market).split('.')[0]}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => toggleWatchlist(stock)}
                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                             </tr>
                        ))}
                     </tbody>
                </table>
            </div>
         )}
      </div>
    );
  };

  const renderSettings = () => (
      <div className="max-w-2xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-[#1e293b] rounded-xl border border-slate-800 p-8 shadow-2xl">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-emerald-600/20 rounded-xl border border-emerald-500/20">
                    <Info className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">About TradeMind Pro</h2>
                    <p className="text-slate-400 text-sm">Application Information v2.0</p>
                </div>
             </div>

             <div className="space-y-6">
                 <div className="bg-[#0f172a] p-6 rounded-lg border border-slate-800">
                     <p className="text-sm text-slate-300 leading-relaxed">
                         TradeMind is a professional simulated trading environment enhanced with Generative AI. 
                         The application integrates real-time market simulation, technical indicators, and Gemini AI for advanced stock analysis.
                     </p>
                     <div className="mt-4 flex gap-2">
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">React 18</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">Tailwind CSS</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">Gemini Flash</span>
                     </div>
                 </div>
                 
                 <div className="p-4 rounded-lg bg-blue-900/10 border border-blue-800/30">
                     <h4 className="text-blue-400 font-bold text-sm mb-1">API Configuration</h4>
                     <p className="text-xs text-blue-300/70">
                        This app uses environment variables for secure API key management. 
                        Users can bring their own keys for extended usage limits in the chat assistant.
                     </p>
                 </div>
             </div>
          </div>
      </div>
  );

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      showChat={showChat}
      onToggleChat={() => setShowChat(!showChat)}
    >
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'watchlist' && renderWatchlist()}
      {activeTab === 'settings' && renderSettings()}

      {selectedStock && (
        <StockDetail 
          stock={selectedStock} 
          onClose={() => setSelectedStock(null)} 
          addToWatchlist={toggleWatchlist}
          isInWatchlist={watchlist.symbols.includes(selectedStock.symbol)}
        />
      )}

      <ChatWidget 
        isOpen={showChat} 
        onClose={() => setShowChat(false)}
        currentContext={selectedStock ? `${selectedStock.symbol} - ${selectedStock.name} at ${formatCurrency(selectedStock.price, selectedStock.market)}` : 'General Dashboard'} 
      />
    </Layout>
  );
};

export default App;
