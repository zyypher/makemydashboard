"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function LoginClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const callbackUrl = useMemo(() => sp.get("from") || "/", [sp]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onGoogle() {
    setErr(null);
    setLoading(true);
    await signIn("google", { callbackUrl });
    setLoading(false);
  }

  async function onEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (!res || res.error) {
      setErr("Invalid email or password.");
      return;
    }

    router.push(res.url ?? callbackUrl);
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left: Materio-style illustration panel */}
        <div className="relative hidden overflow-hidden bg-muted/30 lg:block">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/20 via-muted/40 to-background" />
            <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="relative flex h-full items-center justify-center p-12">
            <div className="w-full max-w-xl">
              <div className="rounded-2xl border bg-card/60 p-10 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/40">
                <div className="text-sm font-medium text-muted-foreground">Preview</div>
                <div className="mt-4 space-y-3">
                  <div className="h-10 w-56 rounded-lg bg-muted" />
                  <div className="h-24 rounded-xl bg-muted" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-24 rounded-xl bg-muted" />
                    <div className="h-24 rounded-xl bg-muted" />
                  </div>
                </div>
                <div className="mt-6 text-xs text-muted-foreground">
                  Clean, colorful dashboards — powered by Tailwind + shadcn.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Auth card */}
        <div className="flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-md">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">Welcome back 👋</CardTitle>
                <CardDescription>Sign in to your account to continue.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <Button
                  type="button"
                  onClick={onGoogle}
                  disabled={loading}
                  className="
                    h-11 w-full cursor-pointer justify-center gap-3
                    border border-border bg-white text-foreground
                    hover:bg-gray-50 active:bg-gray-100
                    transition
                  "
                >
                  {/* Google logo */}
                  <span className="flex h-5 w-5 items-center justify-center">
                    <svg viewBox="0 0 48 48" className="h-5 w-5">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.64 0 6.59 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.5 24c0-1.64-.15-3.21-.43-4.73H24v9.02h12.7c-.55 2.88-2.17 5.32-4.6 6.97l7.05 5.48C43.97 36.29 46.5 30.68 46.5 24z" />
                      <path fill="#FBBC05" d="M10.54 28.59c-.48-1.44-.76-2.97-.76-4.59s.27-3.15.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.79l-7.05-5.48c-1.96 1.32-4.47 2.1-8.85 2.1-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.59 42.62 14.64 48 24 48z" />
                    </svg>
                  </span>

                  <span className="font-medium">Continue with Google</span>
                </Button>

                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <Separator className="flex-1" />
                </div>

                <form onSubmit={onEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete={remember ? "email" : "off"}
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="#" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>

                    <div className="relative">
                      <Input
                        id="password"
                        type={showPw ? "text" : "password"}
                        autoComplete={remember ? "current-password" : "off"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        aria-label="Toggle password"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPw((v) => !v)}
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                      <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
                      Remember me
                    </label>

                    <Link href="/signup" className="text-sm text-primary hover:underline">
                      Create an account
                    </Link>
                  </div>

                  {err ? (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {err}
                    </div>
                  ) : null}

                  <Button type="submit" className="h-11 w-full" disabled={loading}>
                    Log In
                  </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                  New here?{" "}
                  <Link href="/signup" className="text-primary hover:underline">
                    Create an account
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              By continuing you agree to our Terms & Privacy Policy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
