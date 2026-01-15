import { useState, useEffect } from 'react';
import axios from 'axios';

export default function IPODetails() {
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, current, closed

  useEffect(() => {
    fetchIPOs();
  }, []);

  const fetchIPOs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/ipos');
      setIpos(response.data);
    } catch (error) {
      console.error('Error fetching IPOs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Upcoming': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'Open': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'Closed': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    
    // Format for issue size (in Crores)
    if (value >= 10000000) {
      const crores = value / 10000000;
      return `₹${crores.toFixed(2)} Cr`;
    }
    // Format for smaller amounts (in Lakhs)
    else if (value >= 100000) {
      const lakhs = value / 100000;
      return `₹${lakhs.toFixed(2)} L`;
    }
    // Format for price band
    else {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(value);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredIPOs = ipos.filter(ipo => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ipo.status === 'Upcoming';
    if (filter === 'current') return ipo.status === 'Open';
    if (filter === 'closed') return ipo.status === 'Closed';
    return true;
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">IPO Details</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${
              filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${
              filter === 'upcoming' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('current')}
            className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${
              filter === 'current' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${
              filter === 'closed' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Closed
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 dark:border-indigo-400 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading IPO details...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6">
          {filteredIPOs.map((ipo) => (
            <div key={ipo.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{ipo.companyName}</h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">{ipo.industry}</p>
                </div>
                <span className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap ${getStatusColor(ipo.status)}`}>
                  {ipo.status}
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 md:p-4 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Price Band</p>
                  <p className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(ipo.priceRangeMin)} - {formatCurrency(ipo.priceRangeMax)}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 md:p-4 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Issue Size</p>
                  <p className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(ipo.issueSize)}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 md:p-4 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Lot Size</p>
                  <p className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">{ipo.lotSize} shares</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 md:p-4 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Subscription</p>
                  <p className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">{ipo.subscription}x</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 border-t dark:border-gray-700 pt-4">
                <div>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Open Date</p>
                  <p className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">{formatDate(ipo.openDate)}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Close Date</p>
                  <p className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">{formatDate(ipo.closeDate)}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Listing Date</p>
                  <p className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">{formatDate(ipo.listingDate)}</p>
                </div>
              </div>

              {ipo.gmp && (
                <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/30 p-3 md:p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">Grey Market Premium (GMP)</span>
                    <span className="text-base md:text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(ipo.gmp)} ({ipo.gmpPercentage}%)
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Expected Listing Price: {formatCurrency(ipo.expectedListing)}
                  </p>
                </div>
              )}
            </div>
          ))}

          {filteredIPOs.length === 0 && (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">No IPOs found for this filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
