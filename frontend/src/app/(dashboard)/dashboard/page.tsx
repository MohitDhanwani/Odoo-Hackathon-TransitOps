"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import { KpiCard } from "@/components/ui/KpiCard";
import { DataTable } from "@/components/ui/DataTable";
import { StatusPill } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface DashboardKPIs {
  activeVehicles: number;
  availableVehicles: number;
  maintenanceVehicles: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  fleetUtilization: number;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [region, setRegion] = useState("");
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (type) query.set("type", type);
      if (status) query.set("status", status);
      if (region) query.set("region", region);

      const [kpiData, tripsData, vehiclesData] = await Promise.all([
        apiGet<DashboardKPIs>(`/dashboard?${query.toString()}`),
        apiGet<any[]>("/trips"),
        apiGet<any[]>(`/vehicles?${query.toString()}`)
      ]);

      setKpis(kpiData);
      
      const sortedTrips = [...tripsData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      let filteredVehicles = vehiclesData;
      if (search) {
        const lowerSearch = search.toLowerCase();
        filteredVehicles = filteredVehicles.filter(v => 
          (v.registrationNumber && v.registrationNumber.toLowerCase().includes(lowerSearch)) ||
          (v.name && v.name.toLowerCase().includes(lowerSearch))
        );
      }
      
      let filteredTrips = sortedTrips;
      if (search) {
        const lowerSearch = search.toLowerCase();
        filteredTrips = filteredTrips.filter(t => 
          (t.vehicle?.name && t.vehicle.name.toLowerCase().includes(lowerSearch)) ||
          (t.driver?.name && t.driver.name.toLowerCase().includes(lowerSearch)) ||
          (t.id && t.id.toLowerCase().includes(lowerSearch))
        );
      }

      setRecentTrips(filteredTrips.slice(0, 5));
      setVehicles(filteredVehicles);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type, status, region, search]);

  // Compute breakdown for PieChart
  const breakdownData = [
    { name: "Available", value: vehicles.filter(v => v.status === "available").length, color: "#22C55E" },
    { name: "On Trip", value: vehicles.filter(v => v.status === "on_trip").length, color: "#3B82F6" },
    { name: "In Shop", value: vehicles.filter(v => v.status === "in_shop").length, color: "#F59E0B" },
    { name: "Retired", value: vehicles.filter(v => v.status === "retired").length, color: "#EF4444" },
  ].filter(d => d.value > 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Overview of fleet operations and utilization.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Select value={type} onChange={e => setType(e.target.value)} className="w-[120px]">
            <option value="">All Types</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Bike">Bike</option>
          </Select>
          <Select value={status} onChange={e => setStatus(e.target.value)} className="w-[120px]">
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="in_shop">In Shop</option>
            <option value="retired">Retired</option>
          </Select>
          <Select value={region} onChange={e => setRegion(e.target.value)} className="w-[120px]">
            <option value="">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Active Vehicles" value={kpis?.activeVehicles || 0} />
        <KpiCard title="Fleet Utilization" value={`${kpis?.fleetUtilization || 0}%`} trend={{ label: "Live", positive: true }} />
        <KpiCard title="Active Trips" value={kpis?.activeTrips || 0} />
        <KpiCard title="Pending Trips" value={kpis?.pendingTrips || 0} />
        <KpiCard title="Available Vehicles" value={kpis?.availableVehicles || 0} />
        <KpiCard title="In Maintenance" value={kpis?.maintenanceVehicles || 0} />
        <KpiCard title="Drivers on Duty" value={kpis?.driversOnDuty || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Recent Trips</h2>
          <DataTable
            isLoading={isLoading}
            data={recentTrips}
            columns={[
              { key: "id", header: "Trip ID", cell: r => <span className="font-mono text-xs">{r.id.slice(0, 8)}</span> },
              { key: "source", header: "Source" },
              { key: "destination", header: "Destination" },
              { key: "status", header: "Status", cell: r => <StatusPill status={r.status} /> },
            ]}
          />
        </div>
        
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Vehicle Status</h2>
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px]">
            {isLoading ? (
              <div className="animate-pulse w-40 h-40 rounded-full bg-white/5" />
            ) : breakdownData.length === 0 ? (
              <p className="text-[var(--text-muted)] text-sm">No vehicles found</p>
            ) : (
              <div className="w-full flex flex-col items-center justify-center pt-2">
                <div className="w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={breakdownData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {breakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.05)" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                  {breakdownData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-sm text-[var(--text-secondary)] font-medium">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
