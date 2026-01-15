import { useState, useEffect } from 'react'
import axios from 'axios'

export default function StockScreener() {
  const [markets, setMarkets] = useState([])
  const [market, setMarket] = useState('NSE')
  const [criteria, setCriteria] = useState({
    peMin: 5,
    peMax: 30,
    pbMax: 5,
    roeMin: 15,
    debtMax: 1.5,
    profitMarginMin: 10,
    revenueGrowthMin: 10
  })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch available markets on mount
  useEffect(() => {
    const loadMarkets = async () => {
      try {
        const response = await axios.get('/api/markets');
        setMarkets(response.data);
        if (response.data.length > 0) {
          setMarket(response.data[0].code);
        }
      } catch (err) {
        console.error('Failed to load markets:', err);
        setMarkets([{ code: 'NSE', name: 'National Stock Exchange' }, { code: 'BSE', name: 'Bombay Stock Exchange' }]);
      }
    };
    loadMarkets();
  }, []);

  const handleCriteriaChange = (field, value) => {
    setCriteria(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  const screenStocks = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await axios.post('/api/stocks/screen', { market, criteria })
      setResults(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to screen stocks')
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
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white">🔍 Stock Screener</h2>
      
      {/* Criteria Input */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Screening Criteria</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Min P/E Ratio
            </label>
            <input
              type="number"
              value={criteria.peMin}
              onChange={(e) => handleCriteriaChange('peMin', e.target.value)}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max P/E Ratio
            </label>
            <input
              type="number"
              value={criteria.peMax}
              onChange={(e) => handleCriteriaChange('peMax', e.target.value)}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Min ROE (%)
            </label>
            <input
              type="number"
              value={criteria.roeMin}
              onChange={(e) => handleCriteriaChange('roeMin', e.target.value)}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max P/B Ratio
            </label>
            <input
              type="number"
              value={criteria.pbMax}
              onChange={(e) => handleCriteriaChange('pbMax', e.target.value)}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Debt/Equity
            </label>
            <input
              type="number"
              step="0.1"
              value={criteria.debtMax}
              onChange={(e) => handleCriteriaChange('debtMax', e.target.value)}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Min Profit Margin (%)
            </label>
            <input
              type="number"
              value={criteria.profitMarginMin}
              onChange={(e) => handleCriteriaChange('profitMarginMin', e.target.value)}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <select
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            className="px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary"
          >
            {markets.map(m => (
              <option key={m.code} value={m.code}>{m.name}</option>
            ))}
          </select>
          
          <button
            onClick={screenStocks}
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition disabled:bg-gray-400"
          >
            {loading ? 'Screening...' : 'Screen Stocks'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Found {results.length} stocks matching criteria
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Symbol</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Company</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Price</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">P/E</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ROE %</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">P/B</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">D/E</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {results.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap font-medium text-primary dark:text-blue-400 text-sm">{stock.symbol}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white text-sm">{stock.data?.longName || stock.symbol}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white text-sm">{formatCurrency(stock.data?.regularMarketPrice)}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white text-sm">{stock.data?.trailingPE?.toFixed(2) || 'N/A'}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white text-sm">{stock.data?.returnOnEquity ? (stock.data.returnOnEquity * 100).toFixed(2) : 'N/A'}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white text-sm">{stock.data?.priceToBook?.toFixed(2) || 'N/A'}</td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white text-sm">{stock.data?.debtToEquity?.toFixed(2) || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <div className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg text-center">
          No stocks screened yet. Adjust criteria and click &quot;Screen Stocks&quot;
        </div>
      )}
    </div>
  )
}
