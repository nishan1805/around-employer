"use client";

import { Calendar, Clock, FileText, Info, Lock, Mail, Megaphone, MessageCircle, MoreVertical, Phone, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, SelectInput, TextInput } from "@/components/ui/field";
import { SettingsTabs } from "@/components/ui/settings-tabs";
import { Toggle } from "@/components/ui/toggle";
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
import { cn } from "@/lib/utils";
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
  const [closeNote, setCloseNote] = useState("");
  const [menuFor, setMenuFor] = useState<string | null>(state === "team-menu" ? "tm-priya" : state === "team-pending-menu" ? "tm-neha" : null);
  const [confirm, setConfirm] = useState<{ id: string; kind: "remove" | "cancel" } | null>(state === "team-remove-confirm" ? { id: "tm-priya", kind: "remove" } : null);
  const [roleEdit, setRoleEdit] = useState<TeamMember | null>(null);
  const [invite, setInvite] = useState<{ name: string; email: string; role: TeamRole | "" }>({ name: "", email: "", role: "" });
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
    return (
      state === "account-dirty" ||
      draft.name !== savedAccount.name ||
      draft.email !== savedAccount.email ||
      draft.phone !== savedAccount.phone
    );
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
    return <div className="text-body-sm-regular text-text-secondary">Loading settings…</div>;
  }

  return (
    <div>
      <h1 className="text-display-small-semibold">Settings</h1>
      <p className="mt-[4px] text-body-sm-regular text-text-secondary">Manage your account, team access and notifications.</p>
      {suspended ? (
        <p className="mt-[16px] rounded-md bg-error-error-50 px-[16px] py-[12px] text-body-sm-regular text-error-default">
          This account is suspended. Saving, invites, and notification changes are locked. This is separate from company verification.
        </p>
      ) : null}
      <div className="mt-[24px]">
        <SettingsTabs value={tab} onChange={setTab} />
      </div>

      {tab === "account" ? (
        <div id="settings-panel-account" role="tabpanel" aria-labelledby="settings-tab-account" className="mt-[24px] space-y-[24px]">
          <section className="rounded-lg border border-border-default bg-white p-[24px]">
            <h2 className="text-subheading-semibold">Personal account</h2>
            <p className="mt-[4px] text-body-sm-regular text-text-secondary">These details are used to manage your access and receive important updates.</p>
            <div className="mt-[20px] grid gap-[24px] md:grid-cols-2">
              <Field label="Your name" error={fieldErrors.name}>
                <TextInput aria-label="Your name" value={draft.name} disabled={suspended} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
              </Field>
              <Field label="Role" hint={"Role can't be changed here. Manage team members to assign roles."}>
                <div className="relative">
                  <TextInput aria-label="Role" value={draft.role} readOnly className="bg-grey-grey-100 pr-[40px] text-text-disabled" />
                  <Lock size={16} className="absolute top-[14px] right-[12px] text-text-secondary" aria-hidden />
                </div>
              </Field>
              <Field label="Email address" error={fieldErrors.email}>
                <div className="relative">
                  <TextInput className="pr-[24px]" aria-label="Email address" value={draft.email} disabled={suspended} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
                  {draft.emailVerified ? <Verified className="absolute top-[12px] right-[12px]" /> : null}
                </div>
              </Field>
              <div>
                <Field label="Phone number" error={fieldErrors.phone}>
                  <div className="relative">
                    <TextInput className="pr-[24px]" aria-label="Phone number" value={draft.phone} readOnly />
                    {draft.phoneVerified ? <Verified className="absolute top-[12px] right-[12px]" /> : null}
                  </div>
                </Field>
                <div className="mt-[4px] flex justify-end">
                  <button type="button" className="text-body-sm-semibold text-brand-primary" disabled={suspended} onClick={() => { setOtp("phone"); setOtpError(false); }}>
                    Change number
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-[20px] flex flex-col items-stretch gap-[16px] lg:flex-row lg:items-end">
              <div className="min-w-[0px] flex-1">
                <p className="mb-[8px] text-label-medium text-text-secondary">Login method</p>
                <div className="rounded-sm bg-primary-primary-50 px-[12px] py-[12px] text-body-sm-regular text-text-primary">
                  You log in with OTP on your verified mobile number. No password is set for this account.
                </div>
              </div>
              <Button
                className={!dirty ? "bg-grey-grey-100 text-text-disabled hover:bg-grey-grey-100 disabled:opacity-100" : undefined}
                disabled={!dirty || suspended || accountStatus === "saving"}
                onClick={onSaveAccount}
              >
                {accountStatus === "saving" || state === "account-saving" ? "Saving…" : "Save changes"}
              </Button>
            </div>
            {accountStatus === "saved" ? <p className="text-body-sm-regular text-success-success-700">Account details saved.</p> : null}
            {accountError ? <p className="text-body-sm-regular text-error-default">{accountError}</p> : null}
          </section>
          <section className="flex flex-col gap-[16px] rounded-lg border border-error-default bg-error-error-50 p-[24px] sm:flex-row sm:items-center">
            <div className="min-w-[0px] flex-1">
              <h2 className="text-subheading-semibold">Danger zone</h2>
              <p className="mt-[4px] text-body-sm-regular text-text-secondary">Close your employer account.</p>
              <p className="mt-[8px] text-label-medium text-text-secondary">Consequences: <PendingTag /></p>
              {closeNote ? <p className="mt-[8px] text-body-sm-regular text-error-default">{closeNote}</p> : null}
            </div>
            <Button variant="danger" onClick={() => { setCloseOpen(true); setCloseNote(""); }}>Close employer account</Button>
          </section>
        </div>
      ) : null}

      {tab === "team" ? (
        <div id="settings-panel-team" role="tabpanel" aria-labelledby="settings-tab-team" className="mt-[24px] space-y-[24px]">
          <section className="rounded-lg border border-border-default bg-white p-[24px]">
            <div className="flex flex-wrap items-start justify-between gap-[12px]">
              <div>
                <h2 className="text-subheading-semibold">Team members</h2>
                <p className="text-body-sm-regular text-text-secondary">Invite people to help you manage jobs and applicants.</p>
              </div>
              <Button onClick={() => document.getElementById("invite-name")?.focus()}>+ Invite member</Button>
            </div>
            <div className="mt-[16px] overflow-hidden rounded-lg border border-border-default">
              <table className="w-full table-fixed text-left text-body-sm-regular [&_td]:px-[16px] [&_th]:px-[16px]">
                <colgroup>
                  <col className="w-[26%]" />
                  <col className="w-[12%]" />
                  <col className="w-[16%]" />
                  <col className="w-[22%]" />
                  <col className="w-[16%]" />
                  <col className="w-[8%]" />
                </colgroup>
                <thead className="bg-grey-grey-50 text-label-medium text-text-secondary">
                  <tr>
                    <th className="py-[8px] font-medium">Name</th>
                    <th className="py-[8px] font-medium">Email</th>
                    <th className="py-[8px] font-medium">Role</th>
                    <th className="py-[8px] font-medium">
                      <span className="inline-flex items-center gap-[8px] whitespace-nowrap">
                        Access <PendingTag />
                      </span>
                    </th>
                    <th className="py-[8px] font-medium">Status</th>
                    <th className="py-[8px] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((member) => (
                    <tr key={member.id} className="border-t border-border-default">
                      <td className="py-[12px] whitespace-nowrap">
                        <span className="flex items-center gap-[8px] whitespace-nowrap">
                          <span className={`flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full text-label-semibold ${avatarTone(member.id)}`}>{member.initials}</span>
                          <span className="whitespace-nowrap font-medium">{member.name}</span>
                          {member.you ? <span className="shrink-0 whitespace-nowrap rounded-full bg-grey-grey-100 px-[8px] py-[4px] text-label-medium text-text-secondary">You</span> : null}
                        </span>
                      </td>
                      <td className="max-w-[0px] truncate py-[12px] text-text-secondary" title={member.email}>{member.email}</td>
                      <td className="py-[12px]">
                        <span className={`inline-flex whitespace-nowrap rounded-full px-[8px] py-[4px] text-label-medium ${roleTone(member.role)}`}>{member.role}</span>
                      </td>
                      <td className="py-[12px] whitespace-nowrap text-text-secondary">{TEAM_ACCESS[member.role]}</td>
                      <td className="py-[12px]">
                        <span className={`inline-flex whitespace-nowrap rounded-full px-[8px] py-[4px] text-label-medium ${member.status === "Active" ? "bg-success-success-50 text-success-success-700" : "bg-warning-warning-50 text-warning-warning-700"}`}>
                          {member.status === "Active" ? "Active" : "Pending invite"}
                        </span>
                      </td>
                      <td className="relative py-[12px] text-right">
                        {member.you || member.role === "Owner" ? <span className="text-text-tertiary">—</span> : (
                          <button aria-label={`Actions for ${member.name}`} className={`inline-flex h-[32px] w-[32px] items-center justify-center rounded-sm border bg-white ${menuFor === member.id ? "border-brand-primary text-brand-primary" : "border-border-default text-text-secondary"}`} onClick={() => setMenuFor(menuFor === member.id ? null : member.id)}>
                            <MoreVertical size={16} />
                          </button>
                        )}
                        {menuFor === member.id ? (
                          <div className="absolute right-[0px] z-20 w-[176px] rounded-md border border-border-default bg-white py-[4px] text-left shadow-lg">
                            {member.status === "Pending" ? (
                              <>
                                <button className="block w-full px-[12px] py-[8px] text-left text-body-sm-regular hover:bg-grey-grey-100" onClick={() => { void resendInvite(member.id).then(setTeam); setMenuFor(null); setNotice(`Invite resent to ${member.email}.`); }}>Resend invite</button>
                                <button className="block w-full px-[12px] py-[8px] text-left text-body-sm-regular text-error-default hover:bg-grey-grey-100" onClick={() => { setConfirm({ id: member.id, kind: "cancel" }); setMenuFor(null); }}>Cancel invite</button>
                              </>
                            ) : (
                              <>
                                <button className="block w-full px-[12px] py-[8px] text-left text-body-sm-regular hover:bg-grey-grey-100" onClick={() => { setRoleEdit(member); setMenuFor(null); }}>Edit role</button>
                                <button className="block w-full px-[12px] py-[8px] text-left text-body-sm-regular text-error-default hover:bg-grey-grey-100" onClick={() => { setConfirm({ id: member.id, kind: "remove" }); setMenuFor(null); }}>Remove</button>
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
            {notice ? <p className="mt-[12px] text-body-sm-regular text-text-secondary">{notice}</p> : null}
            <div className="mt-[16px] flex items-center gap-[12px] rounded-sm bg-info-info-50 px-[16px] py-[12px]">
              <Info size={20} className="shrink-0 text-information-default" aria-hidden />
              <div className="min-w-[0px] flex-1">
                <p className="text-body-sm-semibold text-text-primary">Role permissions</p>
                <p className="text-body-sm-regular text-text-secondary">Only owners can change roles and remove team members.</p>
              </div>
            </div>
          </section>
          <section className="rounded-lg border border-border-default bg-white p-[24px]">
            <h2 className="text-subheading-semibold">Invite a new member</h2>
            <p className="mt-[4px] text-body-sm-regular text-text-secondary">They&apos;ll get an email with a link to join your team.</p>
            <div className="mt-[16px] flex min-w-[0px] items-start gap-[16px]">
              <div className="min-w-[0px] flex-1">
                <Field label="Name" error={inviteErrors.name}>
                  <TextInput id="invite-name" placeholder="Enter full name" value={invite.name} disabled={suspended} onChange={(event) => setInvite({ ...invite, name: event.target.value })} />
                </Field>
              </div>
              <div className="min-w-[0px] flex-1">
                <Field label="Email address" error={inviteErrors.email}>
                  <TextInput type="email" placeholder="Enter email address" value={invite.email} disabled={suspended} onChange={(event) => setInvite({ ...invite, email: event.target.value })} />
                </Field>
              </div>
              <div className="min-w-[0px] flex-1">
                <Field label="Role" error={inviteErrors.role}>
                  <SelectInput aria-label="Invite role" value={invite.role} disabled={suspended} onChange={(event) => setInvite({ ...invite, role: event.target.value as TeamRole | "" })}>
                    <option value="">Select role</option>
                    {ROLES.filter((role) => role !== "Owner").map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </SelectInput>
                </Field>
              </div>
              <Button
                className="mt-[24px] shrink-0"
                disabled={suspended || inviteStatus === "saving"}
                onClick={async () => {
                  const errors: Record<string, string> = {};
                  if (!invite.name.trim()) errors.name = "Enter a name.";
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invite.email)) errors.email = "Enter a valid email.";
                  if (!invite.role) errors.role = "Select a role.";
                  setInviteErrors(errors);
                  if (Object.keys(errors).length || !invite.role) return;
                  const role = invite.role;
                  setInviteStatus("saving");
                  try {
                    await sendInvite({ name: invite.name, email: invite.email, role, fail: state === "team-invite-error" });
                    setTeam(await loadSettings().then((loaded) => loaded.team));
                    setInvite({ name: "", email: "", role: "" });
                    setInviteStatus("saved");
                  } catch {
                    setInviteStatus("error");
                  }
                }}
              >
                {inviteStatus === "saving" ? "Sending…" : "Send invite"}
              </Button>
            </div>
            {inviteStatus === "saved" ? <p className="mt-[12px] text-body-sm-regular text-success-success-700">Invite saved as pending.</p> : null}
            {inviteStatus === "error" ? <p className="mt-[12px] text-body-sm-regular text-error-default">Could not send the invite. Try again.</p> : null}
          </section>
        </div>
      ) : null}

      {tab === "notifications" ? (
        <section id="settings-panel-notifications" role="tabpanel" className="mt-[24px] rounded-lg border border-border-default bg-white p-[24px]">
          <h2 className="text-subheading-semibold">Notification preferences</h2>
          <p className="mt-[4px] text-body-sm-regular text-text-secondary">Choose how you want to receive updates. You can change these anytime.</p>
          <PrefStatus status={prefStatus} onRetry={() => persistPrefs(prefs, false)} />
          <div className="mt-[16px] divide-y divide-border-default overflow-hidden rounded-lg border border-border-default">
            <PrefRow icon={<Mail size={16} />} iconClass="bg-primary-primary-50 text-brand-primary" title="New applicant" description="Get an email and in-app notification for every new application.">
              <ChannelToggle icon={<Mail size={14} />} row="New applicant" channel="Email" checked={prefs.newApplicant.email} disabled={suspended} onChange={(email) => persistPrefs({ ...prefs, newApplicant: { ...prefs.newApplicant, email } }, state === "notifications-error")} />
              <span className="mx-[4px] hidden h-[20px] w-px bg-border-default sm:inline-block" aria-hidden />
              <ChannelToggle icon={<Phone size={14} />} row="New applicant" channel="In-app" checked={prefs.newApplicant.inApp} disabled={suspended} onChange={(inApp) => persistPrefs({ ...prefs, newApplicant: { ...prefs.newApplicant, inApp } })} />
            </PrefRow>
            <PrefRow icon={<Calendar size={16} />} iconClass="bg-primary-primary-50 text-brand-primary" title="Daily summary" description="Receive one email each morning with new applicants and job performance.">
              <ChannelToggle icon={<Mail size={14} />} row="Daily summary" channel="Email" checked={prefs.dailySummary.email} disabled={suspended} onChange={(email) => persistPrefs({ ...prefs, dailySummary: { ...prefs.dailySummary, email } })} />
              <span className="inline-flex items-center gap-[8px] text-body-sm-regular text-text-secondary">
                Send at
                <SelectInput className="w-[144px]" aria-label="Daily summary send time" value={prefs.dailySummary.sendAt} disabled={suspended} onChange={(event) => persistPrefs({ ...prefs, dailySummary: { ...prefs.dailySummary, sendAt: event.target.value } })}>
                  {SEND_TIMES.map((time) => <option key={time}>{time}</option>)}
                </SelectInput>
                <PendingTag />
              </span>
            </PrefRow>
            <PrefRow
              icon={<MessageCircle size={16} />}
              iconClass="bg-success-success-50 text-success-success-700"
              title="WhatsApp alerts"
              description="Get important updates on your business WhatsApp number."
              note={
                <p className="mt-[12px] flex items-start gap-[8px] rounded-sm bg-info-info-50 px-[12px] py-[12px] text-body-sm-regular text-text-primary">
                  <Info size={16} className="mt-[2px] shrink-0 text-information-default" aria-hidden />
                  Add and verify your WhatsApp number to enable alerts. You&apos;ll receive a verification code.
                </p>
              }
            >
              <ChannelToggle icon={<MessageCircle size={14} />} row="WhatsApp alerts" channel="WhatsApp" checked={prefs.whatsapp.verified && prefs.whatsapp.enabled} disabled={suspended || !prefs.whatsapp.verified} onChange={(enabled) => persistPrefs({ ...prefs, whatsapp: { ...prefs.whatsapp, enabled } })} />
              <Button variant="outline" size="sm" disabled={suspended} onClick={() => { setOtp("whatsapp"); setOtpError(state === "whatsapp-failed"); }}>Add number</Button>
            </PrefRow>
            <PrefRow
              icon={<Clock size={16} />}
              iconClass="bg-primary-primary-50 text-brand-primary"
              title="Job expiry reminders"
              description="Get notified before your jobs expire so you can renew them on time."
              extra={
                <div className="mt-[12px] flex flex-wrap items-center gap-[8px] text-body-sm-regular text-text-secondary">
                  Remind me
                  <SelectInput className="w-[192px]" aria-label="Job expiry reminder" value={prefs.expiryReminders.remindMe} disabled={suspended} onChange={(event) => persistPrefs({ ...prefs, expiryReminders: { ...prefs.expiryReminders, remindMe: event.target.value } })}>
                    {REMIND_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </SelectInput>
                  <PendingTag />
                </div>
              }
            >
              <ChannelToggle icon={<Mail size={14} />} row="Job expiry reminders" channel="Email" checked={prefs.expiryReminders.email} disabled={suspended} onChange={(email) => persistPrefs({ ...prefs, expiryReminders: { ...prefs.expiryReminders, email } })} />
              <span className="mx-[4px] hidden h-[20px] w-px bg-border-default sm:inline-block" aria-hidden />
              <ChannelToggle icon={<Phone size={14} />} row="Job expiry reminders" channel="In-app" checked={prefs.expiryReminders.inApp} disabled={suspended} onChange={(inApp) => persistPrefs({ ...prefs, expiryReminders: { ...prefs.expiryReminders, inApp } })} />
            </PrefRow>
            <PrefRow icon={<Megaphone size={16} />} iconClass="bg-features-features-50 text-features-features-700" title="Product updates" description="Receive important updates about new features, tips and announcements.">
              <ChannelToggle icon={<Mail size={14} />} row="Product updates" channel="Email" checked={prefs.productUpdates.email} disabled={suspended} onChange={(email) => persistPrefs({ ...prefs, productUpdates: { ...prefs.productUpdates, email } })} />
              <span className="mx-[4px] hidden h-[20px] w-px bg-border-default sm:inline-block" aria-hidden />
              <ChannelToggle icon={<Phone size={14} />} row="Product updates" channel="In-app" checked={prefs.productUpdates.inApp} disabled={suspended} onChange={(inApp) => persistPrefs({ ...prefs, productUpdates: { ...prefs.productUpdates, inApp } })} />
            </PrefRow>
            <PrefRow icon={<FileText size={16} />} iconClass="bg-secondary-secondary-50 text-secondary-secondary-700" title="Billing and payments" description="Get notified about invoices, payment confirmations and billing updates.">
              <ChannelToggle icon={<Mail size={14} />} row="Billing and payments" channel="Email" checked={prefs.billing.email} disabled={suspended} onChange={(email) => persistPrefs({ ...prefs, billing: { ...prefs.billing, email } })} />
              <span className="mx-[4px] hidden h-[20px] w-px bg-border-default sm:inline-block" aria-hidden />
              <ChannelToggle icon={<Phone size={14} />} row="Billing and payments" channel="In-app" checked={prefs.billing.inApp} disabled={suspended} onChange={(inApp) => persistPrefs({ ...prefs, billing: { ...prefs.billing, inApp } })} />
            </PrefRow>
          </div>
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
            <p className="mt-[8px]">Consequences: <PendingTag /></p>
          </div>
        }
        onCancel={() => setCloseOpen(false)}
        onConfirm={() => {
          void closeEmployerAccount().then((result) => {
            setCloseOpen(false);
            if (!result.ok || !ACCOUNT_CLOSURE.supportedByMockApi) {
              setCloseNote(ACCOUNT_CLOSURE.note);
            }
          });
        }}
      />
      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.kind === "cancel" ? "Cancel this invite?" : `Remove ${team.find((member) => member.id === confirm?.id)?.name ?? "this member"} from your team?`}
        tone="danger"
        confirmLabel={confirm?.kind === "cancel" ? "Cancel invite" : "Remove member"}
        body={confirm?.kind === "cancel"
          ? "They will not be able to join with this invite. You can send a new one later."
          : `${(team.find((member) => member.id === confirm?.id)?.name ?? "They").split(" ")[0]} will lose access to ${draft.companyName}’s jobs and applicants right away. You can invite them again later.`}
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

function Verified({ className }: { className?: string }) {
  return <span className={cn("inline-flex h-[24px] items-center rounded-full bg-primary-primary-50 px-[8px] text-label-medium text-brand-primary", className)}>Verified</span>;
}

function PendingTag() {
  return <span className="inline-flex items-center rounded-full bg-warning-warning-50 px-[8px] py-[4px] text-label-medium text-warning-warning-700">Pending decision</span>;
}

function roleTone(role: TeamRole) {
  if (role === "Owner") return "bg-features-features-50 text-features-features-700";
  if (role === "Recruiter") return "bg-grey-grey-100 text-text-secondary";
  return "bg-primary-primary-50 text-primary-primary-700";
}

function avatarTone(id: string) {
  if (id === "tm-priya") return "bg-success-success-50 text-success-success-700";
  if (id === "tm-arjun") return "bg-warning-warning-50 text-warning-warning-700";
  if (id === "tm-neha") return "bg-features-features-50 text-features-features-700";
  return "bg-primary-primary-50 text-brand-primary";
}

function ChannelToggle({
  icon,
  row,
  channel,
  checked,
  disabled,
  onChange,
}: {
  icon?: ReactNode;
  row: string;
  channel: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <span className="inline-flex items-center gap-[8px] text-body-sm-regular text-text-secondary">
      {icon}
      {channel}
      <Toggle label={`${row} · ${channel}`} checked={checked} disabled={disabled} onChange={onChange} />
    </span>
  );
}

function PrefStatus({ status, onRetry }: { status: SaveState; onRetry: () => void }) {
  if (status === "saving") {
    return (
      <div className="mt-[16px]">
        <Banner tone="info" title="Saving" body="Saving your notification preferences." />
      </div>
    );
  }
  if (status === "saved") {
    return (
      <div className="mt-[16px]">
        <Banner tone="success" title="Saved" body="Your notification preferences are saved." />
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="mt-[16px]">
        <Banner
          tone="danger"
          title="Could not save preferences"
          body="The last successful values are still stored."
          action={<Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>}
        />
      </div>
    );
  }
  return null;
}

function PrefRow({
  icon,
  iconClass,
  title,
  description,
  note,
  extra,
  children,
}: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  description: string;
  note?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="px-[16px] py-[16px]">
      <div className="flex flex-col gap-[16px] lg:flex-row lg:items-center">
        <span className={cn("flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full", iconClass)}>{icon}</span>
        <div className="min-w-[0px] flex-1">
          <p className="text-body-sm-semibold">{title}</p>
          <p className="text-body-sm-regular text-text-secondary">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-[8px]">{children}</div>
      </div>
      {extra}
      {note}
    </div>
  );
}

function OtpDialog({ title, failed, onClose, onVerified }: { title: string; failed: boolean; onClose: () => void; onVerified: (phone: string) => void }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState(failed ? "Could not verify that number. Try again." : "");
  const [phase, setPhase] = useState<"idle" | "verifying">(failed ? "idle" : "idle");
  return (
    <div className="fixed inset-[0px] z-40 flex items-center justify-center bg-black/40 p-[16px]">
      <div className="w-full max-w-[420px] rounded-md bg-white p-[20px]">
        <div className="flex items-center gap-[12px]">
          <h2 className="flex-1 text-subheading-semibold">{title}</h2>
          <button aria-label="Close" onClick={onClose}><X size={18} /></button>
        </div>
        <p className="mt-[8px] text-body-sm-regular text-text-secondary">Enter the mobile number, then the {OTP_LENGTH}-digit code. Demo code {OTP_DEMO_CODE}.</p>
        <TextInput className="mt-[12px]" aria-label="New mobile number" value={phone} onChange={(event) => setPhone(event.target.value)} />
        <div className="mt-[12px] flex gap-[8px]">
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
              className="h-[48px] w-[40px] rounded-sm border border-border-default text-center text-subheading-semibold"
            />
          ))}
        </div>
        {error ? <p className="mt-[8px] text-body-sm-regular text-error-default">{error}</p> : null}
        <Button
          className="mt-[16px] w-full"
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
