"use client";

import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "sonner";
import { maintenanceSchema, type MaintenanceFormData } from "@/lib/validators/maintenance";
import { z } from "zod";
import { Plus, Wrench } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function MaintenancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<MaintenanceFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [mData, vData] = await Promise.all([
        apiGet<any[]>("/maintenance"),
        apiGet<any[]>("/vehicles")
      ]);
      setLogs(mData);
      setVehicles(vData);
    } catch (error) {
      toast.error("Failed to fetch maintenance records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validData = maintenanceSchema.parse(formData);
      setIsSaving(true);
      
      await apiPost("/maintenance", validData);
      toast.success("Maintenance logged successfully");
      
      setIsOpen(false);
      setFormData({});
      fetchData();
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

  const totalSpent = logs.reduce((acc, log) => acc + parseFloat(log.cost || '0'), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance Logs</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Track vehicle repairs and service history.</p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="flex items-center gap-4 py-2 px-4 shadow-none bg-transparent">
            <div className="bg-[var(--danger)]/10 p-2 rounded-lg">
              <Wrench className="w-5 h-5 text-[var(--danger)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Total Spent</p>
              <p className="text-xl font-bold font-mono tracking-tight text-[var(--danger)]">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </Card>
          <Button onClick={() => setIsOpen(true)} className="shrink-0 gap-2">
            <Plus className="w-4 h-4" /> Log Service
          </Button>
        </div>
      </div>

      <DataTable
        isLoading={isLoading}
        data={logs}
        columns={[
          { key: "date", header: "Date", cell: r => new Date(r.createdAt).toLocaleDateString() },
          { key: "vehicle", header: "Vehicle", cell: r => <span className="font-semibold">{r.vehicle?.name || "Unknown"} ({r.vehicle?.registrationNumber})</span> },
          { key: "description", header: "Description" },
          { key: "cost", header: "Cost", cell: r => <span className="font-mono text-[var(--danger)]">-${r.cost}</span> },
        ]}
      />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Log Maintenance">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Select 
            label="Vehicle" 
            value={formData.vehicleId || ""} 
            onChange={e => setFormData({...formData, vehicleId: e.target.value})}
            error={errors.vehicleId}
          >
            <option value="">Select vehicle...</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.registrationNumber} - {v.name}</option>
            ))}
          </Select>
          <Input 
            label="Cost ($)" 
            type="number"
            step="0.01"
            value={formData.cost || ""} 
            onChange={e => setFormData({...formData, cost: e.target.value as any})}
            error={errors.cost}
          />
          <Textarea 
            label="Description" 
            value={formData.description || ""} 
            onChange={e => setFormData({...formData, description: e.target.value})}
            error={errors.description}
            placeholder="Details of the service performed..."
          />
          
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSaving}>Save Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
