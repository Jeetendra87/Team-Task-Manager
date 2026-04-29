import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckSquare } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api, apiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const { setSession, token } = useAuthStore();
  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  if (token) return <Navigate to={from} replace />;

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/login", data);
      setSession(res.data);
      toast.success(`Welcome back, ${res.data.user.name.split(" ")[0]}`);
      nav(from, { replace: true });
    } catch (err) {
      toast.error(apiError(err, "Login failed"));
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your team's work.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          {...register("email")}
          error={errors.email?.message}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          error={errors.password?.message}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Sign in
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        New here?{" "}
        <Link to="/signup" className="font-medium text-brand-600 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
            <CheckSquare className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Team Task Manager</span>
        </div>
        <div className="card p-6">
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
