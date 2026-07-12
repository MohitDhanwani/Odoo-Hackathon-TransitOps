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
import { driverSchema, type DriverFormData } from "@/lib/validators/driver";
import { z } from "zod";
import { Plus, Edit2, Trash2, AlertTriangle } from "lucide-react";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<DriverFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<any[]>("/drivers");
      setDrivers(data);
    } catch (error) {
      toast.error("Failed to fetch drivers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const filteredDrivers = drivers.filter(d => 
    (d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.licenseNumber.toLowerCase().includes(search.toLowerCase())) &&
    (status === "" || d.status === status)
  );

  const issuesCount = drivers.filter(d => {
    if (d.status === "suspended") return true;
    const expiry = new Date(d.licenseExpiryDate).getTime();
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return (expiry - now) < thirtyDays;
  }).length;

  const handleOpenModal = (driver?: any) => {
    setErrors({});
    if (driver) {
      setEditingId(driver.id);
      setFormData({
        name: driver.name,
        licenseNumber: driver.licenseNumber,
        licenseCategory: driver.licenseCategory,
        // Backend might return ISO string, we need YYYY-MM-DD for input type="date"
        licenseExpiryDate: new Date(driver.licenseExpiryDate).toISOString().split('T')[0],
        contactNumber: driver.contactNumber,
        status: driver.status,
      });
    } else {
      setEditingId(null);
      setFormData({ status: "available" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validData = driverSchema.parse({
        ...formData,
        // Date strings should be valid ISO for backend, but backend might accept YYYY-MM-DD
        licenseExpiryDate: formData.licenseExpiryDate ? new Date(formData.licenseExpiryDate).toISOString() : ""
      });
      setIsSaving(true);
      
      if (editingId) {
        await apiPatch(`/drivers/${editingId}`, validData);
        toast.success("Driver updated successfully");
      } else {
        await apiPost("/drivers", validData);
        toast.success("Driver created successfully");
      }
      
      setIsModalOpen(false);
      fetchDrivers();
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
    if (!confirm("Are you sure you want to delete this driver?")) return;
    try {
      await apiDelete(`/drivers/${id}`);
      toast.success("Driver deleted");
      fetchDrivers();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Drivers & Safety</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Manage personnel and monitor compliance.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Select value={status} onChange={e => setStatus(e.target.value)} className="w-[120px]">
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="off_duty">Off Duty</option>
            <option value="suspended">Suspended</option>
          </Select>
          <Button onClick={() => handleOpenModal()} className="shrink-0 gap-2">
            <Plus className="w-4 h-4" /> Add Driver
          </Button>
        </div>
      </div>

      {!isLoading && issuesCount > 0 && (
        <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-xl p-4 flex items-center gap-3 text-[var(--danger)]">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-medium">
            Attention: {issuesCount} driver(s) have suspended statuses or expiring licenses in the next 30 days.
          </span>
        </div>
      )}

      <DataTable
        isLoading={isLoading}
        data={filteredDrivers}
        columns={[
          { key: "name", header: "Name", cell: r => <span className="font-semibold text-white">{r.name}</span> },
          { key: "licenseNumber", header: "License No." },
          { key: "licenseCategory", header: "Category" },
          { key: "licenseExpiryDate", header: "Expiry Date", cell: r => new Date(r.licenseExpiryDate).toLocaleDateString() },
          { key: "contactNumber", header: "Contact" },
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
        title={editingId ? "Edit Driver" : "Add Driver"}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input 
            label="Full Name" 
            value={formData.name || ""} 
            onChange={e => setFormData({...formData, name: e.target.value})}
            error={errors.name}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="License Number" 
              value={formData.licenseNumber || ""} 
              onChange={e => setFormData({...formData, licenseNumber: e.target.value})}
              error={errors.licenseNumber}
            />
            <Input 
              label="License Category" 
              placeholder="e.g. CDL-A"
              value={formData.licenseCategory || ""} 
              onChange={e => setFormData({...formData, licenseCategory: e.target.value})}
              error={errors.licenseCategory}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Expiry Date" 
              type="date"
              value={formData.licenseExpiryDate || ""} 
              onChange={e => setFormData({...formData, licenseExpiryDate: e.target.value})}
              error={errors.licenseExpiryDate}
            />
            <Input 
              label="Contact Number" 
              value={formData.contactNumber || ""} 
              onChange={e => setFormData({...formData, contactNumber: e.target.value})}
              error={errors.contactNumber}
            />
          </div>
          <Select 
            label="Status" 
            value={formData.status || "available"} 
            onChange={e => setFormData({...formData, status: e.target.value as any})}
            error={errors.status}
          >
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="off_duty">Off Duty</option>
            <option value="suspended">Suspended</option>
          </Select>
          
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSaving}>{editingId ? "Save Changes" : "Create Driver"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
