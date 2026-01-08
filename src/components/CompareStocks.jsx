import { useState, useEffect } from 'react'
import axios from 'axios'
import StockChart from './StockChart'

export default function CompareStocks() {
  const [symbols, setSymbols] = useState('')
  const [period, setPeriod] = useState('1y')
  const [compareData, setCompareData] = useState([])
  const [historicalData, setHistoricalData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch default symbols on mount
  useEffect(() => {
    const loadDefaultSymbols = async () => {
      try {
        const response = await axios.get('/api/stocks/default/NSE');
        if (response.data && response.data.length >= 3) {
          setSymbols(response.data.slice(0, 3).join('\n'));
        }
      } catch (err) {
        console.error('Failed to load default symbols:', err);
        setSymbols('RELIANCE.NS\nTCS.NS\nINFY.NS'); // Fallback
      }
    };
    loadDefaultSymbols();
  }, []);

  const compareStocks = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const symbolList = symbols.split('\n').map(s => s.trim()).filter(s => s)
      
      if (symbolList.length < 2) {
        setError('Please enter at least 2 stock symbols')
        setLoading(false)
        return
      }
      
      // Fetch quotes for all stocks
      const batchRes = await axios.post('/api/stocks/batch', { symbols: symbolList })
      
      const comparison = batchRes.data
        .filter(item => item.data && !item.error)
        .map(item => ({
          symbol: item.symbol,
          company: item.data.longName || item.data.shortName,
          price: item.data.regularMarketPrice,
          peRatio: item.data.trailingPE,
          pbRatio: item.data.priceToBook,
          roe: (item.data.returnOnEquity || 0) * 100,
          profitMargin: (item.data.profitMargins || 0) * 100,
          debtToEquity: (item.data.debtToEquity || 0) / 100
        }))
      
      setCompareData(comparison)
      
      // Fetch historical data for charts
      const histData = {}
      for (const symbol of symbolList) {
        try {
          const res = await axios.get(`/api/stock/${symbol}/history?period=${period}`)
          histData[symbol] = res.data
        } catch (err) {
          console.error(`Error fetching history for ${symbol}:`, err)
        }
      }
      setHistoricalData(histData)
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to compare stocks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    if (!value) return 'N/A'
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">⚖️ Compare Multiple Stocks</h2>
      
      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Symbols (one per line)
            </label>
            <textarea
              value={symbols}
              onChange={(e) => setSymbols(e.target.value)}
              rows="5"
              placeholder="RELIANCE.NS&#10;TCS.NS&#10;INFY.NS"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary mb-4"
            >
              <option value="1mo">1 Month</option>
              <option value="3mo">3 Months</option>
              <option value="6mo">6 Months</option>
              <option value="1y">1 Year</option>
              <option value="2y">2 Years</option>
            </select>
            
            <button
              onClick={compareStocks}
              disabled={loading}
              className="w-full bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition disabled:bg-gray-400"
            >
              {loading ? 'Comparing...' : 'Compare Stocks'}
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

      {/* Comparison Table */}
      {compareData.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Fundamental Comparison</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">P/E Ratio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">P/B Ratio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROE %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Debt/Equity</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {compareData.map((stock) => (
                    <tr key={stock.symbol} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-primary">{stock.symbol}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{stock.company}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(stock.price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{stock.peRatio?.toFixed(2) || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{stock.pbRatio?.toFixed(2) || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{stock.roe.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{stock.profitMargin.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{stock.debtToEquity.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price Performance Chart */}
          {Object.keys(historicalData).length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Price Performance Comparison</h3>
              <p className="text-sm text-gray-600 mb-4">Normalized to show % change from start of period</p>
              
              {/* Note: For simplicity, showing first stock's chart. 
                  In production, you'd overlay multiple lines */}
              {Object.entries(historicalData).map(([symbol, data]) => (
                data && data.length > 0 && (
                  <div key={symbol} className="mb-6">
                    <h4 className="font-medium mb-2">{symbol}</h4>
                    <StockChart data={data} />
                  </div>
                )
              ))}
            </div>
          )}
        </>
      )}

      {!loading && compareData.length === 0 && !error && (
        <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg text-center">
          Enter stock symbols and click "Compare Stocks" to see the comparison
        </div>
      )}
    </div>
  )
}
