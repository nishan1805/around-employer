"use client";

export type SettingsTab = "account" | "team" | "notifications";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "account", label: "Account" },
  { id: "team", label: "Team members" },
  { id: "notifications", label: "Notifications" },
];

/** Figma: Settings Tabs. */
export function SettingsTabs({ value, onChange }: { value: SettingsTab; onChange: (tab: SettingsTab) => void }) {
  return (
    <div className="flex w-full overflow-hidden rounded-lg border border-border-default bg-white" role="tablist" aria-label="Settings">
      {TABS.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            id={`settings-tab-${tab.id}`}
            aria-selected={active}
            aria-controls={`settings-panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`flex-1 border-b-2 py-[16px] ${active ? "border-brand-primary text-body-sm-semibold text-brand-primary" : "border-transparent text-body-sm-regular text-text-secondary"}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
