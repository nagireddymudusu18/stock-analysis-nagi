import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useWatchlist } from '../context/WatchlistContext'
import axios from 'axios'
import StockChart from './StockChart'

// Skeleton loader for stock data
const StockDataSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
    </div>
  </div>
);

export default function StockAnalysis() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const symbolFromUrl = queryParams.get('symbol');
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  
  const [symbol, setSymbol] = useState('')
  const [period, setPeriod] = useState('1y')
  const [stockData, setStockData] = useState(null)
  const [historicalData, setHistoricalData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyzeStockWithSymbol = useCallback(async (stockSymbol) => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch both in parallel for faster loading
      const [quoteRes, histRes] = await Promise.all([
        axios.get(`/api/stock/${stockSymbol}`),
        axios.get(`/api/stock/${stockSymbol}/history?period=${period}`)
      ]);
      
      setStockData(quoteRes.data)
      setHistoricalData(histRes.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch stock data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [period])

  // Fetch default symbol on mount if no URL parameter
  useEffect(() => {
    const loadDefaultSymbol = async () => {
      if (!symbolFromUrl) {
        try {
          const response = await axios.get('/api/stocks/default/NSE');
          if (response.data && response.data.length > 0) {
            setSymbol(response.data[0]);
          }
        } catch (err) {
          console.error('Failed to load default symbol:', err);
          setSymbol('RELIANCE.NS'); // Fallback
        }
      } else {
        setSymbol(symbolFromUrl);
        analyzeStockWithSymbol(symbolFromUrl);
      }
    };
    loadDefaultSymbol();
  }, [symbolFromUrl, analyzeStockWithSymbol]);

  const analyzeStock = async () => {
    await analyzeStockWithSymbol(symbol);
  }

  const formatCurrency = (value) => {
    if (value == null) return 'N/A'
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
  }

  const formatPercent = (value) => {
    if (value == null) return 'N/A'
    // Handle both decimal (0.15) and percentage (15) formats
    const percentValue = value > 1 ? value : value * 100;
    return `${percentValue.toFixed(2)}%`
  }

  const formatNumber = (value) => {
    if (value == null) return 'N/A'
    return value.toLocaleString('en-IN', { maximumFractionDigits: 2 })
  }

  const toggleWatchlist = () => {
    if (isInWatchlist(symbol)) {
      removeFromWatchlist(symbol);
    } else {
      addToWatchlist(symbol);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Deep Stock Analysis</h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">Comprehensive fundamental & technical insights</p>
        </div>
      </div>
      
      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-5 md:p-7 mb-6 md:mb-8 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Stock Symbol
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., RELIANCE.NS, TCS.BO"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
              Format: SYMBOL.NS (NSE) or SYMBOL.BO (BSE)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Analysis Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition"
            >
              <option value="1mo">Last Month</option>
              <option value="3mo">Last 3 Months</option>
              <option value="6mo">Last 6 Months</option>
              <option value="1y">1 Year</option>
              <option value="2y">2 Years</option>
              <option value="5y">5 Years</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={analyzeStock}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Run Analysis'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && <StockDataSkeleton />}

      {/* Stock Data Display */}
      {!loading && stockData && (
        <div>
          {/* Company Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {stockData.longName || stockData.shortName}
                </h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-2">
                  {stockData.sector && `Sector: ${stockData.sector}`}
                  {stockData.industry && ` | Industry: ${stockData.industry}`}
                </p>
              </div>
              <button
                onClick={toggleWatchlist}
                className={`ml-4 p-2 rounded-lg transition-colors ${
                  isInWatchlist(symbol)
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-yellow-100 dark:hover:bg-yellow-900'
                }`}
                title={isInWatchlist(symbol) ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                <svg className="w-6 h-6" fill={isInWatchlist(symbol) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </div>
            
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 md:p-4 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Current Price</p>
                <p className="text-lg md:text-2xl font-bold text-primary dark:text-blue-400">
                  {formatCurrency(stockData.regularMarketPrice)}
                </p>
                <p className={`text-xs mt-1 ${stockData.regularMarketChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stockData.regularMarketChange >= 0 ? '+' : ''}{stockData.regularMarketChangePercent?.toFixed(2)}%
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 md:p-4 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">52W High/Low</p>
                <p className="text-sm md:text-lg font-bold text-primary dark:text-blue-400">
                  {formatCurrency(stockData.fiftyTwoWeekHigh)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatCurrency(stockData.fiftyTwoWeekLow)}
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 md:p-4 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Volume</p>
                <p className="text-lg md:text-2xl font-bold text-primary dark:text-blue-400">
                  {stockData.regularMarketVolume != null ? (stockData.regularMarketVolume / 1000000).toFixed(2) + 'M' : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Avg: {stockData.averageVolume != null ? (stockData.averageVolume / 1000000).toFixed(2) + 'M' : 'N/A'}
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 md:p-4 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Dividend Yield</p>
                <p className="text-lg md:text-2xl font-bold text-primary dark:text-blue-400">
                  {formatPercent(stockData.dividendYield)}
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 md:p-4 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">P/E Ratio</p>
                <p className="text-lg md:text-2xl font-bold text-primary dark:text-blue-400">
                  {stockData.trailingPE != null ? stockData.trailingPE.toFixed(2) : 'N/A'}
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 md:p-4 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Market Cap</p>
                <p className="text-lg md:text-2xl font-bold text-primary dark:text-blue-400">
                  {stockData.marketCap != null ? `₹${(stockData.marketCap / 1e7).toFixed(0)}Cr` : 'N/A'}
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 md:p-4 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">P/B Ratio</p>
                <p className="text-lg md:text-2xl font-bold text-primary dark:text-blue-400">
                  {stockData.priceToBook != null ? stockData.priceToBook.toFixed(2) : 'N/A'}
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 md:p-4 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">EPS (TTM)</p>
                <p className="text-lg md:text-2xl font-bold text-primary dark:text-blue-400">
                  {formatCurrency(stockData.epsTrailingTwelveMonths)}
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/30 p-3 md:p-4 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">ROE</p>
                <p className="text-lg md:text-2xl font-bold text-success dark:text-green-400">
                  {formatPercent(stockData.returnOnEquity)}
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/30 p-3 md:p-4 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Profit Margin</p>
                <p className="text-lg md:text-2xl font-bold text-success dark:text-green-400">
                  {formatPercent(stockData.profitMargins)}
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/30 p-3 md:p-4 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Revenue Growth</p>
                <p className="text-lg md:text-2xl font-bold text-success dark:text-green-400">
                  {formatPercent(stockData.revenueGrowth)}
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/30 p-3 md:p-4 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Earnings Growth</p>
                <p className="text-lg md:text-2xl font-bold text-success dark:text-green-400">
                  {formatPercent(stockData.earningsGrowth)}
                </p>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/30 p-3 md:p-4 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Debt/Equity</p>
                <p className="text-lg md:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatNumber(stockData.debtToEquity)}
                </p>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/30 p-3 md:p-4 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Current Ratio</p>
                <p className="text-lg md:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatNumber(stockData.currentRatio)}
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/30 p-3 md:p-4 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Beta</p>
                <p className="text-lg md:text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatNumber(stockData.beta)}
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/30 p-3 md:p-4 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Book Value</p>
                <p className="text-lg md:text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(stockData.bookValue)}
                </p>
              </div>
            </div>
          </div>

          {/* Price Chart */}
          {historicalData && historicalData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-bold mb-4 text-gray-900 dark:text-white">Price History</h3>
              <div className="overflow-x-auto">
                <StockChart data={historicalData} />
              </div>
            </div>
          )}

          {/* Additional Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold mb-4 text-gray-900 dark:text-white">Additional Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="border-b dark:border-gray-700 pb-2">
                <span className="text-sm md:text-base text-gray-600 dark:text-gray-400">52 Week High:</span>
                <span className="float-right font-semibold text-gray-900 dark:text-white">{formatCurrency(stockData.fiftyTwoWeekHigh)}</span>
              </div>
              <div className="border-b dark:border-gray-700 pb-2">
                <span className="text-sm md:text-base text-gray-600 dark:text-gray-400">52 Week Low:</span>
                <span className="float-right font-semibold text-gray-900 dark:text-white">{formatCurrency(stockData.fiftyTwoWeekLow)}</span>
              </div>
              <div className="border-b dark:border-gray-700 pb-2">
                <span className="text-sm md:text-base text-gray-600 dark:text-gray-400">Dividend Yield:</span>
                <span className="float-right font-semibold text-gray-900 dark:text-white">{formatPercent(stockData.dividendYield)}</span>
              </div>
              <div className="border-b dark:border-gray-700 pb-2">
                <span className="text-sm md:text-base text-gray-600 dark:text-gray-400">Earnings Growth:</span>
                <span className="float-right font-semibold text-gray-900 dark:text-white">{formatPercent(stockData.earningsGrowth)}</span>
              </div>
              <div className="border-b dark:border-gray-700 pb-2">
                <span className="text-sm md:text-base text-gray-600 dark:text-gray-400">Beta:</span>
                <span className="float-right font-semibold text-gray-900 dark:text-white">{stockData.beta != null ? stockData.beta.toFixed(2) : 'N/A'}</span>
              </div>
              <div className="border-b dark:border-gray-700 pb-2">
                <span className="text-sm md:text-base text-gray-600 dark:text-gray-400">Average Volume:</span>
                <span className="float-right font-semibold text-gray-900 dark:text-white">
                  {stockData.averageVolume != null ? stockData.averageVolume.toLocaleString('en-IN') : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
