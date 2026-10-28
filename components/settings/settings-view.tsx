"use client";

import { Clock, CreditCard, Lock, Megaphone, Sun, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, SelectInput, TextInput } from "@/components/ui/field";
import { SettingsTabs } from "@/components/ui/settings-tabs";
import { usePortal } from "@/components/shell/use-portal";
import {
  closeEmployerAccount,
  loadSettings,
  removeTeamMember,
  resendInvite,
  saveAccount,
  saveNotificationPrefs,
  sendInvite,
  updateTeamRole,
} from "@/lib/api/settings";
import {
  ACCOUNT_CLOSURE,
  DAILY_SUMMARY_DEFAULT_TIME,
  EXPIRY_REMINDER_DEFAULT,
  OTP_DEMO_CODE,
  OTP_LENGTH,
  TEAM_ACCESS,
} from "@/src/config/policy";
import type { AccountSettings, NotificationPrefs, TeamMember, TeamRole } from "@/lib/types";

type Tab = "account" | "team" | "notifications";
type SaveState = "idle" | "saving" | "saved" | "error";

const ROLES: TeamRole[] = ["Owner", "Hiring manager", "Recruiter"];

const SEND_TIMES = [DAILY_SUMMARY_DEFAULT_TIME, "8:00 AM", "10:00 AM", "6:00 PM"];
const REMIND_OPTIONS = [EXPIRY_REMINDER_DEFAULT, "1 day before expiry", "7 days before expiry"];

function tabFromState(state: string): Tab {
  if (state.startsWith("team")) return "team";
  if (state.startsWith("notification") || state.startsWith("whatsapp")) return "notifications";
  return "account";
}

export function SettingsView() {
  const { state, account, setSettings } = usePortal();
  const suspended = state === "suspended" || account === "Suspended";
  const [tab, setTab] = useState<Tab>(tabFromState(state));
  const [savedAccount, setSavedAccount] = useState<AccountSettings | null>(null);
  const [draft, setDraft] = useState<AccountSettings | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [accountStatus, setAccountStatus] = useState<SaveState>(statusFrom(state, "account"));
  const [accountError, setAccountError] = useState(state === "account-error" ? "Could not save your account. Nothing was changed." : "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>(
    state === "account-invalid" ? { name: "Enter your name.", email: "Enter a valid email address." } : {},
  );
  const [otp, setOtp] = useState<"phone" | "whatsapp" | null>(
    state === "change-number" || state === "change-number-error" ? "phone" : state.startsWith("whatsapp") ? "whatsapp" : null,
  );
  const [otpError, setOtpError] = useState(state === "change-number-error" || state === "whatsapp-failed");
  const [closeOpen, setCloseOpen] = useState(state === "close-confirm" || state === "close-unavailable");
  const [closeNote, setCloseNote] = useState(state === "close-unavailable" ? "Closing an account is unavailable. The mock API does not support it." : "");
  const [menuFor, setMenuFor] = useState<string | null>(state === "team-menu" ? "tm-priya" : state === "team-pending-menu" ? "tm-neha" : null);
  const [confirm, setConfirm] = useState<{ id: string; kind: "remove" | "cancel" } | null>(state === "team-remove-confirm" ? { id: "tm-priya", kind: "remove" } : null);
  const [roleEdit, setRoleEdit] = useState<TeamMember | null>(null);
  const [invite, setInvite] = useState({ name: "", email: "", role: "Recruiter" as TeamRole });
  const [inviteErrors, setInviteErrors] = useState<Record<string, string>>(
    state === "team-invite-invalid" ? { name: "Enter a name.", email: "Enter a valid email." } : {},
  );
  const [inviteStatus, setInviteStatus] = useState<SaveState>(
    state === "team-invite-submitting" ? "saving" : state === "team-invite-success" ? "saved" : state === "team-invite-error" ? "error" : "idle",
  );
  const [prefStatus, setPrefStatus] = useState<SaveState>(statusFrom(state, "notifications"));
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setTab(tabFromState(state));
  }, [state]);

  useEffect(() => {
    let cancel = false;
    loadSettings().then((loaded) => {
      if (cancel) return;
      setSavedAccount(loaded.account);
      setDraft(loaded.account);
      setTeam(loaded.team);
      setPrefs(loaded.prefs);
      setSettings(loaded.account);
    });
    return () => {
      cancel = true;
    };
  }, [setSettings]);

  const dirty = useMemo(() => {
    if (!draft || !savedAccount) return state === "account-dirty";
    return draft.name !== savedAccount.name || draft.email !== savedAccount.email || draft.phone !== savedAccount.phone;
  }, [draft, savedAccount, state]);

  async function onSaveAccount() {
    if (!draft) return;
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) next.email = "Enter a valid email address.";
    if (draft.phone.replace(/\D/g, "").length < 10) next.phone = "Enter a mobile number.";
    setFieldErrors(next);
    if (Object.keys(next).length) return;
    setAccountStatus("saving");
    setAccountError("");
    try {
      const saved = await saveAccount(
        { name: draft.name.trim(), email: draft.email.trim(), phone: draft.phone, phoneVerified: draft.phoneVerified },
        { fail: state === "account-error" },
      );
      setSavedAccount(saved);
      setDraft(saved);
      setSettings(saved);
      setAccountStatus("saved");
    } catch {
      setAccountStatus("error");
            setAccountError("Could not save your account. Nothing was changed.");
    }
  }

  async function persistPrefs(next: NotificationPrefs, fail = false) {
    setPrefs(next);
    setPrefStatus("saving");
    try {
      const saved = await saveNotificationPrefs(next, { fail });
      setPrefs(saved);
      if (draft) setDraft({ ...draft, prefs: saved });
      setPrefStatus("saved");
    } catch {
      setPrefStatus("error");
    }
  }

  if (!draft || !prefs) {
    return <div className="px-16 py-6 text-body-sm-regular text-text-secondary sm:px-32">Loading settings…</div>;
  }

  return (
    <div className="mx-auto max-w-[760px] px-16 py-6 sm:px-32">
      <h1 className="text-subheading-semibold">Settings</h1>
      <p className="mt-1 text-body-sm-regular text-text-secondary">Manage your account, team access and notifications.</p>
      {suspended ? (
        <p className="mt-16 rounded-md bg-error-error-50 px-16 py-3 text-body-sm-regular text-error-default">
          This account is suspended. Saving, invites, and notification changes are locked. This is separate from company verification.
        </p>
      ) : null}
      <div className="mt-6">
        <SettingsTabs value={tab} onChange={setTab} />
      </div>

      {tab === "account" ? (
        <div className="mt-5 space-y-16">
          <section className="rounded-lg border border-border-default bg-white p-5">
            <h2 className="text-body-semibold">Personal account</h2>
            <div className="mt-16 space-y-16">
              <Field label="Your name" error={fieldErrors.name}>
                <TextInput aria-label="Your name" value={draft.name} disabled={suspended} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
              </Field>
              <Field label="Role" hint={"Role can't be changed here. Manage team members to assign roles."}>
                <div className="relative">
                  <TextInput aria-label="Role" value={draft.role} readOnly className="bg-grey-grey-100 text-text-disabled" />
                  <Lock size={16} className="absolute top-1/2 right-3 -translate-y-1/2 text-text-secondary" aria-hidden />
                </div>
              </Field>
              <Field label="Email address" error={fieldErrors.email}>
                <div className="flex flex-wrap items-center gap-2">
                  <TextInput className="min-w-[220px] flex-1" aria-label="Email address" value={draft.email} disabled={suspended} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
                  {draft.emailVerified ? <Verified /> : null}
                </div>
              </Field>
              <Field label="Phone number" error={fieldErrors.phone}>
                <div className="flex flex-wrap items-center gap-2">
                  <TextInput className="min-w-[220px] flex-1" aria-label="Phone number" value={draft.phone} readOnly />
                  {draft.phoneVerified ? <Verified /> : null}
                  <button type="button" className="text-body-sm-semibold text-brand-primary" disabled={suspended} onClick={() => { setOtp("phone"); setOtpError(false); }}>
                    Change number
                  </button>
                </div>
              </Field>
              <div className="rounded-md bg-info-info-50 px-16 py-3 text-body-sm-regular text-text-primary">
                You log in with OTP on your verified mobile number. No password is set for this account.
              </div>
              {accountStatus === "saved" ? <p className="text-body-sm-regular text-success-success-700">Account details saved.</p> : null}
              {accountError ? <p className="text-body-sm-regular text-error-default">{accountError}</p> : null}
              <Button disabled={!dirty || suspended || accountStatus === "saving"} onClick={onSaveAccount}>
                {accountStatus === "saving" || state === "account-saving" ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </section>
          <section className="rounded-lg border border-error-default bg-error-error-50 p-6">
            <h2 className="text-body-semibold">Danger zone</h2>
            <p className="mt-1 text-body-sm-regular text-text-secondary">Close your employer account.</p>
            <p className="text-label-medium text-text-secondary">Consequences: {ACCOUNT_CLOSURE.note}</p>
            {closeNote ? <p className="mt-3 text-body-sm-regular text-error-default">{closeNote}</p> : null}
            <Button className="mt-16" variant="outline" onClick={() => { setCloseOpen(true); setCloseNote(""); }}>
              <span className="text-error-default">Close employer account</span>
            </Button>
          </section>
        </div>
      ) : null}

      {tab === "team" ? (
        <div className="mt-5 space-y-16">
          <section className="rounded-lg border border-border-default bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-body-semibold">Team members</h2>
                <p className="text-body-sm-regular text-text-secondary">Invite people to help you manage jobs and applicants.</p>
              </div>
              <Button onClick={() => document.getElementById("invite-name")?.focus()}>+ Invite member</Button>
            </div>
            <div className="mt-16 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-body-sm-regular">
                <thead className="text-label-medium text-text-secondary">
                  <tr>
                    {["Name", "Email", "Role", "Status", ""].map((label) => (
                      <th key={label} className="py-2 font-medium">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {team.map((member) => (
                    <tr key={member.id} className="border-t border-border-default">
                      <td className="py-3">
                        <span className="flex items-center gap-2">
                          <span className="flex h-32 w-32 items-center justify-center rounded-full bg-primary-primary-50 text-label-semibold text-brand-primary">{member.initials}</span>
                          <span className="font-medium">{member.name}</span>
                          {member.you ? <span className="rounded-full bg-grey-grey-100 px-2 py-0.5 text-label-medium text-text-secondary">You</span> : null}
                        </span>
                      </td>
                      <td className="py-3 text-text-secondary">{member.email}</td>
                      <td className="py-3">
                        <span className="inline-flex rounded-full bg-primary-primary-50 px-2 py-0.5 text-label-medium text-brand-primary">{member.role}</span>
                        <p className="mt-1 text-label-regular text-text-secondary">{TEAM_ACCESS[member.role]}</p>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-label-medium ${member.status === "Active" ? "bg-success-success-50 text-success-success-700" : "bg-warning-warning-50 text-warning-warning-700"}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="relative py-3 text-right">
                        {member.you || member.role === "Owner" ? null : (
                          <button aria-label={`Actions for ${member.name}`} className="rounded-md px-2 py-1" onClick={() => setMenuFor(menuFor === member.id ? null : member.id)}>
                            ···
                          </button>
                        )}
                        {menuFor === member.id ? (
                          <div className="absolute right-0 z-20 w-44 rounded-md border border-border-default bg-white py-1 text-left shadow-lg">
                            {member.status === "Pending" ? (
                              <>
                                <button className="block w-full px-3 py-2 text-left text-body-sm-regular hover:bg-grey-grey-100" onClick={() => { void resendInvite(member.id).then(setTeam); setMenuFor(null); setNotice(`Resend recorded for ${member.email}. The invite is still Pending.`); }}>Resend invite</button>
                                <button className="block w-full px-3 py-2 text-left text-body-sm-regular text-error-default hover:bg-grey-grey-100" onClick={() => { setConfirm({ id: member.id, kind: "cancel" }); setMenuFor(null); }}>Cancel invite</button>
                              </>
                            ) : (
                              <>
                                <button className="block w-full px-3 py-2 text-left text-body-sm-regular hover:bg-grey-grey-100" onClick={() => { setRoleEdit(member); setMenuFor(null); }}>Edit role</button>
                                <button className="block w-full px-3 py-2 text-left text-body-sm-regular text-error-default hover:bg-grey-grey-100" onClick={() => { setConfirm({ id: member.id, kind: "remove" }); setMenuFor(null); }}>Remove</button>
                              </>
                            )}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {notice ? <p className="mt-3 text-body-sm-regular text-text-secondary">{notice}</p> : null}
            <div className="mt-16 rounded-md bg-background-secondary px-16 py-3 text-body-sm-regular text-text-secondary">
              Role permissions: Only owners can change roles, manage branch access, and remove team members.{" "}
              <span className="text-text-tertiary" title="TODO: a roles help page does not exist yet">Learn about roles</span>
            </div>
          </section>
          <section className="rounded-lg border border-border-default bg-white p-5">
            <h2 className="text-body-semibold">Invite a new member</h2>
            <div className="mt-16 grid gap-3 sm:grid-cols-2">
              <Field label="Name" error={inviteErrors.name}>
                <TextInput id="invite-name" value={invite.name} disabled={suspended} onChange={(event) => setInvite({ ...invite, name: event.target.value })} />
              </Field>
              <Field label="Email" error={inviteErrors.email}>
                <TextInput type="email" value={invite.email} disabled={suspended} onChange={(event) => setInvite({ ...invite, email: event.target.value })} />
              </Field>
              <Field label="Role">
                <SelectInput value={invite.role} disabled={suspended} onChange={(event) => setInvite({ ...invite, role: event.target.value as TeamRole })}>
                  {ROLES.filter((role) => role !== "Owner").map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </SelectInput>
              </Field>
            </div>
            {inviteStatus === "saved" ? <p className="mt-3 text-body-sm-regular text-success-success-700">Invite saved as Pending. It has not been delivered.</p> : null}
            {inviteStatus === "error" ? <p className="mt-3 text-body-sm-regular text-error-default">Could not send the invite. The list was not changed.</p> : null}
            <Button
              className="mt-16"
              disabled={suspended || inviteStatus === "saving"}
              onClick={async () => {
                const errors: Record<string, string> = {};
                if (!invite.name.trim()) errors.name = "Enter a name.";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invite.email)) errors.email = "Enter a valid email.";
                setInviteErrors(errors);
                if (Object.keys(errors).length) return;
                setInviteStatus("saving");
                try {
                  await sendInvite({ ...invite, fail: state === "team-invite-error" });
                  setTeam(await loadSettings().then((loaded) => loaded.team));
                  setInvite({ name: "", email: "", role: "Recruiter" });
                  setInviteStatus("saved");
                } catch {
                  setInviteStatus("error");
                }
              }}
            >
              {inviteStatus === "saving" ? "Sending…" : "Send invite"}
            </Button>
          </section>
        </div>
      ) : null}

      {tab === "notifications" ? (
        <section className="mt-5 rounded-lg border border-border-default bg-white p-5">
          <h2 className="text-body-semibold">Notification preferences</h2>
          <p className="mt-1 text-label-regular text-text-tertiary">
            TODO: channel availability is undecided (email, in-app, WhatsApp). Toggles are saved on this device only.
          </p>
          {prefStatus === "saving" ? <p className="mt-3 text-body-sm-regular text-text-secondary">Saving…</p> : null}
          {prefStatus === "saved" ? <p className="mt-3 text-body-sm-regular text-success-success-700">Your preferences are saved automatically.</p> : null}
          {prefStatus === "error" ? <p className="mt-3 text-body-sm-regular text-error-default">Could not save preferences. The last successful values are still stored.</p> : null}
          <PrefRow icon={<UserPlus size={16} />} title="New applicant" description="When someone applies to a job.">
            <Toggle label="Email" checked={prefs.newApplicant.email} disabled={suspended} onChange={(email) => persistPrefs({ ...prefs, newApplicant: { ...prefs.newApplicant, email } }, state === "notifications-error")} />
            <Toggle label="In-app" checked={prefs.newApplicant.inApp} disabled={suspended} onChange={(inApp) => persistPrefs({ ...prefs, newApplicant: { ...prefs.newApplicant, inApp } })} />
          </PrefRow>
          <PrefRow icon={<Sun size={16} />} title="Daily summary" description="One summary of new applicants.">
            <Toggle label="Email" checked={prefs.dailySummary.email} disabled={suspended} onChange={(email) => persistPrefs({ ...prefs, dailySummary: { ...prefs.dailySummary, email } })} />
            <label className="text-label-medium text-text-secondary">
              Send at
              <SelectInput className="mt-1" aria-label="Send at" value={prefs.dailySummary.sendAt} disabled={suspended} onChange={(event) => persistPrefs({ ...prefs, dailySummary: { ...prefs.dailySummary, sendAt: event.target.value } })}>
                {SEND_TIMES.map((time) => <option key={time}>{time}</option>)}
              </SelectInput>
            </label>
          </PrefRow>
          <PrefRow icon={<Megaphone size={16} />} title="WhatsApp alerts" description="Add and verify your WhatsApp number to enable alerts.">
            <Toggle label="WhatsApp" checked={prefs.whatsapp.verified && prefs.whatsapp.enabled} disabled={suspended || !prefs.whatsapp.verified} onChange={(enabled) => persistPrefs({ ...prefs, whatsapp: { ...prefs.whatsapp, enabled } })} />
            <Button variant="outline" size="sm" disabled={suspended} onClick={() => { setOtp("whatsapp"); setOtpError(state === "whatsapp-failed"); }}>Add number</Button>
            {prefs.whatsapp.verified ? <Verified /> : null}
          </PrefRow>
          <PrefRow icon={<Clock size={16} />} title="Job expiry reminders" description="Before a live job expires.">
            <Toggle label="Email" checked={prefs.expiryReminders.email} disabled={suspended} onChange={(email) => persistPrefs({ ...prefs, expiryReminders: { ...prefs.expiryReminders, email } })} />
            <Toggle label="In-app" checked={prefs.expiryReminders.inApp} disabled={suspended} onChange={(inApp) => persistPrefs({ ...prefs, expiryReminders: { ...prefs.expiryReminders, inApp } })} />
            <label className="text-label-medium text-text-secondary">
              Remind me
              <SelectInput className="mt-1" aria-label="Remind me" value={prefs.expiryReminders.remindMe} disabled={suspended} onChange={(event) => persistPrefs({ ...prefs, expiryReminders: { ...prefs.expiryReminders, remindMe: event.target.value } })}>
                {REMIND_OPTIONS.map((option) => <option key={option}>{option}</option>)}
              </SelectInput>
            </label>
          </PrefRow>
          <PrefRow icon={<Megaphone size={16} />} title="Product updates" description="Changes to the employer portal.">
            <Toggle label="Email" checked={prefs.productUpdates.email} disabled={suspended} onChange={(email) => persistPrefs({ ...prefs, productUpdates: { ...prefs.productUpdates, email } })} />
            <Toggle label="In-app" checked={prefs.productUpdates.inApp} disabled={suspended} onChange={(inApp) => persistPrefs({ ...prefs, productUpdates: { ...prefs.productUpdates, inApp } })} />
          </PrefRow>
          <PrefRow icon={<CreditCard size={16} />} title="Billing and payments" description="Credits, invoices, and plan changes.">
            <Toggle label="Email" checked={prefs.billing.email} disabled={suspended} onChange={(email) => persistPrefs({ ...prefs, billing: { ...prefs.billing, email } })} />
            <Toggle label="In-app" checked={prefs.billing.inApp} disabled={suspended} onChange={(inApp) => persistPrefs({ ...prefs, billing: { ...prefs.billing, inApp } })} />
          </PrefRow>
        </section>
      ) : null}

      {otp ? (
        <OtpDialog
          title={otp === "phone" ? "Change mobile number" : "Verify WhatsApp number"}
          failed={otpError || state === "whatsapp-failed"}
          onClose={() => setOtp(null)}
          onVerified={(phone) => {
            if (otp === "phone") {
              setDraft({ ...draft, phone, phoneVerified: true });
            } else {
              const next = { ...prefs, whatsapp: { enabled: true, phone, verified: true } };
              void persistPrefs(next);
            }
            setOtp(null);
          }}
        />
      ) : null}

      <ConfirmDialog
        open={closeOpen}
        title="Close employer account?"
        tone="danger"
        confirmLabel="Close account"
        body={
          <div>
            <p>Confirm you want to close {draft.companyName}.</p>
            <p className="mt-2">Consequences: {ACCOUNT_CLOSURE.note}</p>
          </div>
        }
        onCancel={() => setCloseOpen(false)}
        onConfirm={() => {
          void closeEmployerAccount().then((result) => {
            setCloseOpen(false);
            if (!result.ok || !ACCOUNT_CLOSURE.supportedByMockApi) {
              setCloseNote("Closing an account is unavailable. The mock API does not support it.");
            }
          });
        }}
      />
      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.kind === "cancel" ? "Cancel this invite?" : "Remove this member?"}
        tone="danger"
        confirmLabel={confirm?.kind === "cancel" ? "Cancel invite" : "Remove"}
        body="This updates the team list in the mock store."
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return;
          void removeTeamMember(confirm.id).then(setTeam);
          setConfirm(null);
        }}
      />
      <ConfirmDialog
        open={Boolean(roleEdit)}
        title="Edit role"
        confirmLabel="Save role"
        body={
          roleEdit ? (
            <SelectInput aria-label="Role" defaultValue={roleEdit.role} id="role-edit" onChange={(event) => setRoleEdit({ ...roleEdit, role: event.target.value as TeamRole })}>
              {ROLES.filter((role) => role !== "Owner").map((role) => <option key={role}>{role}</option>)}
            </SelectInput>
          ) : null
        }
        onCancel={() => setRoleEdit(null)}
        onConfirm={() => {
          if (!roleEdit) return;
          void updateTeamRole(roleEdit.id, roleEdit.role).then(setTeam);
          setRoleEdit(null);
        }}
      />
    </div>
  );
}

function statusFrom(state: string, kind: "account" | "notifications"): SaveState {
  if (kind === "account") {
    if (state === "account-saving") return "saving";
    if (state === "account-saved") return "saved";
    if (state === "account-error") return "error";
  }
  if (state === "notifications-saving") return "saving";
  if (state === "notifications-saved") return "saved";
  if (state === "notifications-error") return "error";
  return "idle";
}

function Verified() {
  return <span className="inline-flex h-6 items-center rounded-full bg-success-success-50 px-2 text-label-medium text-success-success-700">Verified</span>;
}

function Toggle({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-label-medium text-text-secondary">
      {label}
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 rounded-full ${checked ? "bg-brand-primary" : "bg-grey-grey-300"} disabled:opacity-50`}
      >
        <span className={`absolute top-1 h-16 w-16 rounded-full bg-white ${checked ? "left-5" : "left-1"}`} />
      </button>
    </label>
  );
}

function PrefRow({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children: ReactNode }) {
  return (
    <div className="mt-16 flex flex-col gap-3 border-t border-border-default pt-16 sm:flex-row sm:items-start">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-primary-50 text-brand-primary">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-body-sm-semibold">{title}</p>
        <p className="text-body-sm-regular text-text-secondary">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function OtpDialog({ title, failed, onClose, onVerified }: { title: string; failed: boolean; onClose: () => void; onVerified: (phone: string) => void }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState(failed ? "Could not verify that number. Try again." : "");
  const [phase, setPhase] = useState<"idle" | "verifying">(failed ? "idle" : "idle");
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-16">
      <div className="w-full max-w-[420px] rounded-md bg-white p-5">
        <div className="flex items-center gap-3">
          <h2 className="flex-1 text-subheading-semibold">{title}</h2>
          <button aria-label="Close" onClick={onClose}><X size={18} /></button>
        </div>
        <p className="mt-2 text-body-sm-regular text-text-secondary">Enter the mobile number, then the {OTP_LENGTH}-digit code. Demo code {OTP_DEMO_CODE}.</p>
        <TextInput className="mt-3" aria-label="New mobile number" value={phone} onChange={(event) => setPhone(event.target.value)} />
        <div className="mt-3 flex gap-2">
          {Array.from({ length: OTP_LENGTH }).map((_, index) => (
            <input
              key={index}
              aria-label={`Digit ${index + 1}`}
              inputMode="numeric"
              maxLength={1}
              value={code[index] ?? ""}
              onChange={(event) => {
                const digit = event.target.value.replace(/\D/g, "").slice(-1);
                const chars = code.split("");
                chars[index] = digit;
                setCode(chars.join("").slice(0, OTP_LENGTH));
              }}
              className="h-48 w-10 rounded-sm border border-border-default text-center text-subheading-semibold"
            />
          ))}
        </div>
        {error ? <p className="mt-2 text-body-sm-regular text-error-default">{error}</p> : null}
        <Button
          className="mt-16 w-full"
          disabled={code.length < OTP_LENGTH || phase === "verifying"}
          onClick={() => {
            setPhase("verifying");
            window.setTimeout(() => {
              if (failed || phone.endsWith("0000") || code !== OTP_DEMO_CODE) {
                setError("Could not verify that number. Try again.");
                setPhase("idle");
                return;
              }
              onVerified(phone || "+91 98XXX XXXXX");
            }, 400);
          }}
        >
          {phase === "verifying" ? "Verifying…" : "Verify"}
        </Button>
      </div>
    </div>
  );
}
