import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import StockChart from './StockChart'

export default function StockAnalysis() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const symbolFromUrl = queryParams.get('symbol');
  
  const [symbol, setSymbol] = useState('')
  const [period, setPeriod] = useState('1y')
  const [stockData, setStockData] = useState(null)
  const [historicalData, setHistoricalData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
  }, [symbolFromUrl]);

  const analyzeStockWithSymbol = async (stockSymbol) => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch stock quote
      const quoteRes = await axios.get(`/api/stock/${stockSymbol}`)
      setStockData(quoteRes.data)
      
      // Fetch historical data
      const histRes = await axios.get(`/api/stock/${stockSymbol}/history?period=${period}`)
      setHistoricalData(histRes.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch stock data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const analyzeStock = async () => {
    await analyzeStockWithSymbol(symbol);
  }

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A'
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
  }

  const formatPercent = (value) => {
    if (value === null || value === undefined) return 'N/A'
    return `${(value * 100).toFixed(2)}%`
  }

  const formatNumber = (value) => {
    if (value === null || value === undefined) return 'N/A'
    return value.toLocaleString('en-IN', { maximumFractionDigits: 2 })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📊 Individual Stock Analysis</h2>
      
      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Symbol
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., RELIANCE.NS"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: SYMBOL.NS for NSE, SYMBOL.BO for BSE
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="1mo">1 Month</option>
              <option value="3mo">3 Months</option>
              <option value="6mo">6 Months</option>
              <option value="1y">1 Year</option>
              <option value="2y">2 Years</option>
              <option value="5y">5 Years</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={analyzeStock}
              disabled={loading}
              className="w-full bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition disabled:bg-gray-400"
            >
              {loading ? 'Analyzing...' : 'Analyze Stock'}
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

      {/* Stock Data Display */}
      {stockData && (
        <div>
          {/* Company Info */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold mb-2">{stockData.longName || stockData.shortName}</h3>
            <p className="text-gray-600 mb-4">
              {stockData.sector && `Sector: ${stockData.sector}`}
              {stockData.industry && ` | Industry: ${stockData.industry}`}
            </p>
            
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Current Price</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(stockData.regularMarketPrice)}
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">P/E Ratio</p>
                <p className="text-2xl font-bold text-primary">
                  {stockData.trailingPE?.toFixed(2) || 'N/A'}
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Market Cap</p>
                <p className="text-2xl font-bold text-primary">
                  {stockData.marketCap ? `₹${(stockData.marketCap / 1e7).toFixed(0)}Cr` : 'N/A'}
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">P/B Ratio</p>
                <p className="text-2xl font-bold text-primary">
                  {stockData.priceToBook?.toFixed(2) || 'N/A'}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">ROE</p>
                <p className="text-2xl font-bold text-success">
                  {formatPercent(stockData.returnOnEquity)}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold text-success">
                  {formatPercent(stockData.profitMargins)}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Revenue Growth</p>
                <p className="text-2xl font-bold text-success">
                  {formatPercent(stockData.revenueGrowth)}
                </p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Debt/Equity</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatNumber(stockData.debtToEquity)}
                </p>
              </div>
            </div>
          </div>

          {/* Price Chart */}
          {historicalData && historicalData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Price History</h3>
              <StockChart data={historicalData} />
            </div>
          )}

          {/* Additional Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Additional Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-b pb-2">
                <span className="text-gray-600">52 Week High:</span>
                <span className="float-right font-semibold">{formatCurrency(stockData.fiftyTwoWeekHigh)}</span>
              </div>
              <div className="border-b pb-2">
                <span className="text-gray-600">52 Week Low:</span>
                <span className="float-right font-semibold">{formatCurrency(stockData.fiftyTwoWeekLow)}</span>
              </div>
              <div className="border-b pb-2">
                <span className="text-gray-600">Dividend Yield:</span>
                <span className="float-right font-semibold">{formatPercent(stockData.dividendYield)}</span>
              </div>
              <div className="border-b pb-2">
                <span className="text-gray-600">Earnings Growth:</span>
                <span className="float-right font-semibold">{formatPercent(stockData.earningsGrowth)}</span>
              </div>
              <div className="border-b pb-2">
                <span className="text-gray-600">Beta:</span>
                <span className="float-right font-semibold">{stockData.beta?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="border-b pb-2">
                <span className="text-gray-600">Average Volume:</span>
                <span className="float-right font-semibold">
                  {stockData.averageVolume?.toLocaleString('en-IN') || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
