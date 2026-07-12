"use client";

import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { fuelLogSchema, type FuelLogFormData } from "@/lib/validators/fuel";
import { expenseSchema, type ExpenseFormData } from "@/lib/validators/expense";
import { z } from "zod";
import { Plus, Receipt, Fuel } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function FuelExpensesPage() {
  const [activeTab, setActiveTab] = useState<"fuel" | "expenses">("fuel");
  
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isFuelOpen, setIsFuelOpen] = useState(false);
  const [fuelData, setFuelData] = useState<Partial<FuelLogFormData>>({});
  const [fuelErrors, setFuelErrors] = useState<Record<string, string>>({});
  
  const [isExpOpen, setIsExpOpen] = useState(false);
  const [expData, setExpData] = useState<Partial<ExpenseFormData>>({});
  const [expErrors, setExpErrors] = useState<Record<string, string>>({});
  
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fData, eData, vData] = await Promise.all([
        apiGet<any[]>("/fuel-logs"),
        apiGet<any[]>("/expenses"),
        apiGet<any[]>("/vehicles")
      ]);
      setFuelLogs(fData);
      setExpenses(eData);
      setVehicles(vData);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFuelSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFuelErrors({});
    
    try {
      const validData = fuelLogSchema.parse(fuelData);
      setIsSaving(true);
      await apiPost("/fuel-logs", validData);
      toast.success("Fuel log added");
      setIsFuelOpen(false);
      setFuelData({});
      fetchData();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: any = {};
        (err as any).errors.forEach((e: any) => {
          if (e.path[0]) fieldErrors[e.path[0]] = e.message;
        });
        setFuelErrors(fieldErrors);
      } else if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleExpSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpErrors({});
    
    try {
      const validData = expenseSchema.parse(expData);
      setIsSaving(true);
      await apiPost("/expenses", validData);
      toast.success("Expense added");
      setIsExpOpen(false);
      setExpData({});
      fetchData();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: any = {};
        (err as any).errors.forEach((e: any) => {
          if (e.path[0]) fieldErrors[e.path[0]] = e.message;
        });
        setExpErrors(fieldErrors);
      } else if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const totalFuelCost = fuelLogs.reduce((acc, log) => acc + parseFloat(log.cost || '0'), 0);
  const totalExpCost = expenses.reduce((acc, exp) => acc + parseFloat(exp.amount || '0'), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fuel & Expenses</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Manage operational costs and fuel consumption.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Card className="hidden lg:flex items-center gap-3 py-2 px-4 shadow-none bg-transparent">
            <div className="bg-[var(--info)]/10 p-2 rounded-lg">
              <Fuel className="w-5 h-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Total Fuel</p>
              <p className="text-lg font-bold font-mono tracking-tight text-[var(--info)]">${totalFuelCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </Card>
          <Card className="hidden lg:flex items-center gap-3 py-2 px-4 shadow-none bg-transparent">
            <div className="bg-[var(--danger)]/10 p-2 rounded-lg">
              <Receipt className="w-5 h-5 text-[var(--danger)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Total General</p>
              <p className="text-lg font-bold font-mono tracking-tight text-[var(--danger)]">${totalExpCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <Button onClick={() => setIsFuelOpen(true)} className="shrink-0 gap-2">
              <Plus className="w-4 h-4" /> Add Fuel Log
            </Button>
            <Button onClick={() => setIsExpOpen(true)} variant="secondary" className="shrink-0 gap-2">
              <Plus className="w-4 h-4" /> Add Expense
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg w-fit border border-[var(--border-subtle)]">
        <button
          onClick={() => setActiveTab("fuel")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            activeTab === "fuel" ? "bg-[var(--bg-surface)] text-white shadow" : "text-[var(--text-secondary)] hover:text-white"
          )}
        >
          Fuel Logs
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            activeTab === "expenses" ? "bg-[var(--bg-surface)] text-white shadow" : "text-[var(--text-secondary)] hover:text-white"
          )}
        >
          General Expenses
        </button>
      </div>

      {activeTab === "fuel" ? (
        <DataTable
          isLoading={isLoading}
          data={fuelLogs}
          columns={[
            { key: "date", header: "Date", cell: r => new Date(r.date).toLocaleDateString() },
            { key: "vehicle", header: "Vehicle", cell: r => <span className="font-semibold">{r.vehicle?.name || "Unknown"}</span> },
            { key: "liters", header: "Volume", cell: r => `${r.liters} L` },
            { key: "cost", header: "Cost", cell: r => <span className="font-mono text-[var(--danger)]">-${r.cost}</span> },
          ]}
        />
      ) : (
        <DataTable
          isLoading={isLoading}
          data={expenses}
          columns={[
            { key: "date", header: "Date", cell: r => new Date(r.date).toLocaleDateString() },
            { key: "vehicle", header: "Vehicle", cell: r => <span className="font-semibold">{r.vehicle?.name || "Unknown"}</span> },
            { key: "type", header: "Type" },
            { key: "description", header: "Description" },
            { key: "amount", header: "Amount", cell: r => <span className="font-mono text-[var(--danger)]">-${r.amount}</span> },
          ]}
        />
      )}

      {/* Fuel Modal */}
      <Modal isOpen={isFuelOpen} onClose={() => setIsFuelOpen(false)} title="Log Fuel">
        <form onSubmit={handleFuelSave} className="flex flex-col gap-4">
          <Select 
            label="Vehicle" 
            value={fuelData.vehicleId || ""} 
            onChange={e => setFuelData({...fuelData, vehicleId: e.target.value})}
            error={fuelErrors.vehicleId}
          >
            <option value="">Select vehicle...</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.registrationNumber} - {v.name}</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Date" 
              type="date"
              value={fuelData.date || ""} 
              onChange={e => setFuelData({...fuelData, date: e.target.value})}
              error={fuelErrors.date}
            />
            <Input 
              label="Volume (Liters)" 
              type="number"
              step="0.1"
              value={fuelData.liters || ""} 
              onChange={e => setFuelData({...fuelData, liters: e.target.value as any})}
              error={fuelErrors.liters}
            />
          </div>
          <Input 
            label="Total Cost ($)" 
            type="number"
            step="0.01"
            value={fuelData.cost || ""} 
            onChange={e => setFuelData({...fuelData, cost: e.target.value as any})}
            error={fuelErrors.cost}
          />
          
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <Button type="button" variant="ghost" onClick={() => setIsFuelOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSaving}>Save Fuel Log</Button>
          </div>
        </form>
      </Modal>

      {/* Expense Modal */}
      <Modal isOpen={isExpOpen} onClose={() => setIsExpOpen(false)} title="Log Expense">
        <form onSubmit={handleExpSave} className="flex flex-col gap-4">
          <Select 
            label="Vehicle" 
            value={expData.vehicleId || ""} 
            onChange={e => setExpData({...expData, vehicleId: e.target.value})}
            error={expErrors.vehicleId}
          >
            <option value="">Select vehicle...</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.registrationNumber} - {v.name}</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Date" 
              type="date"
              value={expData.date || ""} 
              onChange={e => setExpData({...expData, date: e.target.value})}
              error={expErrors.date}
            />
            <Input 
              label="Type (e.g. Toll, Wash)" 
              value={expData.type || ""} 
              onChange={e => setExpData({...expData, type: e.target.value})}
              error={expErrors.type}
            />
          </div>
          <Input 
            label="Amount ($)" 
            type="number"
            step="0.01"
            value={expData.amount || ""} 
            onChange={e => setExpData({...expData, amount: e.target.value as any})}
            error={expErrors.amount}
          />
          <Textarea 
            label="Description (Optional)" 
            value={expData.description || ""} 
            onChange={e => setExpData({...expData, description: e.target.value})}
            error={expErrors.description}
          />
          
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <Button type="button" variant="ghost" onClick={() => setIsExpOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSaving}>Save Expense</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
