"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings saved successfully");
    }, 600);
  };

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">Manage your account and preferences.</p>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-lg font-semibold">Profile Information</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-[var(--accent-muted)] flex items-center justify-center text-xl font-bold text-[var(--accent)]">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white">{user?.name}</p>
              <p className="text-sm text-[var(--text-secondary)] capitalize">{user?.role.replace("_", " ")}</p>
            </div>
          </div>
          <form className="flex flex-col gap-4" onSubmit={handleSave}>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" defaultValue={user?.name} disabled />
              <Input label="Email Address" defaultValue={user?.email} disabled />
            </div>
          </form>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-lg font-semibold">Preferences</h2>
        </div>
        <div className="p-6">
          <form className="flex flex-col gap-4" onSubmit={handleSave}>
            <Select label="Theme">
              <option value="dark">Dark (Default)</option>
              <option value="light" disabled>Light (Coming Soon)</option>
              <option value="system" disabled>System</option>
            </Select>
            <Select label="Language">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </Select>
            <Select label="Timezone">
              <option value="utc">UTC (Coordinated Universal Time)</option>
              <option value="pst">PST (Pacific Standard Time)</option>
              <option value="est">EST (Eastern Standard Time)</option>
            </Select>
            
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex justify-end">
              <Button type="submit" isLoading={isSaving}>Save Preferences</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
