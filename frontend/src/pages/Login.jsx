import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthShell from "@/components/layout/AuthShell";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
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
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your team's work."
      footer={
        <>
          New here?{" "}
          <Link
            to="/signup"
            className="font-medium text-brand-600 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          {...register("email")}
          error={errors.email?.message}
        />
        <div>
          <div className="flex items-center justify-between">
            <label className="label mb-0" htmlFor="password">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="mt-1">
            <PasswordInput
              id="password"
              autoComplete="current-password"
              {...register("password")}
              error={errors.password?.message}
            />
          </div>
        </div>
        <Button type="submit" loading={isSubmitting} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
