import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { api, apiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { AuthShell } from "./Login";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Min 8 characters")
    .regex(/[A-Z]/, "Add an uppercase letter")
    .regex(/[a-z]/, "Add a lowercase letter")
    .regex(/[0-9]/, "Add a number"),
  role: z.enum(["admin", "member"]),
});

export default function Signup() {
  const { setSession, token } = useAuthStore();
  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: "member" },
  });

  if (token) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/register", data);
      setSession(res.data);
      toast.success("Welcome to Team Task Manager");
      nav("/dashboard", { replace: true });
    } catch (err) {
      toast.error(apiError(err, "Sign up failed"));
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Set up your team workspace in seconds.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full name"
          autoComplete="name"
          {...register("name")}
          error={errors.name?.message}
        />
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
          autoComplete="new-password"
          {...register("password")}
          error={errors.password?.message}
        />
        <Select
          label="Role"
          {...register("role")}
          options={[
            { value: "member", label: "Member" },
            { value: "admin", label: "Admin" },
          ]}
          error={errors.role?.message}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
