import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

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

// Generate mock stock data
function generateMockStockData(symbol) {
  const basePrice = Math.random() * 2000 + 100;
  const sectors = ['Technology', 'Finance', 'Consumer Goods', 'Energy', 'Healthcare'];
  const fiftyTwoWeekHigh = basePrice * (1 + Math.random() * 0.3);
  const fiftyTwoWeekLow = basePrice * (1 - Math.random() * 0.3);
  
  return {
    symbol,
    regularMarketPrice: Number(basePrice.toFixed(2)),
    regularMarketChange: Number((Math.random() * 40 - 20).toFixed(2)),
    regularMarketChangePercent: Number((Math.random() * 4 - 2).toFixed(2)),
    regularMarketVolume: Math.floor(Math.random() * 10000000),
    trailingPE: Number((Math.random() * 30 + 10).toFixed(2)),
    priceToBook: Number((Math.random() * 5 + 1).toFixed(2)),
    returnOnEquity: Number((Math.random() * 0.30 + 0.05).toFixed(4)),
    profitMargins: Number((Math.random() * 0.25 + 0.05).toFixed(4)),
    revenueGrowth: Number((Math.random() * 0.30 + 0.05).toFixed(4)),
    debtToEquity: Number((Math.random() * 150).toFixed(2)),
    dividendYield: Number((Math.random() * 0.03).toFixed(4)),
    earningsGrowth: Number((Math.random() * 0.30 + 0.05).toFixed(4)),
    marketCap: Math.floor(Math.random() * 1000000000000),
    sector: sectors[Math.floor(Math.random() * sectors.length)],
    industry: 'Mock Industry',
    longName: symbol.replace(/\.(NS|BO)/, '') + ' Limited',
    shortName: symbol.replace(/\.(NS|BO)/, ''),
    fiftyTwoWeekHigh: Number(fiftyTwoWeekHigh.toFixed(2)),
    fiftyTwoWeekLow: Number(fiftyTwoWeekLow.toFixed(2)),
    beta: Number((Math.random() * 2 + 0.5).toFixed(2)),
    averageVolume: Math.floor(Math.random() * 5000000 + 1000000)
  };
}

// Generate historical data
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

// Routes
app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log(`📊 Fetching data for ${symbol}...`);
    
    const quote = generateMockStockData(symbol);
    console.log(`✅ Returned data for ${symbol}`);
    res.json(quote);
  } catch (error) {
    console.error(`❌ Error fetching ${symbol}:`, error.message);
    res.status(500).json({ error: 'Unable to fetch stock data.' });
  }
});

app.get('/api/stock/:symbol/history', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1y' } = req.query;
    console.log(`📈 Fetching history for ${symbol} - ${period}...`);
    
    let days = 365;
    switch(period) {
      case '1mo': days = 30; break;
      case '3mo': days = 90; break;
      case '6mo': days = 90; break;
      case '1y': days = 180; break;
      case '2y': days = 365; break;
      case '5y': days = 365; break;
      default: days = 180;
    }
    
    const result = generateHistoricalData(days);
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
    
    console.log(`📦 Fetching batch quotes for ${symbols.length} stocks...`);
    
    const quotes = symbols.map(symbol => {
      try {
        const quote = generateMockStockData(symbol);
        return { symbol, data: quote, error: null };
      } catch (e) {
        console.error(`❌ Error with ${symbol}:`, e.message);
        return { symbol, data: null, error: e.message };
      }
    });
    
    console.log(`✅ Returned ${quotes.length} stock quotes`);
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/stocks/screen', async (req, res) => {
  try {
    const { market = 'NSE', criteria = {} } = req.body;
    const symbols = await getStockList(market);
    
    console.log(`🔍 Screening ${symbols.length} ${market} stocks...`);
    
    const results = symbols.map(symbol => {
      try {
        const quote = generateMockStockData(symbol);
        return { symbol, data: quote };
      } catch (e) {
        console.error(`❌ Error screening ${symbol}:`, e.message);
        return null;
      }
    }).filter(result => {
      if (!result || !result.data) return false;
      
      const { data } = result;
      
      if (criteria.minPE && data.trailingPE < criteria.minPE) return false;
      if (criteria.maxPE && data.trailingPE > criteria.maxPE) return false;
      if (criteria.minROE && data.returnOnEquity < criteria.minROE) return false;
      if (criteria.minMarketCap && data.marketCap < criteria.minMarketCap) return false;
      if (criteria.maxDebtEquity && data.debtToEquity > criteria.maxDebtEquity) return false;
      if (criteria.minDividendYield && data.dividendYield < criteria.minDividendYield) return false;
      
      return true;
    });
    
    console.log(`✅ Screened ${results.length}/${symbols.length} stocks`);
    res.json(results);
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

// Generate mock IPO data
function generateIPOData() {
  const companies = [
    { name: 'TechVision India Ltd', industry: 'Information Technology' },
    { name: 'Green Energy Solutions', industry: 'Renewable Energy' },
    { name: 'MediCare Pharma Ltd', industry: 'Pharmaceuticals' },
    { name: 'AutoDrive Motors', industry: 'Automobile' },
    { name: 'FinTech Innovations', industry: 'Financial Services' },
    { name: 'EduLearn Technologies', industry: 'EdTech' },
    { name: 'FoodChain Logistics', industry: 'Supply Chain' },
    { name: 'SmartHome Devices', industry: 'Consumer Electronics' },
    { name: 'CloudNine Infrastructure', industry: 'Real Estate' },
    { name: 'BioGenix Therapeutics', industry: 'Biotechnology' },
    { name: 'AquaPure Water Solutions', industry: 'Utilities' },
    { name: 'SolarMax Energy Corp', industry: 'Renewable Energy' },
    { name: 'UrbanStyle Fashion', industry: 'Retail - Apparel' },
    { name: 'QuickBite Foods', industry: 'Food & Beverages' },
    { name: 'MegaMart Retail', industry: 'Retail - Supermarket' },
    { name: 'SecureNet Cyber Solutions', industry: 'Cybersecurity' },
    { name: 'HealthFirst Diagnostics', industry: 'Healthcare Services' },
    { name: 'ElectroTech Components', industry: 'Electronics Manufacturing' },
    { name: 'AgroVision Farming', industry: 'Agriculture Technology' },
    { name: 'LuxuryStay Hotels', industry: 'Hospitality' },
    { name: 'NextGen Semiconductors', industry: 'Semiconductors' },
    { name: 'DataStream Analytics', industry: 'Data Analytics' },
    { name: 'EcoPackaging Solutions', industry: 'Packaging' },
    { name: 'QuantumDrive EVs', industry: 'Electric Vehicles' },
    { name: 'MetroLink Transport', industry: 'Transportation' },
    { name: 'CraftBrew Beverages', industry: 'Beverages' },
    { name: 'SpaceAge Materials', industry: 'Advanced Materials' },
    { name: 'FinServe Banking Tech', industry: 'Banking Technology' },
    { name: 'HomeConnect IoT', industry: 'IoT Solutions' },
    { name: 'PharmaLife Generics', industry: 'Generic Pharmaceuticals' },
    { name: 'GlobalTrade Logistics', industry: 'Freight & Logistics' },
    { name: 'SkillUp Learning', industry: 'Online Education' },
    { name: 'FreshFarm Organics', industry: 'Organic Foods' },
    { name: 'TravelEase Services', industry: 'Travel & Tourism' },
    { name: 'InsureTech Solutions', industry: 'Insurance Technology' },
    { name: 'BuildRight Construction', industry: 'Construction' },
    { name: 'TextileMill Industries', industry: 'Textiles' },
    { name: 'PetCare Wellness', industry: 'Pet Products & Services' },
    { name: 'SportsFit Equipment', industry: 'Sporting Goods' },
    { name: 'WellnessHub Ayurveda', industry: 'Ayurveda & Wellness' }
  ];

  const statuses = ['Upcoming', 'Open', 'Closed'];
  const now = new Date();

  return companies.map((company, index) => {
    const status = statuses[index % 3];
    const priceMin = Math.floor(Math.random() * 500 + 100);
    const priceMax = priceMin + Math.floor(Math.random() * 200 + 50);
    const issueSize = Math.floor(Math.random() * 5000 + 1000) * 10000000;
    const lotSize = [10, 15, 20, 25, 30, 50, 75, 100][Math.floor(Math.random() * 8)];
    const gmp = Math.floor(Math.random() * 200 + 20);
    const gmpPercentage = ((gmp / priceMax) * 100).toFixed(2);

    let openDate = new Date(now);
    let closeDate = new Date(now);
    let listingDate = new Date(now);

    if (status === 'Upcoming') {
      openDate.setDate(now.getDate() + Math.floor(Math.random() * 30 + 5));
      closeDate = new Date(openDate);
      closeDate.setDate(openDate.getDate() + 3);
      listingDate = new Date(closeDate);
      listingDate.setDate(closeDate.getDate() + 7);
    } else if (status === 'Open') {
      openDate.setDate(now.getDate() - Math.floor(Math.random() * 2 + 1));
      closeDate.setDate(now.getDate() + Math.floor(Math.random() * 2 + 1));
      listingDate = new Date(closeDate);
      listingDate.setDate(closeDate.getDate() + 7);
    } else {
      openDate.setDate(now.getDate() - Math.floor(Math.random() * 30 + 10));
      closeDate = new Date(openDate);
      closeDate.setDate(openDate.getDate() + 3);
      listingDate = new Date(closeDate);
      listingDate.setDate(closeDate.getDate() + 7);
    }

    return {
      id: index + 1,
      companyName: company.name,
      industry: company.industry,
      status,
      priceRangeMin: priceMin,
      priceRangeMax: priceMax,
      issueSize,
      lotSize,
      subscription: status === 'Closed' ? (Math.random() * 100 + 20).toFixed(2) : 
                    status === 'Open' ? (Math.random() * 10 + 1).toFixed(2) : '-',
      openDate: openDate.toISOString(),
      closeDate: closeDate.toISOString(),
      listingDate: listingDate.toISOString(),
      gmp: status !== 'Upcoming' ? gmp : null,
      gmpPercentage: status !== 'Upcoming' ? gmpPercentage : null,
      expectedListing: status !== 'Upcoming' ? priceMax + gmp : null
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
