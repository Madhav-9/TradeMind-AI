import React from 'react';
import { Menu, Search, LayoutDashboard, LineChart, MessageSquare, Settings, Bell, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  showChat: boolean;
  onToggleChat: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, showChat, onToggleChat }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Markets' },
    { id: 'watchlist', icon: LineChart, label: 'Watchlist' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-[#0b1120] text-slate-300 font-sans overflow-hidden">
      {/* Professional Sidebar */}
      <aside className="w-16 lg:w-60 bg-[#0f172a] border-r border-slate-800 flex flex-col hidden md:flex z-20 shadow-xl">
        <div className="h-16 flex items-center px-4 border-b border-slate-800 bg-[#0f172a]">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-lg">T</div>
              <span className="text-lg font-bold text-slate-100 tracking-tight hidden lg:block">TradeMind</span>
           </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-sm font-medium ${
                activeTab === item.id
                  ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-emerald-500' : 'text-slate-500'}`} />
              <span className="hidden lg:block">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
           <div className="bg-slate-900/50 rounded-md p-3 border border-slate-800/50">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
               <span className="text-xs font-medium text-emerald-500 hidden lg:block">Market Live</span>
             </div>
             <p className="text-[10px] text-slate-500 mt-1 hidden lg:block">Data delayed by 3s (Sim)</p>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#0b1120]">
        
        {/* Professional Header */}
        <header className="h-16 border-b border-slate-800 bg-[#0f172a] flex items-center justify-between px-4 lg:px-6 shadow-sm z-10">
          <div className="flex items-center gap-4 md:hidden">
            <Menu className="w-5 h-5 text-slate-400" />
            <span className="font-bold text-slate-100">TradeMind</span>
          </div>

          <div className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                type="text" 
                placeholder="Search symbol, index, or news (e.g. AAPL, NIFTY)..." 
                className="w-full bg-[#1e293b] border border-slate-700 text-slate-200 rounded-md py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-slate-500"
                />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-5">
             <div className="flex items-center gap-3 border-r border-slate-800 pr-5">
                 <button className="text-slate-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                 </button>
             </div>
            <button 
              onClick={onToggleChat}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                showChat 
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                  : 'bg-[#1e293b] border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:block">AI Assistant</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-400">
                <User className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-auto p-4 lg:p-6 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};