"use client";

import React, { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { StatusPill } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { toast } from "sonner";
import { tripSchema, tripCompletionSchema, type TripFormData, type TripCompletionFormData } from "@/lib/validators/trip";
import { z } from "zod";
import { Plus, CheckCircle, XCircle } from "lucide-react";

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Trip Modal
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newFormData, setNewFormData] = useState<Partial<TripFormData>>({});
  const [newErrors, setNewErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  // Complete Trip Modal
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completeData, setCompleteData] = useState<Partial<TripCompletionFormData>>({});
  const [completeErrors, setCompleteErrors] = useState<Record<string, string>>({});
  const [isCompleting, setIsCompleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tData, vData, dData] = await Promise.all([
        apiGet<any[]>("/trips"),
        apiGet<any[]>("/vehicles"),
        apiGet<any[]>("/drivers")
      ]);
      setTrips(tData);
      setVehicles(vData);
      setDrivers(dData);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewErrors({});
    
    try {
      const validData = tripSchema.parse(newFormData);
      
      // Client-side capacity validation
      const vehicle = vehicles.find(v => v.id === validData.vehicleId);
      if (vehicle && validData.cargoWeight > vehicle.maxLoadCapacity) {
        setNewErrors({ cargoWeight: `Exceeds max capacity of ${vehicle.maxLoadCapacity}kg` });
        return;
      }
      
      setIsCreating(true);
      await apiPost("/trips", validData);
      toast.success("Trip dispatched successfully");
      setIsNewOpen(false);
      setNewFormData({});
      fetchData();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: any = {};
        (err as any).errors.forEach((e: any) => {
          if (e.path[0]) fieldErrors[e.path[0]] = e.message;
        });
        setNewErrors(fieldErrors);
      } else if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingId) return;
    setCompleteErrors({});
    
    try {
      const validData = tripCompletionSchema.parse(completeData);
      setIsCompleting(true);
      
      await apiPost(`/trips/${completingId}/complete`, validData);
      toast.success("Trip completed");
      setIsCompleteOpen(false);
      setCompleteData({});
      fetchData();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: any = {};
        (err as any).errors.forEach((e: any) => {
          if (e.path[0]) fieldErrors[e.path[0]] = e.message;
        });
        setCompleteErrors(fieldErrors);
      } else if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this trip?")) return;
    try {
      await apiPost(`/trips/${id}/cancel`, {});
      toast.success("Trip cancelled");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel trip");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trips & Dispatch</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Manage active routes and dispatch new trips.</p>
        </div>
        <Button onClick={() => setIsNewOpen(true)} className="shrink-0 gap-2 w-full md:w-auto">
          <Plus className="w-4 h-4" /> Dispatch Trip
        </Button>
      </div>

      <DataTable
        isLoading={isLoading}
        data={trips}
        columns={[
          { key: "id", header: "Trip ID", cell: r => <span className="font-mono text-xs">{r.id.slice(0, 8)}</span> },
          { key: "vehicle", header: "Vehicle", cell: r => <span className="font-semibold">{r.vehicle?.name || "Unknown"}</span> },
          { key: "driver", header: "Driver", cell: r => r.driver?.name || "Unknown" },
          { key: "route", header: "Route", cell: r => <span className="text-[var(--text-muted)]">{r.source} → {r.destination}</span> },
          { key: "status", header: "Status", cell: r => <StatusPill status={r.status} /> },
          { 
            key: "actions", 
            header: "", 
            cell: r => (
              <div className="flex items-center justify-end gap-2">
                {r.status === "dispatched" && (
                  <>
                    <button 
                      onClick={() => { setCompletingId(r.id); setIsCompleteOpen(true); }} 
                      className="p-2 text-[var(--success)] hover:bg-[var(--success)]/10 rounded-md transition-colors"
                      title="Complete Trip"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleCancel(r.id)} 
                      className="p-2 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-md transition-colors"
                      title="Cancel Trip"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ) 
          }
        ]}
      />

      {/* New Trip Modal */}
      <Modal isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} title="Dispatch New Trip">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Source" 
              value={newFormData.source || ""} 
              onChange={e => setNewFormData({...newFormData, source: e.target.value})}
              error={newErrors.source}
            />
            <Input 
              label="Destination" 
              value={newFormData.destination || ""} 
              onChange={e => setNewFormData({...newFormData, destination: e.target.value})}
              error={newErrors.destination}
            />
          </div>
          <Select 
            label="Assign Vehicle" 
            value={newFormData.vehicleId || ""} 
            onChange={e => setNewFormData({...newFormData, vehicleId: e.target.value})}
            error={newErrors.vehicleId}
          >
            <option value="">Select vehicle...</option>
            {vehicles.filter(v => v.status === "available").map(v => (
              <option key={v.id} value={v.id}>{v.registrationNumber} - {v.name} (Cap: {v.maxLoadCapacity}kg)</option>
            ))}
          </Select>
          <Select 
            label="Assign Driver" 
            value={newFormData.driverId || ""} 
            onChange={e => setNewFormData({...newFormData, driverId: e.target.value})}
            error={newErrors.driverId}
          >
            <option value="">Select driver...</option>
            {drivers.filter(d => d.status === "available").map(d => (
              <option key={d.id} value={d.id}>{d.name} (Lic: {d.licenseNumber})</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Cargo Weight (kg)" 
              type="number"
              step="0.1"
              value={newFormData.cargoWeight || ""} 
              onChange={e => setNewFormData({...newFormData, cargoWeight: e.target.value as any})}
              error={newErrors.cargoWeight}
            />
            <Input 
              label="Planned Distance (km)" 
              type="number"
              step="0.1"
              value={newFormData.plannedDistance || ""} 
              onChange={e => setNewFormData({...newFormData, plannedDistance: e.target.value as any})}
              error={newErrors.plannedDistance}
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <Button type="button" variant="ghost" onClick={() => setIsNewOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isCreating}>Dispatch</Button>
          </div>
        </form>
      </Modal>

      {/* Complete Trip Modal */}
      <Modal isOpen={isCompleteOpen} onClose={() => setIsCompleteOpen(false)} title="Complete Trip">
        <form onSubmit={handleComplete} className="flex flex-col gap-4">
          <Input 
            label="Actual Distance (km)" 
            type="number"
            step="0.1"
            value={completeData.actualDistance || ""} 
            onChange={e => setCompleteData({...completeData, actualDistance: e.target.value as any})}
            error={completeErrors.actualDistance}
          />
          <Input 
            label="Fuel Consumed (Liters)" 
            type="number"
            step="0.1"
            value={completeData.fuelConsumed || ""} 
            onChange={e => setCompleteData({...completeData, fuelConsumed: e.target.value as any})}
            error={completeErrors.fuelConsumed}
          />
          
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <Button type="button" variant="ghost" onClick={() => setIsCompleteOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isCompleting}>Mark as Complete</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
