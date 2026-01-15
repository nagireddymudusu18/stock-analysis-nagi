import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import axios from 'axios';

export default function Watchlist() {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchWatchlistData = useCallback(async () => {
    if (watchlist.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/stocks/batch', { symbols: watchlist });
      const dataMap = {};
      response.data.forEach(item => {
        if (item.data) {
          dataMap[item.symbol] = item.data;
        }
      });
      setStockData(dataMap);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  }, [watchlist]);

  const handleStockClick = (symbol) => {
    navigate(`/analysis?symbol=${symbol}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatMarketCap = (value) => {
    if (!value) return 'N/A';
    const crores = value / 10000000;
    return `₹${crores.toFixed(0)} Cr`;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  // Fetch watchlist data when component mounts or watchlist changes
  useEffect(() => {
    fetchWatchlistData();
  }, [fetchWatchlistData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">My Watchlist</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 md:p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your Watchlist is Empty</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start adding stocks to track their performance
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
          >
            Browse Stocks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          My Watchlist ({watchlist.length})
        </h2>
        <button
          onClick={fetchWatchlistData}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition flex items-center gap-2 justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {watchlist.map(symbol => {
          const data = stockData[symbol];
          if (!data) return null;

          return (
            <div
              key={symbol}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all border-l-4 border-indigo-500 dark:border-indigo-400"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 cursor-pointer" onClick={() => handleStockClick(symbol)}>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {symbol.replace(/\.(NS|BO)/, '')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{data.longName}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(symbol);
                    }}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition ml-2"
                    title="Remove from watchlist"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <div 
                  className="space-y-2 cursor-pointer"
                  onClick={() => handleStockClick(symbol)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(data.regularMarketPrice)}
                    </span>
                    <span className={`text-sm font-semibold ${getChangeColor(data.regularMarketChange)}`}>
                      {data.regularMarketChange > 0 ? '+' : ''}{data.regularMarketChangePercent?.toFixed(2)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Market Cap</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {formatMarketCap(data.marketCap)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">P/E Ratio</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {data.trailingPE?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
