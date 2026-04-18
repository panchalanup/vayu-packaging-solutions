import { FormEvent, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";

import adminLogo from "@/assets/black-vps-logo.png";
import { ADMIN_ROUTES } from "@/config/adminAuth";
import { isAdminAuthenticated, loginAdmin } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LocationState = {
  from?: string;
};

const trustItems = ["Authorized business access", "Internal operations workspace", "Focused, secure admin experience"];

const authStageLabels: Record<string, string> = {
  idle: "Secure sign in",
  verifying: "Verifying credentials",
  authorizing: "Authorizing access",
  initializing: "Initializing workspace",
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authStage, setAuthStage] = useState("idle");

  const redirectPath = useMemo(() => {
    const state = location.state as LocationState | null;
    return state?.from?.startsWith("/admin/") ? state.from : ADMIN_ROUTES.dashboard;
  }, [location.state]);

  const pause = (duration: number) => new Promise((resolve) => window.setTimeout(resolve, duration));

  if (isAdminAuthenticated()) {
    return <Navigate to={ADMIN_ROUTES.dashboard} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setAuthStage("verifying");

    try {
      await pause(500);
      const isValid = await loginAdmin(email, password);

      setAuthStage("authorizing");
      await pause(650);

      setAuthStage("initializing");
      await pause(750);

      if (!isValid) {
        toast.error("Invalid admin email or password");
        return;
      }

      toast.success("Admin access granted");
      navigate(redirectPath, { replace: true });
    } finally {
      setIsSubmitting(false);
      setAuthStage("idle");
    }
  };

  return (
    <div className="relative h-[100svh] overflow-hidden bg-[#f5f7fb] px-4 py-3 text-slate-900 md:px-6 lg:px-8 lg:py-3">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.08),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.06),_transparent_22%),linear-gradient(180deg,_#fbfcfe_0%,_#f3f6fb_100%)]" />
      <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative mx-auto flex h-full max-w-7xl items-center justify-center"
      >
        <div className="grid h-full max-h-[calc(100svh-1.5rem)] w-full overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_32px_120px_rgba(15,23,42,0.10)] backdrop-blur-xl lg:grid-cols-[1.15fr_0.85fr]">
          <section className="relative hidden h-full border-r border-slate-200/80 px-12 py-8 lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-12">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <img src={adminLogo} alt="Vayu Packaging Solutions" className="h-full w-full object-contain p-2.5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">Admin Portal</p>
                  <p className="text-sm text-slate-500">Vayu Packaging Solutions</p>
                </div>
              </div>

              <div className="max-w-lg space-y-6">
                <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                  Enterprise workspace
                </div>

                <div className="space-y-5">
                  <h1 className="text-[44px] font-semibold leading-[0.98] tracking-[-0.05em] text-slate-950">
                    Designed for calm,
                    <br />
                    controlled operations.
                  </h1>
                  <p className="max-w-lg text-[16px] leading-8 text-slate-600">
                    Access the internal business workspace for approvals, oversight, reporting, and operational coordination in one focused environment.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Workspace principles</p>
              <div className="grid gap-3">
                {trustItems.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-900" />
                    <p className="text-sm font-medium text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="flex h-full items-center justify-center px-5 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-6">
            <Card className="w-full max-w-[460px] border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
              <CardHeader className="space-y-5 px-6 pb-0 pt-5 sm:px-8 sm:pt-6">
                <div className="flex items-center gap-4 lg:hidden">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <img src={adminLogo} alt="Vayu Packaging Solutions" className="h-full w-full object-contain p-2" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">Admin Portal</p>
                    <p className="text-sm text-slate-500">Vayu Packaging Solutions</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                    Secure sign in
                  </div>
                  <div className="space-y-3">
                    <CardTitle className="text-[34px] font-semibold tracking-[-0.04em] text-slate-950">Welcome back</CardTitle>
                    <CardDescription className="max-w-sm text-[15px] leading-7 text-slate-500">
                      Sign in to continue to the admin workspace and manage business operations with clarity.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-5 pt-5 sm:px-8 sm:pb-6">
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="admin-email" className="text-sm font-medium text-slate-700">
                        Email address
                      </Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="admin-email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="Enter your admin email"
                          className="h-14 rounded-2xl border-slate-200 bg-white pl-11 pr-4 text-[15px] text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="admin-password" className="text-sm font-medium text-slate-700">
                        Password
                      </Label>
                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="admin-password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="Enter your password"
                          className="h-14 rounded-2xl border-slate-200 bg-white pl-11 pr-12 text-[15px] text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-300"
                          required
                        />
                        <button
                          type="button"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-700"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="h-14 w-full rounded-2xl bg-slate-950 text-[15px] font-medium text-white shadow-[0_14px_32px_rgba(15,23,42,0.16)] transition-all hover:bg-slate-900"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? authStageLabels[authStage] ?? "Processing secure sign in" : "Enter Admin Workspace"}
                    </Button>

                    {isSubmitting ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-100 opacity-80" />
                            <span className="relative h-2.5 w-2.5 rounded-full bg-sky-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-900">
                              {authStageLabels[authStage] ?? "Processing secure sign in"}
                            </p>
                            <p className="text-xs leading-5 text-slate-500">
                              Establishing trusted admin session for secure workspace access.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-xs leading-6 text-slate-400">
                        Authorized access for internal business operations.
                      </p>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;