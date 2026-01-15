import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WatchlistContext = createContext();

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within WatchlistProvider');
  }
  return context;
};

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (symbol) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
      toast.success(`${symbol} added to watchlist`, {
        icon: '⭐',
      });
      return true;
    }
    toast.error(`${symbol} is already in watchlist`);
    return false;
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
    toast.success(`${symbol} removed from watchlist`, {
      icon: '🗑️',
    });
  };

  const isInWatchlist = (symbol) => {
    return watchlist.includes(symbol);
  };

  return (
    <WatchlistContext.Provider value={{ 
      watchlist, 
      addToWatchlist, 
      removeFromWatchlist, 
      isInWatchlist 
    }}>
      {children}
    </WatchlistContext.Provider>
  );
};
