"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/libs/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserAvatarDropdown } from "@/components/UserAvatarDropdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [mapCode, setMapCode] = useState("");
  const [analyticsData, setAnalyticsData] = useState<string[][]>([]);
  const [forecastData, setForecastData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isForecasting, setIsForecasting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleAnalyze = async () => {
    if (!mapCode) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/map-analytics', {
        method: 'POST',
        body: mapCode
      });
      const { data } = await response.json();
      setAnalyticsData(data);
      setForecastData([]); // Clear forecast data when new analysis is done
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForecast = async () => {
    if (!analyticsData || analyticsData.length === 0) {
      alert('Please analyze a map first');
      return;
    }

    setIsForecasting(true);
    try {
      const response = await fetch('/api/map-forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate forecast');
      }

      const data = await response.json();
      setForecastData(data.data);
    } catch (error) {
      console.error('Error generating forecast:', error);
      alert('Failed to generate forecast');
    } finally {
      setIsForecasting(false);
    }
  };

  // Transform data for the chart
  const historical = [...analyticsData].reverse().map(row => ({
    date: row[0],
    historical: parseInt(row[1].replace(/,/g, '')),
    forecast: null,
  }));
  const forecast = forecastData.map(row => ({
    date: row[0],
    historical: null,
    forecast: parseInt(row[1].replace(/,/g, '')),
  }));


  const chartData = [...historical, ...forecast];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl flex items-center gap-2">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            FN Forecast
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => {
              window.location.href = "/"
            }}>Back to Home</Button>
            <UserAvatarDropdown user={user} />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="container max-w-6xl mx-auto">
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight pt-4">
                Map Analytics Dashboard
              </h1>
              <p className="text-muted-foreground">
                Enter a map code to view detailed analytics and forecasts
              </p>
            </div>

            {/* Map Code Input */}
            <div className="flex gap-4 max-w-2xl">
              <Input 
                placeholder="Enter map code (e.g. 1234-5678-9012)" 
                className="flex-1"
                value={mapCode}
                onChange={(e) => setMapCode(e.target.value)}
              />
              <Button 
                size="lg" 
                onClick={handleAnalyze}
                disabled={isLoading}
              >
                {isLoading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>

            {/* Analytics Content */}
            {analyticsData.length > 0 && (
              <div className="space-y-8">
                {/* Chart */}
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Peak Players Over Time</h2>
                    <button
                      onClick={handleForecast}
                      disabled={isForecasting || !analyticsData}
                      className={`px-4 py-2 rounded-md text-white ${
                        isForecasting || !analyticsData
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isForecasting ? 'Generating...' : 'Generate Forecast'}
                    </button>
                  </div>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          interval={0}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          tickFormatter={(value) => value.toLocaleString()}
                        />
                        <Tooltip 
                          formatter={(value) => [value.toLocaleString(), "Peak Players"]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend verticalAlign="top" height={50} />
                        <Line 
                          type="monotone" 
                          dataKey="historical"
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={false}
                          name="Historical"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="forecast"
                          stroke="#82ca9d" 
                          strokeWidth={2}
                          dot={false}
                          name="Forecast"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Peak Players</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Forecast rows (reverse order, on top) */}
                      {[...forecastData].reverse().map((row, index) => (
                        <TableRow key={`forecast-${index}`}>
                          <TableCell>{row[0]}</TableCell>
                          <TableCell>{row[1]}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">Forecast</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Historical rows (reverse order, below) */}
                      {[...analyticsData].map((row, index) => (
                        <TableRow key={`historical-${index}`}>
                          <TableCell>{row[0]}</TableCell>
                          <TableCell>{row[1]}</TableCell>
                          <TableCell>
                            <Badge variant="default">Historical</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
