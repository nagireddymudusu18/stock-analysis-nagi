import { useState, useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTheme } from '../context/ThemeContext'

// CustomTooltip component outside render
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{payload[0].payload.fullDate}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: ₹{entry.value?.toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function StockChart({ data }) {
  const { darkMode } = useTheme()
  const [chartType, setChartType] = useState('price') // 'price', 'volume', 'combined'
  
  // Calculate moving averages
  const calculateMA = (data, period) => {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(null);
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0);
        result.push(sum / period);
      }
    }
    return result;
  };

  // Sample data to improve performance - show every Nth point
  const sampleRate = Math.max(1, Math.floor(data.length / 150));
  const sampledData = data.filter((_, index) => index % sampleRate === 0);
  
  const ma20 = calculateMA(sampledData, 20);
  const ma50 = calculateMA(sampledData, 50);
  
  // Format data for Recharts
  const chartData = useMemo(() => {
    return sampledData.map((item, index) => ({
      date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      fullDate: new Date(item.date).toLocaleDateString('en-IN'),
      price: parseFloat(item.close?.toFixed(2)),
      high: parseFloat(item.high?.toFixed(2)),
      low: parseFloat(item.low?.toFixed(2)),
      volume: item.volume,
      ma20: ma20[index] ? parseFloat(ma20[index].toFixed(2)) : null,
      ma50: ma50[index] ? parseFloat(ma50[index].toFixed(2)) : null,
    }));
  }, [sampledData, ma20, ma50]);

  const gridColor = darkMode ? '#374151' : '#e0e0e0';
  const textColor = darkMode ? '#9CA3AF' : '#666666';

  return (
    <div className="space-y-4">
      {/* Chart Type Selector */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setChartType('price')}
          className={`px-3 py-1 text-sm rounded-lg transition ${
            chartType === 'price'
              ? 'bg-primary text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Price Chart
        </button>
        <button
          onClick={() => setChartType('volume')}
          className={`px-3 py-1 text-sm rounded-lg transition ${
            chartType === 'volume'
              ? 'bg-primary text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Volume
        </button>
        <button
          onClick={() => setChartType('combined')}
          className={`px-3 py-1 text-sm rounded-lg transition ${
            chartType === 'combined'
              ? 'bg-primary text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Combined
        </button>
      </div>

      {/* Price Chart */}
      {chartType === 'price' && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: textColor }}
              interval="preserveStartEnd"
              stroke={textColor}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: textColor }} 
              domain={['auto', 'auto']}
              width={70}
              stroke={textColor}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#1e40af" 
              strokeWidth={2}
              dot={false}
              name="Close Price"
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="ma20" 
              stroke="#10b981" 
              strokeWidth={1.5}
              dot={false}
              name="MA 20"
              isAnimationActive={false}
              strokeDasharray="5 5"
            />
            <Line 
              type="monotone" 
              dataKey="ma50" 
              stroke="#f59e0b" 
              strokeWidth={1.5}
              dot={false}
              name="MA 50"
              isAnimationActive={false}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Volume Chart */}
      {chartType === 'volume' && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: textColor }}
              interval="preserveStartEnd"
              stroke={textColor}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: textColor }}
              stroke={textColor}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar 
              dataKey="volume" 
              fill="#8b5cf6" 
              name="Volume"
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Combined Chart */}
      {chartType === 'combined' && (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: textColor }}
                interval="preserveStartEnd"
                stroke={textColor}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: textColor }} 
                domain={['auto', 'auto']}
                width={70}
                stroke={textColor}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#1e40af" 
                strokeWidth={2}
                dot={false}
                name="Close Price"
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="ma20" 
                stroke="#10b981" 
                strokeWidth={1.5}
                dot={false}
                name="MA 20"
                isAnimationActive={false}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
          
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: textColor }}
                interval="preserveStartEnd"
                stroke={textColor}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: textColor }}
                stroke={textColor}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="volume" 
                fill="#8b5cf6" 
                name="Volume"
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
