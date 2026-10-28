import { SETTINGS, TEAM } from "@/lib/fixtures";
import type { AccountSettings, NotificationPrefs, TeamMember, TeamRole } from "@/lib/types";

const STORAGE_KEY = "around.employer.settings.v1";

interface SettingsStore {
  account: AccountSettings;
  team: TeamMember[];
  prefs: NotificationPrefs;
}

function seed(): SettingsStore {
  const account = structuredClone(SETTINGS);
  return { account, team: structuredClone(TEAM), prefs: structuredClone(account.prefs) };
}

let memory: SettingsStore | null = null;

function read(): SettingsStore {
  if (memory) return memory;
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SettingsStore;
        if (parsed?.prefs?.newApplicant && typeof parsed.prefs.newApplicant === "object" && parsed.account?.companyName === "Raipur Builder") {
          memory = parsed;
          return memory;
        }
      } catch {
        memory = null;
      }
    }
  }
  memory = seed();
  return memory;
}

function write(next: SettingsStore) {
  memory = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
}

/** TODO: replace with GET /employer/settings */
export async function loadSettings(): Promise<SettingsStore> {
  return structuredClone(read());
}

/** TODO: replace with PUT /employer/settings/account */
export async function saveAccount(
  account: Pick<AccountSettings, "name" | "email" | "phone" | "phoneVerified">,
  options?: { fail?: boolean },
): Promise<AccountSettings> {
  if (options?.fail) throw new Error("save_failed");
  const current = read();
  const next = { ...current, account: { ...current.account, ...account } };
  write(next);
  return structuredClone(next.account);
}

/** TODO: replace with GET /employer/settings/notifications */
export async function loadNotificationPrefs(): Promise<NotificationPrefs> {
  return structuredClone(read().prefs);
}

/** TODO: replace with PUT /employer/settings/notifications. Channels are not delivered. */
export async function saveNotificationPrefs(
  prefs: NotificationPrefs,
  options?: { fail?: boolean },
): Promise<NotificationPrefs> {
  if (options?.fail) throw new Error("save_failed");
  const current = read();
  const next = { ...current, prefs: structuredClone(prefs), account: { ...current.account, prefs } };
  write(next);
  return structuredClone(next.prefs);
}

/** TODO: replace with GET /employer/team */
export async function loadTeam(): Promise<TeamMember[]> {
  return structuredClone(read().team);
}

/** TODO: replace with POST /employer/team/invites. Delivery is not implemented. */
export async function sendInvite(input: {
  name: string;
  email: string;
  role: TeamRole;
  fail?: boolean;
}): Promise<TeamMember> {
  if (input.fail) throw new Error("invite_failed");
  const member: TeamMember = {
    id: `tm-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name.trim(),
    email: input.email.trim(),
    role: input.role,
    status: "Pending",
    initials: input.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };
  const current = read();
  write({ ...current, team: [...current.team, member] });
  return structuredClone(member);
}

/** TODO: replace with POST /employer/team/invites/:id/resend */
export async function resendInvite(id: string): Promise<TeamMember[]> {
  const current = read();
  const team = current.team.map((member) => (member.id === id ? { ...member, status: "Pending" as const } : member));
  write({ ...current, team });
  return structuredClone(team);
}

/** TODO: replace with DELETE /employer/team/:id */
export async function removeTeamMember(id: string): Promise<TeamMember[]> {
  const current = read();
  const target = current.team.find((member) => member.id === id);
  if (!target || target.you || target.role === "Owner") return structuredClone(current.team);
  const team = current.team.filter((member) => member.id !== id);
  write({ ...current, team });
  return structuredClone(team);
}

/** TODO: replace with PATCH /employer/team/:id */
export async function updateTeamRole(id: string, role: TeamRole): Promise<TeamMember[]> {
  const current = read();
  const team = current.team.map((member) =>
    member.id === id && !member.you && member.role !== "Owner" ? { ...member, role } : member,
  );
  write({ ...current, team });
  return structuredClone(team);
}

/**
 * TODO: replace with POST /employer/account/close once closure is supported.
 * The mock does not close the account.
 */
export async function closeEmployerAccount(): Promise<{ ok: false; unavailable: true }> {
  return { ok: false, unavailable: true };
}
