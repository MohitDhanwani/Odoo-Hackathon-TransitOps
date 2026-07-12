"use client";

import React, { useState } from "react";
import { loginSchema, type LoginFormData } from "@/lib/validators/auth";
import { useAuth } from "@/hooks/useAuth";
import { apiPost, ApiError } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { setUser } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<LoginFormData>>({ email: "", password: "", role: undefined });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError(null);

    try {
      // Validate
      const validData = loginSchema.parse(formData);
      setIsLoading(true);

      // Login request
      const response = await apiPost("/auth/login", validData);
      
      // Validate role
      if (response.role !== validData.role) {
        throw new ApiError(403, "You do not have access to this role. Please select the correct role for your account.");
      }
      
      setUser(response);
      toast.success("Welcome back to TransitOps");
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: any = {};
        (err as any).errors.forEach((e: any) => {
          if (e.path[0]) fieldErrors[e.path[0]] = e.message;
        });
        setErrors(fieldErrors);
      } else if (err instanceof ApiError) {
        setGlobalError(err.message);
      } else {
        setGlobalError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Sign in</h1>
        <p className="text-[var(--text-secondary)] text-sm">Enter your credentials to access the console</p>
      </div>

      {globalError && (
        <div className="mb-6 p-3 bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-lg text-[var(--danger)] text-sm">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="fleetmanager1@transitops.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
        />
        <Select
          label="Role"
          value={formData.role || ""}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
          error={errors.role}
        >
          <option value="">Select your role...</option>
          <option value="fleet_manager">Fleet Manager</option>
          <option value="dispatcher">Dispatcher</option>
          <option value="safety_officer">Safety Officer</option>
          <option value="financial_analyst">Financial Analyst</option>
        </Select>
        
        <Button type="submit" className="mt-4 w-full" isLoading={isLoading}>
          Sign in
        </Button>
      </form>

      <div className="mt-8 text-center border-t border-[var(--border-subtle)] pt-6">
        <p className="text-xs text-[var(--text-muted)]">
          Access is provisioned by your fleet administrator.
        </p>
      </div>
    </div>
  );
}
