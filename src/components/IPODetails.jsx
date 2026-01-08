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
      case 'Upcoming': return 'bg-blue-100 text-blue-800';
      case 'Open': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">IPO Details</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'upcoming' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('current')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'current' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'closed' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Closed
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading IPO details...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredIPOs.map((ipo) => (
            <div key={ipo.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{ipo.companyName}</h3>
                  <p className="text-gray-600 mt-1">{ipo.industry}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(ipo.status)}`}>
                  {ipo.status}
                </span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Price Band</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(ipo.priceRangeMin)} - {formatCurrency(ipo.priceRangeMax)}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Issue Size</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(ipo.issueSize)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Lot Size</p>
                  <p className="text-lg font-bold text-gray-900">{ipo.lotSize} shares</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Subscription</p>
                  <p className="text-lg font-bold text-gray-900">{ipo.subscription}x</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 border-t pt-4">
                <div>
                  <p className="text-sm text-gray-600">Open Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(ipo.openDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Close Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(ipo.closeDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Listing Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(ipo.listingDate)}</p>
                </div>
              </div>

              {ipo.gmp && (
                <div className="mt-4 bg-indigo-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Grey Market Premium (GMP)</span>
                    <span className="text-lg font-bold text-indigo-600">
                      {formatCurrency(ipo.gmp)} ({ipo.gmpPercentage}%)
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Expected Listing Price: {formatCurrency(ipo.expectedListing)}
                  </p>
                </div>
              )}
            </div>
          ))}

          {filteredIPOs.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No IPOs found for this filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
