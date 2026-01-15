import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import axios from 'axios';
import PullToRefresh from './PullToRefresh';
import toast from 'react-hot-toast';

// Skeleton loader component
const StockCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
    <div className="grid grid-cols-2 gap-2">
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
    </div>
  </div>
);

export default function HomePage() {
  const [nseStocks, setNseStocks] = useState([]);
  const [bseStocks, setBseStocks] = useState([]);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMoreNSE, setLoadingMoreNSE] = useState(false);
  const [loadingMoreBSE, setLoadingMoreBSE] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('NSE');
  const [nseDisplayCount, setNseDisplayCount] = useState(12);
  const [bseDisplayCount, setBseDisplayCount] = useState(12);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  // Scroll to top handler
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchStockLists = useCallback(async () => {
    setLoading(true);
    try {
      const [nseResponse, bseResponse] = await Promise.all([
        axios.get('/api/stocks/default/NSE'),
        axios.get('/api/stocks/default/BSE')
      ]);

      setNseStocks(nseResponse.data);
      setBseStocks(bseResponse.data);
    } catch (error) {
      console.error('Error fetching stock lists:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStockData = useCallback(async (symbols) => {
    if (symbols.length === 0) return;
    
    try {
      const dataResponse = await axios.post('/api/stocks/batch', { symbols });
      const dataMap = { ...stockData };
      
      dataResponse.data.forEach(item => {
        if (item.data) {
          dataMap[item.symbol] = item.data;
        }
      });
      
      setStockData(dataMap);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  }, [stockData]);

  const fetchInitialStockData = useCallback(async () => {
    const nseSymbols = nseStocks.slice(0, nseDisplayCount);
    const bseSymbols = bseStocks.slice(0, bseDisplayCount);
    const initialSymbols = [...nseSymbols, ...bseSymbols];
    await fetchStockData(initialSymbols);
  }, [nseStocks, bseStocks, nseDisplayCount, bseDisplayCount, fetchStockData]);

  const loadMoreNSE = async () => {
    setLoadingMoreNSE(true);
    const newDisplayCount = nseDisplayCount + 10;
    const newSymbols = nseStocks.slice(nseDisplayCount, newDisplayCount);
    
    await fetchStockData(newSymbols);
    setNseDisplayCount(newDisplayCount);
    setLoadingMoreNSE(false);
  };

  const loadMoreBSE = async () => {
    setLoadingMoreBSE(true);
    const newDisplayCount = bseDisplayCount + 10;
    const newSymbols = bseStocks.slice(bseDisplayCount, newDisplayCount);
    
    await fetchStockData(newSymbols);
    setBseDisplayCount(newDisplayCount);
    setLoadingMoreBSE(false);
  };

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
    if (value == null || value === undefined) return 'N/A';
    const crores = value / 10000000;
    return `₹${crores.toFixed(0)} Cr`;
  };

  const toggleWatchlist = (e, symbol) => {
    e.stopPropagation();
    if (isInWatchlist(symbol)) {
      removeFromWatchlist(symbol);
    } else {
      addToWatchlist(symbol);
    }
  };

  const filterStocks = (stocks) => {
    if (!searchTerm) return stocks;
    return stocks.filter(symbol => 
      symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stockData[symbol]?.longName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Load stock lists on mount
  useEffect(() => {
    fetchStockLists();
  }, [fetchStockLists]);

  // Load initial stock data when lists are available
  useEffect(() => {
    if (nseStocks.length > 0 || bseStocks.length > 0) {
      fetchInitialStockData();
    }
  }, [nseStocks, bseStocks, fetchInitialStockData]);

  const renderStockCard = (symbol, exchange) => {
    const data = stockData[symbol];
    if (!data) return null;
    const inWatchlist = isInWatchlist(symbol);

    return (
      <div
        key={symbol}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 group transform hover:-translate-y-2 hover:scale-[1.02] cursor-pointer relative overflow-hidden"
      >
        {/* Animated gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
        
        {/* Price change indicator badge */}
        <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16 rotate-45 transition-all duration-300 ${
          data.regularMarketChange > 0 
            ? 'bg-gradient-to-br from-green-400/20 to-green-600/20 group-hover:from-green-400/30 group-hover:to-green-600/30' 
            : 'bg-gradient-to-br from-red-400/20 to-red-600/20 group-hover:from-red-400/30 group-hover:to-red-600/30'
        }`}></div>
        
        <div className="p-4 md:p-5 relative z-10">
          <div className="flex justify-between items-start mb-3">
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => handleStockClick(symbol)}
            >
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  exchange === 'NSE' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                }`}>
                  {exchange}
                </span>
                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                  {symbol.replace(/\.(NS|BO)/, '')}
                </h3>
              </div>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{data.longName}</p>
            </div>
            <button
              onClick={(e) => toggleWatchlist(e, symbol)}
              className={`ml-2 flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
                inWatchlist 
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 hover:text-yellow-600 dark:hover:text-yellow-400'
              }`}
              title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill={inWatchlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-xs font-medium hidden sm:inline">
                {inWatchlist ? 'Saved' : 'Save'}
              </span>
            </button>
          </div>

          <div 
            className="space-y-3 cursor-pointer"
            onClick={() => handleStockClick(symbol)}
          >
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {formatPrice(data.regularMarketPrice)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Current Price</span>
              </div>
              <div className={`flex flex-col items-end`}>
                <span className={`text-base md:text-lg font-bold px-3 py-1.5 rounded-lg ${
                  data.regularMarketChange > 0 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                } flex items-center gap-1 animate-pulse`}>
                  {data.regularMarketChange > 0 ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  )}
                  {data.regularMarketChange > 0 ? '+' : ''}{data.regularMarketChangePercent?.toFixed(2)}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Today&apos;s Change</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t-2 border-gray-100 dark:border-gray-700">
              <div className="group/metric hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2.5 rounded-lg transition-all duration-200 cursor-help" title="Total market value of the company">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Market Cap</p>
                </div>
                <p className="text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 group-hover/metric:text-blue-600 dark:group-hover/metric:text-blue-400 transition-colors">
                  {formatMarketCap(data.marketCap)}
                </p>
              </div>
              <div className="group/metric hover:bg-purple-50 dark:hover:bg-purple-900/20 p-2.5 rounded-lg transition-all duration-200 cursor-help" title="Price to Earnings ratio">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                  </svg>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">P/E Ratio</p>
                </div>
                <p className="text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 group-hover/metric:text-purple-600 dark:group-hover/metric:text-purple-400 transition-colors">
                  {data.trailingPE != null ? data.trailingPE.toFixed(2) : 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="group/metric hover:bg-green-50 dark:hover:bg-green-900/20 p-2.5 rounded-lg transition-all duration-200 cursor-help" title="Return on Equity - profitability metric">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">ROE</p>
                </div>
                <p className="text-sm md:text-base font-bold text-green-600 dark:text-green-400 group-hover/metric:scale-110 transition-transform">
                  {data.returnOnEquity != null ? 
                    (data.returnOnEquity > 1 ? `${data.returnOnEquity.toFixed(2)}%` : `${(data.returnOnEquity * 100).toFixed(2)}%`) 
                    : 'N/A'
                  }
                </p>
              </div>
              <div className="group/metric hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2.5 rounded-lg transition-all duration-200 cursor-help" title="Trading volume in millions">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Volume</p>
                </div>
                <p className="text-sm md:text-base font-bold text-blue-600 dark:text-blue-400 group-hover/metric:scale-110 transition-transform">
                  {data.regularMarketVolume != null ? (data.regularMarketVolume / 1000000).toFixed(2) + 'M' : 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="group/metric hover:bg-orange-50 dark:hover:bg-orange-900/20 p-2.5 rounded-lg transition-all duration-200 cursor-help" title="Annual dividend yield">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Dividend</p>
                </div>
                <p className="text-sm md:text-base font-bold text-orange-600 dark:text-orange-400 group-hover/metric:scale-110 transition-transform">
                  {data.dividendYield != null ? 
                    (data.dividendYield > 1 ? `${data.dividendYield.toFixed(2)}%` : `${(data.dividendYield * 100).toFixed(2)}%`) 
                    : 'N/A'
                  }
                </p>
              </div>
              <div className="group/metric hover:bg-indigo-50 dark:hover:bg-indigo-900/20 p-2.5 rounded-lg transition-all duration-200 cursor-help" title="Industry sector">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Sector</p>
                </div>
                <p className="text-sm md:text-base font-bold text-indigo-600 dark:text-indigo-400 truncate group-hover/metric:scale-105 transition-transform">
                  {data.sector || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredNSE = filterStocks(nseStocks);
  const filteredBSE = filterStocks(bseStocks);

  const handleRefresh = async () => {
    await fetchStockLists();
    toast.success('Data refreshed!', { icon: '🔄' });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-4 md:space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 rounded-2xl p-6 md:p-10 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight">Market Explorer</h1>
          <p className="text-blue-200 dark:text-indigo-200 text-base md:text-xl font-medium">
            Real-time NSE & BSE Stock Intelligence with Advanced Fundamentals
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              <span className="text-sm md:text-base font-semibold">{Object.keys(stockData).length} Stocks Loaded</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>
              <span className="text-sm md:text-base font-semibold">Live Data Feed</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 mt-6 md:mt-8">
          <label className="block text-sm font-semibold text-blue-100 mb-2">Search Stocks</label>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by company name or symbol (e.g., TCS, Reliance, INFY.NS)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 md:py-4 rounded-xl text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-xl border border-white/20 font-medium"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <p className="text-center text-gray-600 dark:text-gray-400 mb-4">Loading stock data...</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <StockCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-3 md:hidden overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('NSE')}
              className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform ${
                activeTab === 'NSE'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              } flex items-center gap-2`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z" clipRule="evenodd"/>
              </svg>
              NSE ({filteredNSE.length})
            </button>
            <button
              onClick={() => setActiveTab('BSE')}
              className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform ${
                activeTab === 'BSE'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              } flex items-center gap-2`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd"/>
              </svg>
              BSE ({filteredBSE.length})
            </button>
          </div>

          <div className={activeTab === 'NSE' || window.innerWidth >= 768 ? 'block' : 'hidden'}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">NSE Stocks</h2>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
                {filteredNSE.length} {filteredNSE.length === 1 ? 'Stock' : 'Stocks'}
              </span>
            </div>
            
            {filteredNSE.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {filteredNSE.map(symbol => renderStockCard(symbol, 'NSE'))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">No NSE stocks found matching &quot;{searchTerm}&quot;</p>
              </div>
            )}

            {/* Load More NSE Button */}
            {!searchTerm && nseDisplayCount < nseStocks.length && (activeTab === 'NSE' || window.innerWidth >= 768) && (
              <div className="text-center py-6 mt-6">
                <button
                  onClick={loadMoreNSE}
                  disabled={loadingMoreNSE}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center gap-3"
                >
                  {loadingMoreNSE ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading NSE Stocks...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                      </svg>
                      <span>Load More NSE ({nseStocks.length - nseDisplayCount} remaining)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {loadingMoreNSE && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                {[...Array(10)].map((_, i) => (
                  <StockCardSkeleton key={i} />
                ))}
              </div>
            )}
          </div>

          <div className={activeTab === 'BSE' || window.innerWidth >= 768 ? 'block' : 'hidden'}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">BSE Stocks</h2>
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-semibold">
                {filteredBSE.length} {filteredBSE.length === 1 ? 'Stock' : 'Stocks'}
              </span>
            </div>
            
            {filteredBSE.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {filteredBSE.map(symbol => renderStockCard(symbol, 'BSE'))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">No BSE stocks found matching &quot;{searchTerm}&quot;</p>
              </div>
            )}

            {/* Load More BSE Button */}
            {!searchTerm && bseDisplayCount < bseStocks.length && (
              <div className="text-center py-6 mt-6">
                <button
                  onClick={loadMoreBSE}
                  disabled={loadingMoreBSE}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center gap-3"
                >
                  {loadingMoreBSE ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading BSE Stocks...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                      </svg>
                      <span>Load More BSE ({bseStocks.length - bseDisplayCount} remaining)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {loadingMoreBSE && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                {[...Array(10)].map((_, i) => (
                  <StockCardSkeleton key={i} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 z-50 animate-bounce"
          title="Scroll to top"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
          </svg>
        </button>
      )}
      </div>
    </PullToRefresh>
  );
}
