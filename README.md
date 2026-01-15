# 📈 Indian Stock Market Analyzer - React Edition

A modern, full-stack web application for analyzing NSE and BSE stocks with real-time data, fundamental analysis, stock screening, and interactive visualizations built with React and Node.js.

## 🛡️ Code Quality & Deployment

This project includes:
- ✅ **ESLint** - Automated code quality checks
- ✅ **Pre-deployment validation** - Blocks deployments with errors
- ✅ **GitHub Actions CI/CD** - Automated testing on push
- ✅ **Safe Vercel deployments** - Only deploy clean code

**Quick Commands:**
```bash
npm run lint        # Check code quality
npm run lint:fix    # Auto-fix issues
npm run validate    # Full pre-deployment check
```

See [DEPLOYMENT_SAFETY.md](DEPLOYMENT_SAFETY.md) for details.

---

## 🌟 Features

- **Real-time Stock Data**: Fetch latest stock prices and historical data from NSE/BSE via Yahoo Finance API
- **Individual Stock Analysis**: Detailed fundamental metrics with interactive price charts
- **Stock Screener**: Filter stocks based on custom fundamental criteria
- **Top Stocks Ranking**: Identify top performers using composite scoring
- **Stock Comparison**: Compare multiple stocks side-by-side with metrics and charts
- **Interactive Charts**: Beautiful visualizations using Recharts
- **Responsive Design**: Modern UI with Tailwind CSS
- **REST API Backend**: Express.js server for data fetching

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **yahoo-finance2** - Stock data API
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js 18+ and npm
- Internet connection for fetching stock data

## 🚀 Installation

1. **Navigate to the project directory:**
   ```powershell
   cd stock-analysis-react
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

## 💻 Running the Application

### Development Mode

You need to run both the frontend and backend servers:

**Terminal 1 - Start the backend API server:**
```powershell
npm run server
```
The API server will start on `http://localhost:5000`

**Terminal 2 - Start the frontend dev server:**
```powershell
npm run dev
```
The React app will start on `http://localhost:3000`

Open your browser and navigate to `http://localhost:3000`

### Production Build

```powershell
npm run build
npm run preview
```

## 📊 Stock Symbol Format

- **NSE stocks**: Add `.NS` suffix (e.g., `RELIANCE.NS`, `TCS.NS`)
- **BSE stocks**: Add `.BO` suffix (e.g., `RELIANCE.BO`, `TCS.BO`)

### Popular Indian Stocks

| Company | NSE Symbol | BSE Symbol |
|---------|------------|------------|
| Reliance Industries | RELIANCE.NS | RELIANCE.BO |
| TCS | TCS.NS | TCS.BO |
| HDFC Bank | HDFCBANK.NS | HDFCBANK.BO |
| Infosys | INFY.NS | INFY.BO |
| ICICI Bank | ICICIBANK.NS | ICICIBANK.BO |

## 🔧 API Endpoints

The backend server provides the following REST API endpoints:

- `GET /api/stock/:symbol` - Get stock quote
- `GET /api/stock/:symbol/history?period=1y` - Get historical data
- `POST /api/stocks/batch` - Get multiple stock quotes
- `POST /api/stocks/screen` - Screen stocks by criteria
- `GET /api/stocks/default/:market` - Get default stock list

## 📁 Project Structure

```
stock-analysis-react/
├── src/
│   ├── components/
│   │   ├── StockAnalysis.jsx    # Individual stock analysis
│   │   ├── StockScreener.jsx    # Stock screening tool
│   │   ├── TopStocks.jsx        # Top stocks ranking
│   │   ├── CompareStocks.jsx    # Stock comparison
│   │   └── StockChart.jsx       # Reusable chart component
│   ├── App.jsx                  # Main app component with routing
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles
├── server/
│   └── index.js                 # Express API server
├── index.html                   # HTML template
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS config
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## 🎨 Features Breakdown

### 1. Stock Analysis
- View detailed fundamental metrics for any NSE/BSE stock
- Interactive price history charts
- Key metrics: P/E, ROE, Profit Margin, Debt/Equity, Revenue Growth
- 52-week high/low, dividend yield, beta

### 2. Stock Screener
- Filter stocks based on custom criteria
- Adjustable thresholds for P/E, ROE, Debt/Equity, etc.
- Real-time screening of NSE/BSE stocks
- Results displayed in sortable table

### 3. Top Stocks
- Rank stocks by composite fundamental score
- Customizable number of stocks to analyze
- Medal rankings for top 3 performers
- Score based on P/E, ROE, Profit Margin, Growth

### 4. Compare Stocks
- Side-by-side comparison of multiple stocks
- Fundamental metrics comparison table
- Individual price performance charts
- Support for 2+ stocks

## 📊 Available Metrics

- **Valuation**: P/E Ratio, P/B Ratio, Market Cap
- **Profitability**: ROE, Profit Margin
- **Growth**: Revenue Growth, Earnings Growth
- **Debt**: Debt-to-Equity Ratio
- **Returns**: Dividend Yield
- **Price Range**: 52-Week High/Low

## ⚠️ Important Disclaimer

**This tool is for educational and informational purposes only.**

- NOT financial advice
- NOT investment recommendations
- Past performance does not guarantee future results
- Always consult with a SEBI-registered financial advisor
- Do your own research before making investment decisions

## 🐛 Troubleshooting

### Issue: "Cannot connect to API"
**Solution**: Make sure the backend server is running on port 5000
```powershell
npm run server
```

### Issue: "CORS errors"
**Solution**: The server is configured with CORS. Ensure both frontend and backend are running.

### Issue: "Stock data not loading"
**Solutions**:
- Check internet connection
- Verify stock symbol format (add .NS or .BO)
- Check if the stock is actively traded
- Wait a few minutes (API rate limits)

### Issue: Port already in use
**Solution**: Change the port in:
- Frontend: `vite.config.js` (server.port)
- Backend: `server/index.js` (PORT constant)

## 🔄 Customization

### Adding More Default Stocks

Edit `server/index.js`:

```javascript
const DEFAULT_STOCKS = {
  NSE: [
    'RELIANCE.NS',
    'TCS.NS',
    'YOUR_STOCK.NS',  // Add here
  ]
}
```

### Changing Screening Criteria Defaults

Edit the initial state in `src/components/StockScreener.jsx`

### Styling

Modify `tailwind.config.js` to customize colors, fonts, and themes.

## 📈 Performance Tips

- The backend caches are handled by yahoo-finance2
- Consider implementing Redis for production caching
- Add pagination for large result sets
- Implement virtualization for long tables

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Useful Links

- [Yahoo Finance API](https://www.npmjs.com/package/yahoo-finance2)
- [NSE India](https://www.nseindia.com/)
- [BSE India](https://www.bseindia.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API endpoints documentation
3. Check browser console for errors
4. Ensure both servers are running

---

**Happy Investing! 📈💰**

Remember: The stock market involves risk. Never invest money you cannot afford to lose.
