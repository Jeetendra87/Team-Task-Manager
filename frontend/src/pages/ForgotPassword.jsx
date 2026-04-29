import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, MailCheck } from "lucide-react";
import toast from "react-hot-toast";
import AuthShell from "@/components/layout/AuthShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api, apiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const schema = z.object({
  email: z.string().email("Invalid email"),
});

export default function ForgotPassword() {
  const { token } = useAuthStore();
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm({ resolver: zodResolver(schema) });

  if (token) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/forgot-password", data);
      setSent(true);
      if (res.data?.devResetUrl) setDevUrl(res.data.devResetUrl);
    } catch (err) {
      toast.error(apiError(err, "Could not send reset email"));
    }
  };

  if (sent) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle={`If an account exists for ${getValues("email")}, we've sent a reset link.`}
        footer={
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-medium text-brand-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-5 text-center">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <MailCheck className="h-5 w-5" />
          </div>
          <p className="text-sm text-emerald-900">
            The link expires in 30 minutes. Didn't get it? Check your spam folder
            or try again.
          </p>
        </div>

        {devUrl && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <p className="font-medium">Dev mode (no SMTP configured)</p>
            <a
              href={devUrl}
              className="mt-1 block break-all text-brand-700 underline"
            >
              {devUrl}
            </a>
          </div>
        )}

        <Button
          variant="secondary"
          className="mt-4 w-full"
          onClick={() => setSent(false)}
        >
          Use a different email
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a secure reset link."
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
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          {...register("email")}
          error={errors.email?.message}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}
