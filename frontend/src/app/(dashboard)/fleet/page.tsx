"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { StatusPill } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { toast } from "sonner";
import { vehicleSchema, type VehicleFormData } from "@/lib/validators/vehicle";
import { z } from "zod";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<VehicleFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (type) query.set("type", type);
      if (status) query.set("status", status);
      // Wait, backend API supports search by reg num? The PRD says "search by reg number", but backend PRD didn't explicitly mention reg num in query params.
      // We will do client side filtering for search if backend doesn't support it.
      
      const data = await apiGet<any[]>(`/vehicles?${query.toString()}`);
      setVehicles(data);
    } catch (error) {
      toast.error("Failed to fetch vehicles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [type, status]);

  const filteredVehicles = vehicles.filter(v => 
    v.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (vehicle?: any) => {
    setErrors({});
    if (vehicle) {
      setEditingId(vehicle.id);
      setFormData({
        registrationNumber: vehicle.registrationNumber,
        name: vehicle.name,
        type: vehicle.type,
        maxLoadCapacity: vehicle.maxLoadCapacity,
        odometer: vehicle.odometer,
        acquisitionCost: vehicle.acquisitionCost,
        region: vehicle.region || "",
        status: vehicle.status,
      });
    } else {
      setEditingId(null);
      setFormData({
        status: "available"
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validData = vehicleSchema.parse(formData);
      setIsSaving(true);
      
      if (editingId) {
        await apiPatch(`/vehicles/${editingId}`, validData);
        toast.success("Vehicle updated successfully");
      } else {
        await apiPost("/vehicles", validData);
        toast.success("Vehicle created successfully");
      }
      
      setIsModalOpen(false);
      fetchVehicles();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: any = {};
        (err as any).errors.forEach((e: any) => {
          if (e.path[0]) fieldErrors[e.path[0]] = e.message;
        });
        setErrors(fieldErrors);
      } else if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await apiDelete(`/vehicles/${id}`);
      toast.success("Vehicle deleted");
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehicle Registry</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Manage your fleet inventory and statuses.</p>
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
          <Button onClick={() => handleOpenModal()} className="shrink-0 gap-2">
            <Plus className="w-4 h-4" /> Add Vehicle
          </Button>
        </div>
      </div>

      <DataTable
        isLoading={isLoading}
        data={filteredVehicles}
        columns={[
          { key: "registrationNumber", header: "Reg. No", cell: r => <span className="font-semibold text-white">{r.registrationNumber}</span> },
          { key: "name", header: "Name / Model" },
          { key: "type", header: "Type" },
          { key: "maxLoadCapacity", header: "Capacity", cell: r => `${r.maxLoadCapacity} kg` },
          { key: "odometer", header: "Odometer", cell: r => `${r.odometer} km` },
          { key: "acquisitionCost", header: "Acq. Cost", cell: r => `$${r.acquisitionCost}` },
          { key: "status", header: "Status", cell: r => <StatusPill status={r.status} /> },
          { 
            key: "actions", 
            header: "", 
            cell: r => (
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => handleOpenModal(r)} className="p-2 text-[var(--text-secondary)] hover:text-white transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(r.id)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) 
          }
        ]}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Edit Vehicle" : "Add Vehicle"}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input 
            label="Registration Number" 
            value={formData.registrationNumber || ""} 
            onChange={e => setFormData({...formData, registrationNumber: e.target.value})}
            error={errors.registrationNumber}
          />
          <Input 
            label="Name / Model" 
            value={formData.name || ""} 
            onChange={e => setFormData({...formData, name: e.target.value})}
            error={errors.name}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Type" 
              value={formData.type || ""} 
              onChange={e => setFormData({...formData, type: e.target.value})}
              error={errors.type}
            >
              <option value="">Select type...</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Bike">Bike</option>
            </Select>
            <Input 
              label="Capacity (kg)" 
              type="number"
              value={formData.maxLoadCapacity || ""} 
              onChange={e => setFormData({...formData, maxLoadCapacity: e.target.value as any})}
              error={errors.maxLoadCapacity}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Odometer" 
              type="number"
              value={formData.odometer || ""} 
              onChange={e => setFormData({...formData, odometer: e.target.value as any})}
              error={errors.odometer}
            />
            <Input 
              label="Acquisition Cost" 
              type="number"
              value={formData.acquisitionCost || ""} 
              onChange={e => setFormData({...formData, acquisitionCost: e.target.value as any})}
              error={errors.acquisitionCost}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Region" 
              value={formData.region || ""} 
              onChange={e => setFormData({...formData, region: e.target.value})}
              error={errors.region}
            />
            <Select 
              label="Status" 
              value={formData.status || "available"} 
              onChange={e => setFormData({...formData, status: e.target.value as any})}
              error={errors.status}
            >
              <option value="available">Available</option>
              <option value="on_trip">On Trip</option>
              <option value="in_shop">In Shop</option>
              <option value="retired">Retired</option>
            </Select>
          </div>
          
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSaving}>{editingId ? "Save Changes" : "Create Vehicle"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
