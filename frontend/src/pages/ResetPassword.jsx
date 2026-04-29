import { useEffect } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import AuthShell from "@/components/layout/AuthShell";
import PasswordInput from "@/components/ui/PasswordInput";
import PasswordStrength from "@/components/ui/PasswordStrength";
import Button from "@/components/ui/Button";
import { api, apiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Min 8 characters")
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/[a-z]/, "Add a lowercase letter")
      .regex(/[0-9]/, "Add a number"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

export default function ResetPassword() {
  const { token: authToken, setSession } = useAuthStore();
  const [params] = useSearchParams();
  const token = params.get("token");
  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const password = watch("password", "");

  useEffect(() => {
    if (!token) toast.error("Missing reset token");
  }, [token]);

  if (authToken) return <Navigate to="/dashboard" replace />;
  if (!token) return <Navigate to="/forgot-password" replace />;

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/reset-password", {
        token,
        password: data.password,
      });
      setSession(res.data);
      toast.success("Password updated — you're signed in");
      nav("/dashboard", { replace: true });
    } catch (err) {
      toast.error(apiError(err, "Reset failed"));
    }
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before."
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 font-medium text-brand-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <PasswordInput
            label="New password"
            autoComplete="new-password"
            {...register("password")}
            error={errors.password?.message}
          />
          <PasswordStrength value={password} />
        </div>
        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          {...register("confirm")}
          error={errors.confirm?.message}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Update password
        </Button>
      </form>
    </AuthShell>
  );
}
