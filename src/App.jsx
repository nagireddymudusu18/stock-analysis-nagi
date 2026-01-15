import { useState, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { WatchlistProvider } from './context/WatchlistContext'
import ErrorBoundary from './components/ErrorBoundary'
import GlobalSearch from './components/GlobalSearch'

// Lazy load route components for code splitting
const HomePage = lazy(() => import('./components/HomePage'))
const StockAnalysis = lazy(() => import('./components/StockAnalysis'))
const StockScreener = lazy(() => import('./components/StockScreener'))
const TopStocks = lazy(() => import('./components/TopStocks'))
const CompareStocks = lazy(() => import('./components/CompareStocks'))
const IPODetails = lazy(() => import('./components/IPODetails'))
const Watchlist = lazy(() => import('./components/Watchlist'))

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
    </div>
  </div>
)

function AppContent() {
  const { darkMode, toggleDarkMode } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: darkMode ? '#1F2937' : '#FFFFFF',
            color: darkMode ? '#F3F4F6' : '#1F2937',
            border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white shadow-2xl border-b border-blue-800/30">
          <div className="container mx-auto px-4 py-5 md:py-7">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 md:p-3 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">
                      StockVista<span className="text-yellow-400">.in</span>
                    </h1>
                    <p className="text-blue-200 dark:text-gray-400 mt-0.5 md:mt-1 text-xs md:text-sm hidden sm:block font-medium">
                      Advanced Indian Stock Market Intelligence Platform
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                {/* Global Search */}
                <GlobalSearch />
                
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2.5 md:p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30 shadow-lg"
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {darkMode ? (
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>
                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2.5 md:p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30 shadow-lg"
                >
                  {mobileMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
          <div className="container mx-auto px-4">
            {/* Desktop Navigation */}
            <ul className="hidden lg:flex lg:space-x-2 py-3">
              <li>
                <Link to="/" className="px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-all duration-200 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
                  Market Overview
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-all duration-200 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  My Watchlist
                </Link>
              </li>
              <li>
                <Link to="/analysis" className="px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-all duration-200 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>
                  Deep Analysis
                </Link>
              </li>
              <li>
                <Link to="/screener" className="px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-all duration-200 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/></svg>
                  Stock Screener
                </Link>
              </li>
              <li>
                <Link to="/top-stocks" className="px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-all duration-200 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/></svg>
                  Top Performers
                </Link>
              </li>
              <li>
                <Link to="/compare" className="px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-all duration-200 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd"/></svg>
                  Compare
                </Link>
              </li>
              <li>
                <Link to="/ipo" className="px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-all duration-200 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                  IPO Calendar
                </Link>
              </li>
            </ul>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <ul className="lg:hidden py-4 space-y-3 border-t dark:border-gray-700">
                <li>
                  <Link 
                    to="/" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition py-2"
                  >
                    🏠 Home
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/watchlist" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition py-2"
                  >
                    ⭐ Watchlist
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/analysis" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition py-2"
                  >
                    📊 Stock Analysis
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/screener" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition py-2"
                  >
                    🔍 Stock Screener
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/top-stocks" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition py-2"
                  >
                    🏆 Top Stocks
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/compare" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition py-2"
                  >
                    ⚖️ Compare Stocks
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/ipo" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition py-2"
                  >
                    🚀 IPO Details
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 md:py-8">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/analysis" element={<StockAnalysis />} />
              <Route path="/screener" element={<StockScreener />} />
              <Route path="/top-stocks" element={<TopStocks />} />
              <Route path="/compare" element={<CompareStocks />} />
              <Route path="/ipo" element={<IPODetails />} />
            </Routes>
          </Suspense>
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-black text-white mt-12 border-t-4 border-blue-600">
          <div className="container mx-auto px-4 py-10">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {/* Brand Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      Stock Analyzer
                    </h3>
                    <p className="text-xs text-gray-400">NSE & BSE Intelligence</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Comprehensive stock analysis platform with real-time data, advanced fundamentals, and intelligent insights for Indian markets.
                </p>
                <div className="flex gap-3">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-bold mb-4 text-blue-400">Quick Links</h4>
                <ul className="space-y-2">
                  <li><Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span>🏠</span> Home</Link></li>
                  <li><Link to="/analysis" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span>📊</span> Stock Analysis</Link></li>
                  <li><Link to="/screener" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span>🔍</span> Stock Screener</Link></li>
                  <li><Link to="/compare" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span>⚖️</span> Compare Stocks</Link></li>
                  <li><Link to="/watchlist" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span>⭐</span> Watchlist</Link></li>
                  <li><Link to="/ipo" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span>🎯</span> IPO Details</Link></li>
                  <li><Link to="/top-stocks" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span>🏆</span> Top Stocks</Link></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="text-lg font-bold mb-4 text-blue-400">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="https://www.nseindia.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span>📈</span> NSE India</a></li>
                  <li><a href="https://www.bseindia.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span>📉</span> BSE India</a></li>
                  <li><a href="https://www.sebi.gov.in" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span>🏛️</span> SEBI</a></li>
                  <li><a href="https://economictimes.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span>📰</span> Economic Times</a></li>
                  <li><a href="https://moneycontrol.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span>💰</span> MoneyControl</a></li>
                </ul>
              </div>

              {/* Features */}
              <div>
                <h4 className="text-lg font-bold mb-4 text-blue-400">Features</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Real-time NSE & BSE Data
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Advanced Fundamentals
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Interactive Charts
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    PWA - Works Offline
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Mobile Responsive
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Global Search (Ctrl+K)
                  </li>
                </ul>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-600/30 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <div>
                  <h3 className="font-bold text-yellow-400 mb-2">⚠️ Important Disclaimer</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    This platform is designed for <strong>educational and informational purposes only</strong>. 
                    The data, analysis, and insights provided should <strong>NOT be considered as financial advice</strong>. 
                    Stock market investments are subject to market risks. Please read all scheme-related documents carefully 
                    and consult with a <strong>SEBI-registered financial advisor</strong> before making any investment decisions. 
                    Past performance is not indicative of future results.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700 pt-6 mt-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-400">
                  © {new Date().getFullYear()} <span className="font-semibold text-blue-400">Stock Analyzer</span> | 
                  Built with <span className="text-red-500">♥</span> using React & Node.js
                </p>
                <div className="flex gap-6 text-sm">
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                    </svg>
                    Back to Top
                  </button>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-400 text-xs">
                    Made with React 18.2 & Vite 5.0
                  </span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <WatchlistProvider>
          <AppContent />
        </WatchlistProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
