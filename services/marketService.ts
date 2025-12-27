import { Stock, MarketType } from '../types';

// Initial Mock Data
const BASE_STOCKS: Partial<Stock>[] = [
  // USA
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', market: 'USA', price: 175.50, marketCap: 2800 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', market: 'USA', price: 320.00, marketCap: 2400 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', market: 'USA', price: 135.20, marketCap: 1700 },
  { symbol: 'AMZN', name: 'Amazon.com', sector: 'Consumer Cyclical', market: 'USA', price: 145.30, marketCap: 1500 },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', market: 'USA', price: 240.50, marketCap: 800 },
  { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Finance', market: 'USA', price: 150.10, marketCap: 430 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', market: 'USA', price: 460.15, marketCap: 1100 },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', market: 'USA', price: 33.50, marketCap: 190 },

  // INDIA
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy', market: 'INDIA', price: 2350.00, marketCap: 200 },
  { symbol: 'TCS', name: 'Tata Consultancy Svcs', sector: 'Technology', market: 'INDIA', price: 3400.00, marketCap: 150 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Finance', market: 'INDIA', price: 1520.00, marketCap: 120 },
  { symbol: 'INFY', name: 'Infosys Ltd', sector: 'Technology', market: 'INDIA', price: 1450.00, marketCap: 80 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Finance', market: 'INDIA', price: 950.00, marketCap: 70 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Automotive', market: 'INDIA', price: 620.00, marketCap: 30 },
  { symbol: 'ITC', name: 'ITC Limited', sector: 'Consumer Defensive', market: 'INDIA', price: 440.00, marketCap: 60 },
  
  // CRYPTO (Bonus)
  { symbol: 'BTC', name: 'Bitcoin', sector: 'Crypto', market: 'CRYPTO', price: 64000.00, marketCap: 1200 },
  { symbol: 'ETH', name: 'Ethereum', sector: 'Crypto', market: 'CRYPTO', price: 3400.00, marketCap: 400 },
  { symbol: 'SOL', name: 'Solana', sector: 'Crypto', market: 'CRYPTO', price: 145.00, marketCap: 65 },
];

function generateHistory(basePrice: number): { time: string; price: number }[] {
  const history = [];
  let price = basePrice;
  const now = new Date();
  for (let i = 20; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000); // Past 20 minutes
    const change = (Math.random() - 0.5) * (basePrice * 0.005);
    price += change;
    history.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: parseFloat(price.toFixed(2))
    });
  }
  return history;
}

export const initializeStocks = (): Stock[] => {
  return BASE_STOCKS.map(s => {
    const basePrice = s.price || 100;
    const history = generateHistory(basePrice);
    const currentPrice = history[history.length - 1].price;
    const openPrice = history[0].price; // Approximate open for the "day" (last 20 mins here)
    const change = currentPrice - openPrice;
    const changePercent = (change / openPrice) * 100;

    return {
      symbol: s.symbol!,
      name: s.name!,
      sector: s.sector!,
      market: s.market!,
      marketCap: s.marketCap!,
      price: currentPrice,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 500000,
      peRatio: parseFloat((Math.random() * 20 + 10).toFixed(2)),
      high52Week: basePrice * 1.2,
      low52Week: basePrice * 0.8,
      history: history
    };
  });
};

export const updateStockPrices = (stocks: Stock[]): Stock[] => {
  return stocks.map(stock => {
    const volatility = 0.002; // 0.2% max movement per tick
    const change = (Math.random() - 0.5) * stock.price * volatility;
    const newPrice = Math.max(0.01, stock.price + change);
    
    // Update history
    const newHistory = [...stock.history.slice(1)];
    newHistory.push({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: parseFloat(newPrice.toFixed(2))
    });

    // Recalculate daily change based on the first point in our memory (mocking session open)
    const openPrice = stock.history[0].price; 
    const dayChange = newPrice - openPrice;
    const dayChangePercent = (dayChange / openPrice) * 100;

    return {
      ...stock,
      price: parseFloat(newPrice.toFixed(2)),
      change: parseFloat(dayChange.toFixed(2)),
      changePercent: parseFloat(dayChangePercent.toFixed(2)),
      history: newHistory
    };
  });
};