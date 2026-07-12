"use client";

import React, { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Download } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function AnalyticsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tData, eData, fData, mData] = await Promise.all([
        apiGet<any[]>("/trips"),
        apiGet<any[]>("/expenses"),
        apiGet<any[]>("/fuel-logs"),
        apiGet<any[]>("/maintenance")
      ]);
      setTrips(tData);
      setExpenses(eData);
      setFuelLogs(fData);
      setMaintenance(mData);
    } catch (error) {
      toast.error("Failed to fetch analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const vehicleStats: Record<string, { 
    name: string; 
    revenue: number; 
    cost: number; 
    fuelCost: number; 
    maintenanceCost: number; 
    generalCost: number;
    fuelLiters: number;
    tripsCount: number;
  }> = {};

  const getStats = (vName: string) => {
    if (!vehicleStats[vName]) {
      vehicleStats[vName] = { name: vName, revenue: 0, cost: 0, fuelCost: 0, maintenanceCost: 0, generalCost: 0, fuelLiters: 0, tripsCount: 0 };
    }
    return vehicleStats[vName];
  };

  trips.forEach(t => {
    const vName = t.vehicle?.name || t.vehicleId;
    if (!vName) return;
    const stats = getStats(vName);
    stats.revenue += Number(t.revenue) || 0;
    stats.tripsCount += 1;
  });

  expenses.forEach(e => {
    const vName = e.vehicle?.name || e.vehicleId;
    if (!vName) return;
    const stats = getStats(vName);
    const amt = Number(e.amount) || 0;
    stats.cost += amt;
    stats.generalCost += amt;
  });

  fuelLogs.forEach(f => {
    const vName = f.vehicle?.name || f.vehicleId;
    if (!vName) return;
    const stats = getStats(vName);
    const cost = Number(f.cost) || 0;
    stats.cost += cost;
    stats.fuelCost += cost;
    stats.fuelLiters += Number(f.liters) || 0;
  });

  maintenance.forEach(m => {
    const vName = m.vehicle?.name || m.vehicleId;
    if (!vName) return;
    const stats = getStats(vName);
    const cost = Number(m.cost) || 0;
    stats.cost += cost;
    stats.maintenanceCost += cost;
  });

  const barData = Object.values(vehicleStats)
    .filter(v => v.revenue > 0 || v.cost > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Compute Expense Breakdown Pie
  let totalMaintenance = 0, totalFuel = 0, totalGeneral = 0;
  maintenance.forEach(m => totalMaintenance += Number(m.cost) || 0);
  fuelLogs.forEach(f => totalFuel += Number(f.cost) || 0);
  expenses.forEach(e => totalGeneral += Number(e.amount) || 0);

  const pieData = [
    { name: "Maintenance", value: totalMaintenance, color: "#F59E0B" },
    { name: "Fuel", value: totalFuel, color: "#3B82F6" },
    { name: "General", value: totalGeneral, color: "#EF4444" }
  ].filter(d => d.value > 0);

  const exportCSV = () => {
    const allData = Object.values(vehicleStats);
    if (allData.length === 0) return toast.info("No data to export");
    const header = "Vehicle,Trips Completed,Total Revenue,Total Cost,Profit,Fuel Cost,Maintenance Cost,General Cost,Fuel Consumed (Liters)\n";
    const rows = allData.map(v => 
      `${v.name},${v.tripsCount},${v.revenue.toFixed(2)},${v.cost.toFixed(2)},${(v.revenue - v.cost).toFixed(2)},${v.fuelCost.toFixed(2)},${v.maintenanceCost.toFixed(2)},${v.generalCost.toFixed(2)},${v.fuelLiters.toFixed(2)}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "comprehensive_fleet_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Compute Fuel Volume over time
  const fuelByDate: Record<string, number> = {};
  fuelLogs.forEach(f => {
    const d = new Date(f.date).toLocaleDateString();
    fuelByDate[d] = (fuelByDate[d] || 0) + Number(f.liters);
  });
  const fuelTimeData = Object.entries(fuelByDate)
    .map(([date, liters]) => ({ date, liters }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Compute Trips by Status
  const tripCount: Record<string, number> = { draft: 0, dispatched: 0, completed: 0, cancelled: 0 };
  trips.forEach(t => {
    if (tripCount[t.status] !== undefined) tripCount[t.status]++;
  });
  const tripStatusData = [
    { name: "Draft", value: tripCount.draft, fill: "#9ca3af" },
    { name: "Dispatched", value: tripCount.dispatched, fill: "#3b82f6" },
    { name: "Completed", value: tripCount.completed, fill: "#10b981" },
    { name: "Cancelled", value: tripCount.cancelled, fill: "#ef4444" },
  ].filter(d => d.value > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics & ROI</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Detailed performance metrics and cost analysis.</p>
        </div>
        
        <Button onClick={exportCSV} className="shrink-0 gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Cost vs Revenue by Vehicle</h2>
          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-white/5 rounded-lg" />
            ) : barData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[var(--text-muted)]">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="var(--success)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cost" name="Cost" fill="var(--danger)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Expense Breakdown</h2>
          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-white/5 rounded-lg" />
            ) : pieData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[var(--text-muted)]">No expenses found</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: $${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--bg-card)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => `$${value}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Fuel Consumption Over Time</h2>
          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-white/5 rounded-lg" />
            ) : fuelTimeData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[var(--text-muted)]">No fuel data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fuelTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="liters" name="Liters" stroke="var(--info)" strokeWidth={3} dot={{ r: 4, fill: 'var(--info)' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Trips by Status</h2>
          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-white/5 rounded-lg" />
            ) : tripStatusData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[var(--text-muted)]">No trips found</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tripStatusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} width={80} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" name="Trips" radius={[0, 4, 4, 0]}>
                    {tripStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
