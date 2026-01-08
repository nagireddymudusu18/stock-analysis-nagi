import { useState, useEffect } from 'react'
import axios from 'axios'

export default function TopStocks() {
  const [markets, setMarkets] = useState([])
  const [market, setMarket] = useState('NSE')
  const [topN, setTopN] = useState(10)
  const [stocks, setStocks] = useState([])
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

  const getTopStocks = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Get default stocks for the market
      const symbolsRes = await axios.get(`/api/stocks/default/${market}`)
      const symbols = symbolsRes.data.slice(0, topN)
      
      // Fetch data for all stocks
      const batchRes = await axios.post('/api/stocks/batch', { symbols })
      
      // Calculate composite scores
      const scoredStocks = batchRes.data
        .filter(item => item.data && !item.error)
        .map(item => {
          const stock = item.data
          let score = 0
          
          // Score based on multiple factors
          if (stock.trailingPE > 0) score += (1 / stock.trailingPE) * 100
          if (stock.returnOnEquity) score += stock.returnOnEquity * 100
          if (stock.profitMargins) score += stock.profitMargins * 100
          if (stock.revenueGrowth) score += stock.revenueGrowth * 50
          if (stock.debtToEquity) score += Math.max(0, 10 - (stock.debtToEquity / 100) * 5)
          
          return {
            symbol: item.symbol,
            company: stock.longName || stock.shortName,
            price: stock.regularMarketPrice,
            peRatio: stock.trailingPE,
            roe: (stock.returnOnEquity || 0) * 100,
            profitMargin: (stock.profitMargins || 0) * 100,
            revenueGrowth: (stock.revenueGrowth || 0) * 100,
            score: score.toFixed(2)
          }
        })
        .sort((a, b) => b.score - a.score)
      
      setStocks(scoredStocks)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch top stocks')
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
      <h2 className="text-2xl font-bold mb-6">🏆 Top Stocks by Fundamentals</h2>
      
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Market
            </label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              {markets.map(m => (
                <option key={m.code} value={m.code}>{m.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Stocks
            </label>
            <input
              type="number"
              min="5"
              max="50"
              value={topN}
              onChange={(e) => setTopN(parseInt(e.target.value) || 10)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={getTopStocks}
              disabled={loading}
              className="w-full bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition disabled:bg-gray-400"
            >
              {loading ? 'Analyzing...' : 'Get Top Stocks'}
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

      {/* Results */}
      {stocks.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            Top {stocks.length} Stocks by Composite Score
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">P/E</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROE %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Growth %</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stocks.map((stock, index) => (
                  <tr key={stock.symbol} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-300 text-gray-900' :
                        index === 2 ? 'bg-orange-400 text-orange-900' :
                        'bg-blue-100 text-blue-900'
                      } font-bold`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-primary">{stock.symbol}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{stock.company}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-success">{stock.score}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(stock.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{stock.peRatio?.toFixed(2) || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{stock.roe.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{stock.profitMargin.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{stock.revenueGrowth.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && stocks.length === 0 && !error && (
        <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg text-center">
          Click "Get Top Stocks" to analyze and rank stocks
        </div>
      )}
    </div>
  )
}
