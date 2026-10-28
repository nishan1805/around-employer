"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { APPLICANTS, COMPANY, JOBS, NOTIFICATIONS, SETTINGS, TEAM } from "@/lib/fixtures";
import { VERIFICATION_REFERENCE_ID } from "@/src/config/policy";
import { uid } from "@/lib/utils";
import type {
  AccountSettings,
  Applicant,
  ApplicantStatus,
  AppNotification,
  CompanyProfile,
  Job,
  JobStatus,
  Note,
  TeamMember,
  TeamRole,
} from "@/lib/types";

interface EmployerValue {
  jobs: Job[];
  applicants: Applicant[];
  company: CompanyProfile;
  savedCompany: CompanyProfile;
  setCompany: (profile: CompanyProfile) => void;
  saveCompany: () => void;
  resetCompany: () => void;
  notifications: AppNotification[];
  markAllRead: () => void;
  settings: AccountSettings;
  setSettings: (settings: AccountSettings) => void;
  team: TeamMember[];
  invite: (name: string, role: TeamRole) => void;
  removeMember: (id: string) => void;
  upsertJob: (job: Job) => void;
  patchJob: (id: string, patch: Partial<Job>) => void;
  removeJob: (id: string) => void;
  duplicateJob: (id: string) => Job | null;
  setApplicantStatus: (id: string, status: ApplicantStatus) => void;
  addNote: (id: string, text: string) => void;
  location: string;
  setLocation: (location: string) => void;
  verificationStatus: import("@/lib/types").CompanyVerificationStatus;
  setVerificationStatus: (status: import("@/lib/types").CompanyVerificationStatus) => void;
  referenceId: string;
}

const EmployerContext = createContext<EmployerValue | null>(null);

export function EmployerProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(() => structuredClone(JOBS));
  const [applicants, setApplicants] = useState<Applicant[]>(() => structuredClone(APPLICANTS));
  const [savedCompany, setSavedCompany] = useState<CompanyProfile>(() => structuredClone(COMPANY));
  const [company, setCompany] = useState<CompanyProfile>(() => structuredClone(COMPANY));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => structuredClone(NOTIFICATIONS));
  const [settings, setSettings] = useState<AccountSettings>(() => structuredClone(SETTINGS));
  const [team, setTeam] = useState<TeamMember[]>(() => structuredClone(TEAM));
  const [location, setLocation] = useState("Shankar Nagar, Raipur");
  const [verificationStatus, setVerificationStatus] = useState<EmployerValue["verificationStatus"]>("verified");
  const [referenceId] = useState(VERIFICATION_REFERENCE_ID);

  const value = useMemo<EmployerValue>(
    () => ({
      jobs,
      applicants,
      company,
      savedCompany,
      setCompany,
      saveCompany: () => setSavedCompany(structuredClone(company)),
      resetCompany: () => setCompany(structuredClone(savedCompany)),
      notifications,
      markAllRead: () => setNotifications((items) => items.map((item) => ({ ...item, unread: false }))),
      settings,
      setSettings,
      team,
      invite: (name, role) =>
        setTeam((members) => [
          ...members,
          {
            id: uid("tm"),
            name,
            email: `${name.toLowerCase().replace(/\s+/g, ".")}@raipurbuilder.in`,
            role,
            status: "Pending",
            initials: name.slice(0, 2).toUpperCase(),
          },
        ]),
      removeMember: (id) => setTeam((members) => members.filter((member) => member.id !== id || member.you)),
      upsertJob: (job) =>
        setJobs((items) => {
          const index = items.findIndex((item) => item.id === job.id);
          if (index === -1) return [job, ...items];
          const next = [...items];
          next[index] = job;
          return next;
        }),
      patchJob: (id, patch) => setJobs((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item))),
      removeJob: (id) => setJobs((items) => items.filter((item) => item.id !== id)),
      duplicateJob: (id) => {
        const source = jobs.find((item) => item.id === id);
        if (!source) return null;
        const copy: Job = {
          ...structuredClone(source),
          id: uid("job"),
          code: `AR-${String(jobs.length + 1).padStart(3, "0")}`,
          title: `${source.title} (copy)`,
          status: "draft" satisfies JobStatus,
          views: 0,
          applicants: 0,
          postedOn: new Date().toISOString().slice(0, 10),
        };
        setJobs((items) => [copy, ...items]);
        return copy;
      },
      setApplicantStatus: (id, status: ApplicantStatus) =>
        setApplicants((items) => items.map((item) => (item.id === id ? { ...item, status, highlightNew: false } : item))),
      addNote: (id, text) =>
        setApplicants((items) =>
          items.map((item) => {
            if (item.id !== id) return item;
            const note: Note = { id: uid("note"), author: "You", at: new Date().toISOString().slice(0, 10), text };
            return { ...item, notes: [note, ...item.notes] };
          }),
        ),
      location,
      setLocation,
      verificationStatus,
      setVerificationStatus,
      referenceId,
    }),
    [applicants, company, jobs, location, notifications, referenceId, savedCompany, settings, team, verificationStatus],
  );

  return <EmployerContext.Provider value={value}>{children}</EmployerContext.Provider>;
}

export function useEmployer() {
  const value = useContext(EmployerContext);
  if (!value) throw new Error("useEmployer must be used inside EmployerProvider");
  return value;
}
