import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import HomePage from './components/HomePage'
import StockAnalysis from './components/StockAnalysis'
import StockScreener from './components/StockScreener'
import TopStocks from './components/TopStocks'
import CompareStocks from './components/CompareStocks'
import IPODetails from './components/IPODetails'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-primary text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold">📈 Indian Stock Market Analyzer</h1>
            <p className="text-blue-100 mt-2">Analyze NSE & BSE Stocks with Fundamental Analysis</p>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-4">
            <ul className="flex space-x-8 py-4">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-primary font-medium transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/analysis" 
                  className="text-gray-700 hover:text-primary font-medium transition"
                >
                  Stock Analysis
                </Link>
              </li>
              <li>
                <Link 
                  to="/screener" 
                  className="text-gray-700 hover:text-primary font-medium transition"
                >
                  Stock Screener
                </Link>
              </li>
              <li>
                <Link 
                  to="/top-stocks" 
                  className="text-gray-700 hover:text-primary font-medium transition"
                >
                  Top Stocks
                </Link>
              </li>
              <li>
                <Link 
                  to="/compare" 
                  className="text-gray-700 hover:text-primary font-medium transition"
                >
                  Compare Stocks
                </Link>
              </li>
              <li>
                <Link 
                  to="/ipo" 
                  className="text-gray-700 hover:text-primary font-medium transition"
                >
                  IPO Details
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analysis" element={<StockAnalysis />} />
            <Route path="/screener" element={<StockScreener />} />
            <Route path="/top-stocks" element={<TopStocks />} />
            <Route path="/compare" element={<CompareStocks />} />
            <Route path="/ipo" element={<IPODetails />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white mt-12">
          <div className="container mx-auto px-4 py-6">
            <div className="bg-blue-900 rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-2">⚠️ Disclaimer</h3>
              <p className="text-sm text-blue-100">
                This tool is for educational purposes only. Not financial advice. 
                Always do your own research and consult with a SEBI-registered 
                financial advisor before investing.
              </p>
            </div>
            <p className="text-center text-gray-400 text-sm">
              © 2026 Indian Stock Market Analyzer | Built with React & Node.js
            </p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
