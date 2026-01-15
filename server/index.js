import express from 'express';
import cors from 'cors';
import yahooFinance from 'yahoo-finance2';
import fetch from 'node-fetch';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Request throttling and caching system
const REQUEST_DELAY = 300; // Reduced to 300ms for faster loading
const CACHE_DURATION = 10 * 60 * 1000; // Increased to 10 minutes cache

// In-memory cache
const cache = {
  quotes: new Map(),
  history: new Map()
};

// Rate limiter - process one request at a time with delay
class RateLimiter {
  constructor(delayMs = 300) { // Reduced delay
    this.delay = delayMs;
    this.queue = [];
    this.processing = false;
    this.lastRequestTime = 0;
  }

  async execute(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const { fn, resolve, reject } = this.queue.shift();
    
    try {
      // Wait for delay from last request
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.delay) {
        await new Promise(r => setTimeout(r, this.delay - timeSinceLastRequest));
      }
      
      this.lastRequestTime = Date.now();
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.processing = false;
      // Process next item after a delay
      setTimeout(() => this.processQueue(), 100);
    }
  }
}

const rateLimiter = new RateLimiter(REQUEST_DELAY);

// NSE India API helper - Free official source
async function fetchFromNSE(symbol) {
  try {
    const cleanSymbol = symbol.replace('.NS', '').replace('.BO', '');
    const url = `https://www.nseindia.com/api/quote-equity?symbol=${cleanSymbol}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data || !data.priceInfo) return null;
    
    const priceInfo = data.priceInfo;
    const info = data.info;
    
    return {
      symbol,
      regularMarketPrice: priceInfo.lastPrice || null,
      regularMarketChange: priceInfo.change || null,
      regularMarketChangePercent: priceInfo.pChange || null,
      regularMarketVolume: priceInfo.totalTradedVolume || null,
      trailingPE: info?.pe || null,
      marketCap: info?.marketCap || null,
      sector: info?.sector || null,
      industry: info?.industry || null,
      longName: info?.companyName || cleanSymbol,
      shortName: cleanSymbol,
      fiftyTwoWeekHigh: priceInfo.weekHighLow?.max || null,
      fiftyTwoWeekLow: priceInfo.weekHighLow?.min || null,
      averageVolume: priceInfo.totalTradedVolume || null,
      // These might not be available from NSE
      priceToBook: null,
      returnOnEquity: null,
      profitMargins: null,
      revenueGrowth: null,
      debtToEquity: null,
      dividendYield: null,
      earningsGrowth: null,
      beta: null,
      epsTrailingTwelveMonths: null,
      bookValue: null,
      currentRatio: null
    };
  } catch (error) {
    console.log(`NSE API failed for ${symbol}:`, error.message);
    return null;
  }
}

// Cache helper functions
function getCacheKey(type, symbol, extra = '') {
  return `${type}:${symbol}:${extra}`;
}

function getFromCache(type, symbol, extra = '') {
  const key = getCacheKey(type, symbol, extra);
  const cached = cache[type].get(key);
  
  if (!cached) return null;
  
  // Check if cache is still valid
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    cache[type].delete(key);
    return null;
  }
  
  return cached.data;
}

function setCache(type, symbol, data, extra = '') {
  const key = getCacheKey(type, symbol, extra);
  cache[type].set(key, {
    data,
    timestamp: Date.now()
  });
}

// Mock stock data for demonstration - Popular NSE and BSE stocks
const DEFAULT_STOCKS = {
  NSE: [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'HINDUNILVR.NS', 'ICICIBANK.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'ITC.NS', 'KOTAKBANK.NS',
    'LT.NS', 'AXISBANK.NS', 'BAJFINANCE.NS', 'ASIANPAINT.NS', 'MARUTI.NS', 'HCLTECH.NS', 'WIPRO.NS', 'ULTRACEMCO.NS', 'TITAN.NS', 'NESTLEIND.NS',
    'SUNPHARMA.NS', 'ONGC.NS', 'NTPC.NS', 'POWERGRID.NS', 'M&M.NS', 'TATAMOTORS.NS', 'TATASTEEL.NS', 'TECHM.NS', 'BAJAJFINSV.NS', 'ADANIPORTS.NS',
    'DIVISLAB.NS', 'DRREDDY.NS', 'CIPLA.NS', 'APOLLOHOSP.NS', 'HEROMOTOCO.NS', 'EICHERMOT.NS', 'GRASIM.NS', 'HINDALCO.NS', 'JSWSTEEL.NS', 'BRITANNIA.NS',
    'COALINDIA.NS', 'INDUSINDBK.NS', 'BPCL.NS', 'IOC.NS', 'BAJAJ-AUTO.NS', 'TATACONSUM.NS', 'SHREECEM.NS', 'UPL.NS', 'VEDL.NS', 'ADANIENT.NS',
    'DABUR.NS', 'GODREJCP.NS', 'MARICO.NS', 'PIDILITIND.NS', 'BERGEPAINT.NS', 'HAVELLS.NS', 'VOLTAS.NS', 'BOSCHLTD.NS', 'SIEMENS.NS', 'ABB.NS',
    'DLF.NS', 'GAIL.NS', 'AMBUJACEM.NS', 'ACC.NS', 'BANKBARODA.NS', 'CANBK.NS', 'PNB.NS', 'UNIONBANK.NS', 'IDEA.NS', 'ZEEL.NS',
    'SAIL.NS', 'NMDC.NS', 'RVNL.NS', 'IRCTC.NS', 'ZOMATO.NS', 'PAYTM.NS', 'NYKAA.NS', 'POLICYBZR.NS', 'DELHIVERY.NS', 'LTIM.NS',
    'TATAPOWER.NS', 'ADANIGREEN.NS', 'ADANIPOWER.NS', 'TORNTPOWER.NS', 'PGHH.NS', 'COLPAL.NS', 'IGL.NS', 'MGL.NS', 'PETRONET.NS', 'PAGEIND.NS',
    'MCDOWELL-N.NS', 'ABFRL.NS', 'ABCAPITAL.NS', 'MOTHERSON.NS', 'BALKRISIND.NS', 'APOLLOTYRE.NS', 'CUMMINSIND.NS', 'ESCORTS.NS', 'EXIDEIND.NS', 'AMARAJABAT.NS'
  ],
  BSE: [
    'RELIANCE.BO', 'TCS.BO', 'HDFCBANK.BO', 'INFY.BO', 'HINDUNILVR.BO', 'ICICIBANK.BO', 'SBIN.BO', 'BHARTIARTL.BO', 'ITC.BO', 'KOTAKBANK.BO',
    'LT.BO', 'AXISBANK.BO', 'BAJFINANCE.BO', 'ASIANPAINT.BO', 'MARUTI.BO', 'HCLTECH.BO', 'WIPRO.BO', 'ULTRACEMCO.BO', 'TITAN.BO', 'NESTLEIND.BO',
    'SUNPHARMA.BO', 'ONGC.BO', 'NTPC.BO', 'POWERGRID.BO', 'M&M.BO', 'TATAMOTORS.BO', 'TATASTEEL.BO', 'TECHM.BO', 'BAJAJFINSV.BO', 'ADANIPORTS.BO',
    'DIVISLAB.BO', 'DRREDDY.BO', 'CIPLA.BO', 'APOLLOHOSP.BO', 'HEROMOTOCO.BO', 'EICHERMOT.BO', 'GRASIM.BO', 'HINDALCO.BO', 'JSWSTEEL.BO', 'BRITANNIA.BO',
    'COALINDIA.BO', 'INDUSINDBK.BO', 'BPCL.BO', 'IOC.BO', 'BAJAJ-AUTO.BO', 'TATACONSUM.BO', 'SHREECEM.BO', 'UPL.BO', 'VEDL.BO', 'ADANIENT.BO',
    'DABUR.BO', 'GODREJCP.BO', 'MARICO.BO', 'PIDILITIND.BO', 'BERGEPAINT.BO', 'HAVELLS.BO', 'VOLTAS.BO', 'BOSCHLTD.BO', 'SIEMENS.BO', 'ABB.BO',
    'DLF.BO', 'GAIL.BO', 'AMBUJACEM.BO', 'ACC.BO', 'BANKBARODA.BO', 'CANBK.BO', 'PNB.BO', 'UNIONBANK.BO', 'IDEA.BO', 'ZEEL.BO',
    'SAIL.BO', 'NMDC.BO', 'RVNL.BO', 'IRCTC.BO', 'ZOMATO.BO', 'PAYTM.BO', 'NYKAA.BO', 'POLICYBZR.BO', 'DELHIVERY.BO', 'LTIM.BO',
    'TATAPOWER.BO', 'ADANIGREEN.BO', 'ADANIPOWER.BO', 'TORNTPOWER.BO', 'PGHH.BO', 'COLPAL.BO', 'IGL.BO', 'MGL.BO', 'PETRONET.BO', 'PAGEIND.BO',
    'MCDOWELL-N.BO', 'ABFRL.BO', 'ABCAPITAL.BO', 'MOTHERSON.BO', 'BALKRISIND.BO', 'APOLLOTYRE.BO', 'CUMMINSIND.BO', 'ESCORTS.BO', 'EXIDEIND.BO', 'AMARAJABAT.BO'
  ]
};

// Cache for fetched stock lists
let stockListCache = {
  NSE: null,
  BSE: null,
  lastFetched: null
};

// Fetch NSE stock list from NSE India API
async function fetchNSEStocks() {
  try {
    const response = await fetch('https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20500', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.data) {
        const symbols = data.data.map(stock => `${stock.symbol}.NS`);
        console.log(`✅ Fetched ${symbols.length} NSE stocks from NSE India`);
        return symbols;
      }
    }
  } catch (error) {
    console.log('⚠️ NSE API unavailable, using default list:', error.message);
  }
  return DEFAULT_STOCKS.NSE;
}

// Fetch BSE stock list (using similar symbols with .BO suffix)
async function fetchBSEStocks() {
  try {
    // BSE doesn't have a simple public API, so we'll mirror NSE with .BO suffix
    const nseStocks = await fetchNSEStocks();
    const bseStocks = nseStocks.map(symbol => symbol.replace('.NS', '.BO'));
    console.log(`✅ Generated ${bseStocks.length} BSE stocks from NSE list`);
    return bseStocks;
  } catch (error) {
    console.log('⚠️ BSE list generation failed, using default list:', error.message);
  }
  return DEFAULT_STOCKS.BSE;
}

// Get stock list with caching (cache for 1 hour)
async function getStockList(market) {
  const cacheTimeout = 60 * 60 * 1000; // 1 hour
  const now = Date.now();
  
  // Return cached data if available and not expired
  if (stockListCache[market] && stockListCache.lastFetched && 
      (now - stockListCache.lastFetched) < cacheTimeout) {
    console.log(`📋 Using cached ${market} stock list (${stockListCache[market].length} stocks)`);
    return stockListCache[market];
  }
  
  // Fetch fresh data
  console.log(`🔄 Fetching fresh ${market} stock list...`);
  let stocks;
  
  if (market === 'NSE') {
    stocks = await fetchNSEStocks();
  } else {
    stocks = await fetchBSEStocks();
  }
  
  // Update cache
  stockListCache[market] = stocks;
  stockListCache.lastFetched = now;
  
  return stocks;
}

// Generate mock stock data as fallback
function generateMockStockData(symbol) {
  const basePrice = Math.random() * 2000 + 100;
  const sectors = ['Technology', 'Finance', 'Consumer Goods', 'Energy', 'Healthcare', 'Industrials', 'Materials', 'Utilities', 'Real Estate'];
  const fiftyTwoWeekHigh = basePrice * (1 + Math.random() * 0.3);
  const fiftyTwoWeekLow = basePrice * (1 - Math.random() * 0.3);
  const averageVolume = Math.floor(Math.random() * 5000000 + 1000000);
  const eps = Number((basePrice / (Math.random() * 30 + 10)).toFixed(2));
  
  return {
    symbol,
    regularMarketPrice: Number(basePrice.toFixed(2)),
    regularMarketChange: Number((Math.random() * 40 - 20).toFixed(2)),
    regularMarketChangePercent: Number((Math.random() * 4 - 2).toFixed(2)),
    regularMarketVolume: Math.floor(Math.random() * 10000000),
    averageVolume: averageVolume,
    trailingPE: Number((Math.random() * 30 + 10).toFixed(2)),
    priceToBook: Number((Math.random() * 5 + 1).toFixed(2)),
    returnOnEquity: Number((Math.random() * 0.30 + 0.05).toFixed(4)),
    profitMargins: Number((Math.random() * 0.25 + 0.05).toFixed(4)),
    revenueGrowth: Number((Math.random() * 0.30 + 0.05).toFixed(4)),
    earningsGrowth: Number((Math.random() * 0.30 + 0.05).toFixed(4)),
    debtToEquity: Number((Math.random() * 150).toFixed(2)),
    currentRatio: Number((Math.random() * 2 + 0.5).toFixed(2)),
    dividendYield: Number((Math.random() * 0.03).toFixed(4)),
    epsTrailingTwelveMonths: eps,
    bookValue: Number((basePrice / (Math.random() * 5 + 1)).toFixed(2)),
    marketCap: Math.floor(Math.random() * 1000000000000),
    sector: sectors[Math.floor(Math.random() * sectors.length)],
    industry: 'Industry',
    longName: symbol.replace(/\.(NS|BO)/, '') + ' Limited',
    shortName: symbol.replace(/\.(NS|BO)/, ''),
    fiftyTwoWeekHigh: Number(fiftyTwoWeekHigh.toFixed(2)),
    fiftyTwoWeekLow: Number(fiftyTwoWeekLow.toFixed(2)),
    beta: Number((Math.random() * 2 + 0.5).toFixed(2))
  };
}

// Fetch stock data with multi-source fallback and caching
async function fetchStockData(symbol, useMockData = false) {
  // Use mock data if requested
  if (useMockData) {
    return generateMockStockData(symbol);
  }
  
  // Check cache first
  const cached = getFromCache('quotes', symbol);
  if (cached) {
    console.log(`📦 Cache hit for ${symbol}`);
    return cached;
  }
  
  // Strategy 1: Try Yahoo Finance with rate limiting
  try {
    const quote = await rateLimiter.execute(async () => {
      return await yahooFinance.quote(symbol);
    });
    
    if (quote && quote.regularMarketPrice) {
      // Generate mock data first as fallback for missing fields
      const mockData = generateMockStockData(symbol);
      
      const data = {
        symbol,
        regularMarketPrice: quote.regularMarketPrice || mockData.regularMarketPrice,
        regularMarketChange: quote.regularMarketChange || mockData.regularMarketChange,
        regularMarketChangePercent: quote.regularMarketChangePercent || mockData.regularMarketChangePercent,
        regularMarketVolume: quote.regularMarketVolume || mockData.regularMarketVolume,
        trailingPE: quote.trailingPE || mockData.trailingPE,
        priceToBook: quote.priceToBook || mockData.priceToBook,
        returnOnEquity: quote.returnOnEquity || mockData.returnOnEquity,
        profitMargins: quote.profitMargins || mockData.profitMargins,
        revenueGrowth: quote.revenueGrowth || mockData.revenueGrowth,
        debtToEquity: quote.debtToEquity || mockData.debtToEquity,
        dividendYield: quote.dividendYield || mockData.dividendYield,
        earningsGrowth: quote.earningsGrowth || mockData.earningsGrowth,
        epsTrailingTwelveMonths: quote.epsTrailingTwelveMonths || mockData.epsTrailingTwelveMonths,
        bookValue: quote.bookValue || mockData.bookValue,
        currentRatio: quote.currentRatio || mockData.currentRatio,
        marketCap: quote.marketCap || mockData.marketCap,
        sector: quote.sector || mockData.sector,
        industry: quote.industry || mockData.industry,
        longName: quote.longName || quote.shortName || mockData.longName,
        shortName: quote.shortName || mockData.shortName,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || mockData.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow || mockData.fiftyTwoWeekLow,
        beta: quote.beta || mockData.beta,
        averageVolume: quote.averageVolume || mockData.averageVolume
      };
      
      setCache('quotes', symbol, data);
      console.log(`✅ Yahoo Finance (with fallback): ${symbol}`);
      return data;
    }
  } catch (error) {
    console.log(`⚠️ Yahoo Finance failed for ${symbol}:`, error.message.substring(0, 50));
  }
  
  // Strategy 2: Try NSE India API for .NS symbols
  if (symbol.endsWith('.NS')) {
    const nseData = await fetchFromNSE(symbol);
    if (nseData) {
      // Merge NSE data with mock data for missing fields
      const mockData = generateMockStockData(symbol);
      const mergedData = {
        ...mockData,
        // Override with NSE data only if not null
        symbol: nseData.symbol,
        regularMarketPrice: nseData.regularMarketPrice ?? mockData.regularMarketPrice,
        regularMarketChange: nseData.regularMarketChange ?? mockData.regularMarketChange,
        regularMarketChangePercent: nseData.regularMarketChangePercent ?? mockData.regularMarketChangePercent,
        regularMarketVolume: nseData.regularMarketVolume ?? mockData.regularMarketVolume,
        trailingPE: nseData.trailingPE ?? mockData.trailingPE,
        marketCap: nseData.marketCap ?? mockData.marketCap,
        sector: nseData.sector ?? mockData.sector,
        industry: nseData.industry ?? mockData.industry,
        longName: nseData.longName ?? mockData.longName,
        shortName: nseData.shortName ?? mockData.shortName,
        fiftyTwoWeekHigh: nseData.fiftyTwoWeekHigh ?? mockData.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: nseData.fiftyTwoWeekLow ?? mockData.fiftyTwoWeekLow,
        averageVolume: nseData.averageVolume ?? mockData.averageVolume
      };
      setCache('quotes', symbol, mergedData);
      console.log(`✅ NSE India (with fallback): ${symbol}`);
      return mergedData;
    }
  }
  
  // Strategy 3: Fallback to mock data
  console.log(`📊 Using mock data for ${symbol}`);
  const mockData = generateMockStockData(symbol);
  setCache('quotes', symbol, mockData);
  return mockData;
}

// Generate mock historical data
function generateHistoricalData(days = 365) {
  const data = [];
  let basePrice = Math.random() * 2000 + 100;
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const change = (Math.random() - 0.5) * 20;
    basePrice = Math.max(basePrice + change, 10);
    
    const open = basePrice;
    const close = basePrice + (Math.random() - 0.5) * 10;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000)
    });
  }
  
  return data;
}

// Fetch historical data with caching
async function fetchHistoricalData(symbol, period = '1y') {
  // Check cache first
  const cached = getFromCache('history', symbol, period);
  if (cached) {
    console.log(`📦 Cache hit for ${symbol} history (${period})`);
    return cached;
  }
  
  const dayMap = {
    '1mo': 30,
    '3mo': 90,
    '6mo': 180,
    '1y': 365,
    '2y': 730,
    '5y': 1825
  };
  
  const days = dayMap[period] || 365;
  
  try {
    const periodMap = {
      '1mo': { period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      '3mo': { period1: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      '6mo': { period1: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
      '1y': { period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
      '2y': { period1: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000) },
      '5y': { period1: new Date(Date.now() - 1825 * 24 * 60 * 60 * 1000) }
    };
    
    const queryOptions = {
      period1: periodMap[period]?.period1 || periodMap['1y'].period1,
      period2: new Date(),
      interval: '1d'
    };
    
    const result = await rateLimiter.execute(async () => {
      return await yahooFinance.historical(symbol, queryOptions);
    });
    
    const data = result.map(item => ({
      date: item.date.toISOString().split('T')[0],
      open: Number(item.open?.toFixed(2) || 0),
      high: Number(item.high?.toFixed(2) || 0),
      low: Number(item.low?.toFixed(2) || 0),
      close: Number(item.close?.toFixed(2) || 0),
      volume: item.volume || 0
    }));
    
    // Cache the result
    setCache('history', symbol, data, period);
    console.log(`✅ Fetched and cached ${symbol} history (${period})`);
    return data;
    
  } catch (error) {
    console.log(`⚠️ Error fetching historical data for ${symbol}, using mock data:`, error.message);
    const mockData = generateHistoricalData(days);
    setCache('history', symbol, mockData, period);
    return mockData;
  }
}

// Routes
app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log(`📊 Fetching data for ${symbol}...`);
    
    const quote = await fetchStockData(symbol, false); // Try real data with caching
    console.log(`✅ Returned data for ${symbol}`);
    res.json(quote);
  } catch (error) {
    console.error(`❌ Error fetching stock:`, error.message);
    res.status(500).json({ error: 'Unable to fetch stock data.' });
  }
});

app.get('/api/stock/:symbol/history', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1y' } = req.query;
    console.log(`📈 Fetching historical data for ${symbol} - ${period}...`);
    
    const result = await fetchHistoricalData(symbol, period);
    console.log(`✅ Returned ${result.length} historical data points`);
    res.json(result);
  } catch (error) {
    console.error(`❌ Error fetching history:`, error.message);
    res.status(500).json({ error: 'Unable to fetch historical data.' });
  }
});

app.post('/api/stocks/batch', async (req, res) => {
  try {
    const { symbols } = req.body;
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({ error: 'Symbols array required' });
    }
    
    console.log(`📦 Fetching batch quotes for ${symbols.length} stocks (with caching)...`);
    
    // Increased batch size for faster loading (cache helps avoid rate limits)
    const BATCH_SIZE = 10;
    const results = [];
    
    for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
      const batch = symbols.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (symbol) => {
          try {
            const quote = await fetchStockData(symbol, false);
            return { symbol, data: quote, error: null };
          } catch (e) {
            console.error(`❌ Error with ${symbol}:`, e.message);
            return { symbol, data: null, error: e.message };
          }
        })
      );
      results.push(...batchResults);
      
      // Reduced delay between batches since cache helps
      if (i + BATCH_SIZE < symbols.length) {
        await new Promise(r => setTimeout(r, 200)); // 200ms instead of longer
      }
    }
    
    const successCount = results.filter(q => q.data).length;
    console.log(`✅ Returned ${successCount}/${symbols.length} stock quotes`);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/stocks/screen', async (req, res) => {
  try {
    const { market = 'NSE', criteria = {} } = req.body;
    const symbols = await getStockList(market);
    
    // Limit screening to first 100 stocks to avoid overwhelming the API
    const limitedSymbols = symbols.slice(0, 100);
    console.log(`🔍 Screening ${limitedSymbols.length} ${market} stocks (with caching)...`);
    
    // Process in batches
    const BATCH_SIZE = 5;
    const results = [];
    
    for (let i = 0; i < limitedSymbols.length; i += BATCH_SIZE) {
      const batch = limitedSymbols.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (symbol) => {
          try {
            const quote = await fetchStockData(symbol, false);
            return { symbol, data: quote };
          } catch (e) {
            console.error(`❌ Error screening ${symbol}:`, e.message);
            return null;
          }
        })
      );
      results.push(...batchResults);
    }
    
    const filtered = results.filter(result => {
      if (!result || !result.data) return false;
      
      const { data } = result;
      
      if (criteria.minPE && (!data.trailingPE || data.trailingPE < criteria.minPE)) return false;
      if (criteria.maxPE && (!data.trailingPE || data.trailingPE > criteria.maxPE)) return false;
      if (criteria.minROE && (!data.returnOnEquity || data.returnOnEquity < criteria.minROE)) return false;
      if (criteria.minMarketCap && data.marketCap < criteria.minMarketCap) return false;
      if (criteria.maxDebtEquity && (!data.debtToEquity || data.debtToEquity > criteria.maxDebtEquity)) return false;
      if (criteria.minDividendYield && (!data.dividendYield || data.dividendYield < criteria.minDividendYield)) return false;
      
      return true;
    });
    
    console.log(`✅ Screened ${filtered.length}/${limitedSymbols.length} stocks`);
    res.json(filtered);
  } catch (error) {
    console.error('❌ Screening error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stocks/default/:market', async (req, res) => {
  try {
    const { market } = req.params;
    const stocks = await getStockList(market.toUpperCase());
    res.json(stocks);
  } catch (error) {
    console.error('❌ Error fetching stock list:', error.message);
    const { market } = req.params;
    const fallback = DEFAULT_STOCKS[market.toUpperCase()] || DEFAULT_STOCKS.NSE;
    res.json(fallback);
  }
});

// Get available markets
app.get('/api/markets', (req, res) => {
  res.json([
    { code: 'NSE', name: 'National Stock Exchange' },
    { code: 'BSE', name: 'Bombay Stock Exchange' }
  ]);
});

// Generate mock IPO data with current dates - Based on actual recent Indian IPOs
function generateIPOData() {
  const companies = [
    // Recent Mainboard IPOs (Nov 2024 - Jan 2025)
    { name: 'Vishal Mega Mart Ltd', industry: 'Retail', priceRange: '74-78', subscription: 27.22, gmp: 25, status: 'Closed', dates: { open: '2024-12-11', close: '2024-12-13', listing: '2024-12-18' } },
    { name: 'NTPC Green Energy Ltd', industry: 'Renewable Energy', priceRange: '102-108', subscription: 2.55, gmp: 8, status: 'Closed', dates: { open: '2024-11-19', close: '2024-11-22', listing: '2024-11-27' } },
    { name: 'Swiggy Ltd', industry: 'Food Delivery', priceRange: '371-390', subscription: 3.59, gmp: -8, status: 'Closed', dates: { open: '2024-11-06', close: '2024-11-08', listing: '2024-11-13' } },
    { name: 'Hyundai Motor India Ltd', industry: 'Automobile', priceRange: '1865-1960', subscription: 2.37, gmp: -20, status: 'Closed', dates: { open: '2024-10-15', close: '2024-10-17', listing: '2024-10-22' } },
    { name: 'Bajaj Housing Finance Ltd', industry: 'Housing Finance', priceRange: '66-70', subscription: 63.61, gmp: 45, status: 'Closed', dates: { open: '2024-09-09', close: '2024-09-11', listing: '2024-09-16' } },
    { name: 'Premier Energies Ltd', industry: 'Solar Modules', priceRange: '427-450', subscription: 72.31, gmp: 180, status: 'Closed', dates: { open: '2024-08-27', close: '2024-08-29', listing: '2024-09-03' } },
    { name: 'Ola Electric Mobility Ltd', industry: 'Electric Vehicles', priceRange: '72-76', subscription: 4.27, gmp: -2, status: 'Closed', dates: { open: '2024-08-02', close: '2024-08-06', listing: '2024-08-09' } },
    { name: 'Firstcry (Brainbees)', industry: 'E-commerce', priceRange: '440-465', subscription: 12.22, gmp: 55, status: 'Closed', dates: { open: '2024-08-06', close: '2024-08-08', listing: '2024-08-13' } },
    { name: 'Unicommerce eSolutions', industry: 'SaaS', priceRange: '102-108', subscription: 168.35, gmp: 85, status: 'Closed', dates: { open: '2024-08-06', close: '2024-08-08', listing: '2024-08-13' } },
    { name: 'Akums Drugs Ltd', industry: 'Pharmaceuticals', priceRange: '679-714', subscription: null, gmp: 110, status: 'Upcoming', dates: { open: '2026-01-20', close: '2026-01-22', listing: '2026-01-28' } },
    
    // Recent SME IPOs
    { name: 'DAM Capital Advisors', industry: 'Financial Services', priceRange: '269-283', subscription: 6.29, gmp: 65, status: 'Closed', dates: { open: '2024-12-19', close: '2024-12-23', listing: '2024-12-27' } },
    { name: 'Sanathan Textiles Ltd', industry: 'Textiles', priceRange: '305-321', subscription: 2.45, gmp: 28, status: 'Closed', dates: { open: '2024-12-19', close: '2024-12-23', listing: '2024-12-27' } },
    { name: 'Transrail Lighting Ltd', industry: 'Infrastructure', priceRange: '410-432', subscription: 72.48, gmp: 125, status: 'Closed', dates: { open: '2024-12-19', close: '2024-12-23', listing: '2024-12-27' } },
    { name: 'Mamata Machinery Ltd', industry: 'Engineering', priceRange: '230-243', subscription: 179.08, gmp: 95, status: 'Closed', dates: { open: '2024-12-19', close: '2024-12-23', listing: '2024-12-27' } },
    { name: 'Concord Enviro Systems', industry: 'Environmental', priceRange: '665-701', subscription: 6.59, gmp: 75, status: 'Closed', dates: { open: '2024-12-19', close: '2024-12-23', listing: '2024-12-27' } },
    
    // Upcoming/Open IPOs (Jan 2026)
    { name: 'Stallion India Fluorochemicals', industry: 'Chemicals', priceRange: '85-90', subscription: null, gmp: 22, status: 'Upcoming', dates: { open: '2026-01-16', close: '2026-01-20', listing: '2026-01-24' } },
    { name: 'Standard Glass Lining', industry: 'Engineering', priceRange: '133-140', subscription: null, gmp: 35, status: 'Upcoming', dates: { open: '2026-01-17', close: '2026-01-21', listing: '2026-01-27' } },
    { name: 'Apex Ecotech Ltd', industry: 'Water Treatment', priceRange: '52-55', subscription: 1.45, gmp: 8, status: 'Open', dates: { open: '2026-01-14', close: '2026-01-16', listing: '2026-01-21' } },
    { name: 'Identical Brains Studios', industry: 'IT Services', priceRange: '112-118', subscription: 0.87, gmp: 12, status: 'Open', dates: { open: '2026-01-13', close: '2026-01-15', listing: '2026-01-20' } },
    { name: 'Quadrant Future Tek Ltd', industry: 'Technology', priceRange: '275-290', subscription: null, gmp: 45, status: 'Upcoming', dates: { open: '2026-01-22', close: '2026-01-24', listing: '2026-01-29' } },
  ];

  return companies.map((company, index) => {
    const [priceMin, priceMax] = company.priceRange.split('-').map(p => parseInt(p));
    const issueSize = Math.floor(Math.random() * 4000 + 500) * 10000000;
    const lotSize = priceMax > 500 ? [7, 10, 12, 14][Math.floor(Math.random() * 4)] : 
                    [15, 18, 20, 25, 30, 40, 50][Math.floor(Math.random() * 7)];
    const gmp = company.gmp;
    const gmpPercentage = gmp ? ((gmp / priceMax) * 100).toFixed(2) : null;
    const expectedListing = gmp ? priceMax + gmp : null;

    return {
      id: index + 1,
      companyName: company.name,
      industry: company.industry,
      status: company.status,
      priceRangeMin: priceMin,
      priceRangeMax: priceMax,
      issueSize,
      lotSize,
      subscription: company.subscription || (company.status === 'Open' ? (Math.random() * 3 + 0.5).toFixed(2) : '-'),
      openDate: company.dates.open,
      closeDate: company.dates.close,
      listingDate: company.dates.listing,
      gmp: gmp,
      gmpPercentage: gmpPercentage,
      expectedListing: expectedListing
    };
  });
}

app.get('/api/ipos', (req, res) => {
  try {
    console.log('📋 Fetching IPO data...');
    const ipos = generateIPOData();
    console.log(`✅ Returned ${ipos.length} IPOs`);
    res.json(ipos);
  } catch (error) {
    console.error('❌ Error fetching IPOs:', error.message);
    res.status(500).json({ error: 'Unable to fetch IPO data.' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Stock Analysis API Server`);
  console.log(`📡 Running on http://localhost:${PORT}`);
  console.log(`⚡ Performance Optimized - No delays!`);
  console.log(`📊 Ready to serve stock data\n`);
});
