import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function StockChart({ data }) {
  // Sample data to improve performance - show every Nth point
  const sampleRate = Math.max(1, Math.floor(data.length / 100));
  const sampledData = data.filter((_, index) => index % sampleRate === 0);
  
  // Format data for Recharts
  const chartData = sampledData.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    price: parseFloat(item.close?.toFixed(2)),
  }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis 
          tick={{ fontSize: 11 }} 
          domain={['auto', 'auto']}
          width={60}
        />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="#1e40af" 
          strokeWidth={2}
          dot={false}
          name="Close Price (₹)"
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
