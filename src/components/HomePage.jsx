import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function HomePage() {
  const [nseStocks, setNseStocks] = useState([]);
  const [bseStocks, setBseStocks] = useState([]);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      // Fetch NSE and BSE stock lists
      const [nseResponse, bseResponse] = await Promise.all([
        axios.get('/api/stocks/default/NSE'),
        axios.get('/api/stocks/default/BSE')
      ]);

      setNseStocks(nseResponse.data);
      setBseStocks(bseResponse.data);

      // Fetch data for all stocks
      const allSymbols = [...nseResponse.data, ...bseResponse.data];
      const dataResponse = await axios.post('/api/stocks/batch', { symbols: allSymbols });
      
      const dataMap = {};
      dataResponse.data.forEach(item => {
        if (item.data) {
          dataMap[item.symbol] = item.data;
        }
      });
      setStockData(dataMap);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
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
    if (!value) return 'N/A';
    const crores = value / 10000000;
    return `₹${crores.toFixed(0)} Cr`;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const filterStocks = (stocks) => {
    if (!searchTerm) return stocks;
    return stocks.filter(symbol => 
      symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stockData[symbol]?.longName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderStockCard = (symbol, exchange) => {
    const data = stockData[symbol];
    if (!data) return null;

    return (
      <div
        key={symbol}
        onClick={() => handleStockClick(symbol)}
        className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition-all cursor-pointer border-l-4 border-indigo-500"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                exchange === 'NSE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {exchange}
              </span>
              <h3 className="text-lg font-bold text-gray-900">{symbol.replace(/\.(NS|BO)/, '')}</h3>
            </div>
            <p className="text-sm text-gray-600 line-clamp-1">{data.longName}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-gray-900">{formatPrice(data.regularMarketPrice)}</span>
            <span className={`text-sm font-semibold ${getChangeColor(data.regularMarketChange)}`}>
              {data.regularMarketChange > 0 ? '+' : ''}{data.regularMarketChangePercent?.toFixed(2)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <div>
              <p className="text-xs text-gray-500">Market Cap</p>
              <p className="text-sm font-semibold text-gray-800">{formatMarketCap(data.marketCap)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">P/E Ratio</p>
              <p className="text-sm font-semibold text-gray-800">{data.trailingPE?.toFixed(2) || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500">ROE</p>
              <p className="text-sm font-semibold text-gray-800">{data.returnOnEquity?.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Sector</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{data.sector}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredNSE = filterStocks(nseStocks);
  const filteredBSE = filterStocks(bseStocks);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Indian Stock Market</h1>
        <p className="text-indigo-100 text-lg">Explore NSE and BSE listed stocks with real-time data and fundamental analysis</p>
        
        <div className="mt-6">
          <input
            type="text"
            placeholder="Search stocks by symbol or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading stock data...</p>
        </div>
      ) : (
        <>
          {/* NSE Stocks */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">NSE Stocks</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {filteredNSE.length} {filteredNSE.length === 1 ? 'Stock' : 'Stocks'}
              </span>
            </div>
            
            {filteredNSE.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredNSE.map(symbol => renderStockCard(symbol, 'NSE'))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600">No NSE stocks found matching "{searchTerm}"</p>
              </div>
            )}
          </div>

          {/* BSE Stocks */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">BSE Stocks</h2>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                {filteredBSE.length} {filteredBSE.length === 1 ? 'Stock' : 'Stocks'}
              </span>
            </div>
            
            {filteredBSE.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredBSE.map(symbol => renderStockCard(symbol, 'BSE'))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600">No BSE stocks found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
