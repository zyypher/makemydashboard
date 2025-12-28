"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onGoogle() {
    setErr(null);
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
    setLoading(false);
  }

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password: pw }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setLoading(false);
      setErr(data?.message || "Unable to create account.");
      return;
    }

    // auto login
    const login = await signIn("credentials", {
      email,
      password: pw,
      redirect: false,
      callbackUrl: "/",
    });

    setLoading(false);

    if (!login || login.error) {
      router.push("/login");
      return;
    }

    router.push(login.url ?? "/");
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left panel */}
        <div className="relative hidden overflow-hidden bg-muted/30 lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/20 via-muted/40 to-background" />
          <div className="relative flex h-full items-center justify-center p-12">
            <div className="w-full max-w-xl">
              <div className="rounded-2xl border bg-card/60 p-10 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/40">
                <div className="text-sm font-medium text-muted-foreground">Get started</div>
                <div className="mt-4 space-y-3">
                  <div className="h-10 w-56 rounded-lg bg-muted" />
                  <div className="h-24 rounded-xl bg-muted" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-24 rounded-xl bg-muted" />
                    <div className="h-24 rounded-xl bg-muted" />
                  </div>
                </div>
                <div className="mt-6 text-xs text-muted-foreground">
                  Create dashboards people will love.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right card */}
        <div className="flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-md">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">Create your account</CardTitle>
                <CardDescription>
                  Use Google or email/password. You can change later.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full justify-center gap-2"
                  onClick={onGoogle}
                  disabled={loading}
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-muted">
                    G
                  </span>
                  Continue with Google
                </Button>

                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <Separator className="flex-1" />
                </div>

                <form onSubmit={onSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name (optional)</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Work email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pw">Password</Label>
                    <div className="relative">
                      <Input
                        id="pw"
                        type={showPw ? "text" : "password"}
                        placeholder="At least 8 characters"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
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

                  {err ? (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {err}
                    </div>
                  ) : null}

                  <Button type="submit" className="h-11 w-full" disabled={loading}>
                    Create account
                  </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Sign in
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
