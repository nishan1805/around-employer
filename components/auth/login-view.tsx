"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import {
  OTP_DEMO_CODE,
  OTP_LENGTH,
  OTP_LOCKOUT_SECONDS,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "@/src/config/policy";

export function LoginView({ state }: { state: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState("9876543210");
  const [code, setCode] = useState(state === "default" ? "" : "482913");
  const [phase, setPhase] = useState(state === "default" ? "idle" : state);
  const [cooldown, setCooldown] = useState(OTP_RESEND_COOLDOWN_SECONDS);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (cooldown <= 0 || phase === "idle") return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown, phase]);

  function verify() {
    if (code.length < OTP_LENGTH) return;
    setPhase("verifying");
    window.setTimeout(() => {
      if (state === "network" || phone.endsWith("0000")) {
        setPhase("network");
        return;
      }
      if (state === "suspended") {
        setPhase("suspended");
        return;
      }
      if (code !== OTP_DEMO_CODE) {
        const next = attempts + 1;
        setAttempts(next);
        setPhase(next >= OTP_MAX_ATTEMPTS ? "locked" : "incorrect");
        return;
      }
      router.push("/");
    }, 500);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background-secondary px-16">
      <section className="w-full max-w-[480px] rounded-lg border border-border-default bg-white p-32">
        <p className="text-display-small-bold tracking-[-0.04em] text-brand-primary">around</p>
        <h1 className="mt-16 text-subheading-semibold">Employer portal</h1>
        <p className="mt-1 text-body-sm-regular text-text-secondary">Log in with the mobile number you verified.</p>
        <div className="mt-16 flex flex-col gap-2 sm:flex-row sm:items-end">
          <Field label="Mobile number">
            <TextInput value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} />
          </Field>
          <Button onClick={() => { setPhase("code"); setCooldown(OTP_RESEND_COOLDOWN_SECONDS); }}>Send OTP</Button>
        </div>
        <div className="mt-16 flex gap-2">
          {Array.from({ length: OTP_LENGTH }).map((_, index) => (
            <input
              key={index}
              value={code[index] ?? ""}
              inputMode="numeric"
              maxLength={1}
              aria-label={`Digit ${index + 1}`}
              onChange={(event) => {
                const digit = event.target.value.replace(/\D/g, "").slice(-1);
                const chars = code.split("");
                chars[index] = digit;
                setCode(chars.join("").slice(0, OTP_LENGTH));
              }}
              className="h-14 w-48 rounded-sm border border-border-default text-center text-subheading-semibold"
            />
          ))}
        </div>
        <p className="mt-3 text-label-regular text-text-secondary">
          {phase === "incorrect" ? "That code is incorrect." : null}
          {phase === "expired" ? "This code has expired." : null}
          {phase === "locked" ? `Locked for ${Math.round(OTP_LOCKOUT_SECONDS / 60)} minutes after ${OTP_MAX_ATTEMPTS} attempts.` : null}
          {phase === "network" ? "Network error. Try again." : null}
          {phase === "suspended" ? "This account is suspended. Contact support." : null}
          {phase === "verifying" ? "Verifying…" : null}
          {phase !== "incorrect" && phase !== "expired" && phase !== "locked" && phase !== "network" && phase !== "suspended" && phase !== "verifying"
            ? cooldown > 0 ? `Resend OTP in 0:${String(cooldown).padStart(2, "0")}` : "You can resend the code."
            : null}
        </p>
        <Button className="mt-16 w-full" disabled={code.length < OTP_LENGTH || phase === "locked" || phase === "verifying"} onClick={verify}>
          {phase === "verifying" ? "Verifying…" : "Log in"}
        </Button>
        <p className="mt-16 text-center text-body-sm-regular">
          <Link href="/verification" className="font-semibold text-brand-primary">Register your business</Link>
        </p>
        <p className="mt-2 text-center text-label-regular text-text-tertiary">Demo code {OTP_DEMO_CODE}</p>
      </section>
    </main>
  );
}
