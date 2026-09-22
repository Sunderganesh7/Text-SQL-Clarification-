import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell,
  ScatterChart, Scatter
} from 'recharts';

interface AutoChartProps {
  data: any[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const isDateKey = (key: string): boolean => {
  const k = key.toLowerCase();
  return (
    k.includes('date') ||
    k.includes('month') ||
    k.includes('year') ||
    k.includes('day') ||
    k.includes('time') ||
    k.includes('created') ||
    k.includes('updated')
  );
};

const isDateValue = (val: any): boolean => {
  if (typeof val !== 'string') return false;
  return /^\d{4}[-/]\d{2}[-/]\d{2}/.test(val) || (/^\d{4}/.test(val) && !isNaN(Date.parse(val)));
};

const isNumericValue = (val: any): boolean => {
  if (val == null) return false;
  if (typeof val === 'number') return !isNaN(val);
  if (typeof val === 'string') {
    if (val.trim() === '') return false;
    return !isNaN(Number(val));
  }
  return false;
};

export const AutoChart: React.FC<AutoChartProps> = ({ data }) => {
  const chartConfig = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    // Filter out generic internal id column if present alongside other meaningful columns
    const allKeys = Object.keys(data[0]);
    const keys = allKeys.length > 2 ? allKeys.filter(k => k.toLowerCase() !== 'id') : allKeys;
    if (keys.length < 2) return null;

    const colTypes: Record<string, 'string' | 'number' | 'date'> = {};
    keys.forEach(k => {
      let numericCount = 0;
      let dateCount = 0;
      const sampleSize = Math.min(data.length, 10);

      for (let i = 0; i < sampleSize; i++) {
        const val = data[i][k];
        if (val == null) continue;
        if (isNumericValue(val)) {
          numericCount++;
        } else if (isDateKey(k) || isDateValue(val)) {
          dateCount++;
        }
      }

      if (numericCount >= sampleSize * 0.7) {
        colTypes[k] = 'number';
      } else if (dateCount >= sampleSize * 0.5 || (isDateKey(k) && dateCount > 0)) {
        colTypes[k] = 'date';
      } else {
        colTypes[k] = 'string';
      }
    });

    const numericCols = keys.filter(k => colTypes[k] === 'number');
    const dateCols = keys.filter(k => colTypes[k] === 'date');
    const stringCols = keys.filter(k => colTypes[k] === 'string');

    // 1. Date/Time + Numeric -> Line Chart
    if (dateCols.length >= 1 && numericCols.length >= 1) {
      return { type: 'line', xAxis: dateCols[0], yAxis: numericCols[0] };
    }

    // 2. Numeric + Numeric (e.g. age vs likes) -> Scatter Chart
    if (numericCols.length >= 2) {
      return { type: 'scatter', xAxis: numericCols[0], yAxis: numericCols[1] };
    }

    // 3. Category + Numeric (e.g. country vs users) -> Bar Chart
    if (stringCols.length >= 1 && numericCols.length >= 1) {
      return { type: 'bar', xAxis: stringCols[0], yAxis: numericCols[0] };
    }

    return null;
  }, [data]);

  const chartData = useMemo(() => {
    if (!chartConfig || !data) return [];
    return data.map(item => {
      const newItem = { ...item };
      if (chartConfig.yAxis && isNumericValue(newItem[chartConfig.yAxis])) {
        newItem[chartConfig.yAxis] = Number(newItem[chartConfig.yAxis]);
      }
      if (chartConfig.xAxis && isNumericValue(newItem[chartConfig.xAxis])) {
        newItem[chartConfig.xAxis] = Number(newItem[chartConfig.xAxis]);
      }
      return newItem;
    });
  }, [data, chartConfig]);

  if (!chartConfig || chartData.length === 0) return null;

  const renderChart = () => {
    switch (chartConfig.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey={chartConfig.xAxis} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Bar dataKey={chartConfig.yAxis} fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey={chartConfig.xAxis} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Line type="monotone" dataKey={chartConfig.yAxis} stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey={chartConfig.yAxis}
                nameKey={chartConfig.xAxis}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#f8fafc' }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" dataKey={chartConfig.xAxis} name={chartConfig.xAxis} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis type="number" dataKey={chartConfig.yAxis} name={chartConfig.yAxis} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
              />
              <Scatter name="Data" data={chartData} fill="#8b5cf6">
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Data Visualization</h4>
      </div>
      <div className="bg-surface-elevated border border-border p-4 rounded-xl shadow-sm w-full h-[320px]">
        {renderChart()}
      </div>
    </div>
  );
};
