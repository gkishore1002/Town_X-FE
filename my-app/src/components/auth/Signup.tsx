import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Home, Building2, ShieldCheck } from "lucide-react";
import axios from "axios";

import { useAuth, ROLE_HOME_ROUTE } from "@/context/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/user";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  role: z.enum(["buyer", "owner", "admin"]),
});

type SignupValues = z.infer<typeof signupSchema>;

const ROLE_OPTIONS: { value: UserRole; label: string; description: string; icon: typeof Home }[] = [
  { value: "buyer", label: "Buyer / Renter", description: "Browse & save properties", icon: Home },
  { value: "owner", label: "Owner", description: "List & manage properties", icon: Building2 },
  // Self-serve admin signup is a deliberate prototype simplification —
  // production should seed admin accounts separately, not let anyone pick
  // this at signup.
  { value: "admin", label: "Admin", description: "Platform administration", icon: ShieldCheck },
];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "buyer" },
  });

  const onSubmit = async (values: SignupValues) => {
    setServerError(null);
    try {
      const user = await signup(values);
      navigate(ROLE_HOME_ROUTE[user.role], { replace: true });
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.detail : null;
      setServerError(message || "Something went wrong. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Town Exchange to browse, list, or manage properties."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label>I am a...</Label>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const selected = field.value === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => field.onChange(option.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-control border-2 p-2.5 text-center transition-colors",
                        selected
                          ? "border-primary bg-brand-50 text-primary"
                          : "border-border text-muted-foreground hover:border-gray-300"
                      )}
                    >
                      <Icon className="size-4" />
                      <span className="text-[11px] font-medium leading-tight">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
