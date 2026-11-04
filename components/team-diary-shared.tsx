"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Filter, Link2, LoaderCircle, Pencil, Send, Trash2, UsersRound } from "lucide-react";
import { deleteSharedDiaryEntry, getDiaryInitialData, getMyDiaryEntry, getSharedDiaryPage, saveSharedDiaryEntry } from "@/app/team/diary/actions";
import type { DiaryDashboard, DiaryPageSlice, MyDiaryEntry, SharedDiaryEntry, TeamDiaryInitialData, TeamProfile } from "@/components/team-diary-types";

type Period = "day" | "week" | "month";
type SharedFilters = { query: string; period: Period; anchor: string; employeeId: string; role: string; project: string; page: number };
type EntryForm = { id: string | null; workDate: string; workSummary: string; completedTasks: string; ongoingTasks: string; blockers: string; nextDayPlan: string; projectReference: string; links: string; status: "draft" | "published" };
type Notice = { type: "success" | "error"; message: string };

function emptyForm(workDate: string): EntryForm {
  return { id: null, workDate, workSummary: "", completedTasks: "", ongoingTasks: "", blockers: "", nextDayPlan: "", projectReference: "", links: "", status: "draft" };
}

function entryFormFromEntry(entry: MyDiaryEntry): EntryForm {
  return { id: entry.id, workDate: entry.workDate, workSummary: entry.workSummary, completedTasks: entry.completedTasks, ongoingTasks: entry.ongoingTasks, blockers: entry.blockers, nextDayPlan: entry.nextDayPlan, projectReference: entry.projectReference, links: entry.links, status: entry.status === "published" ? "published" : "draft" };
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function timeLabel(value: Date | string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function roleLabel(role: string) {
  if (role === "manager") return "Team lead / Manager";
  if (role === "owner" || role === "admin") return "Owner";
  return "Employee";
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function hasText(value: string) {
  return value.trim().length > 0;
}

function SharedUpdateCard({ entry, viewerId, onEdit, onDelete, busy }: { entry: SharedDiaryEntry; viewerId: string; onEdit: (entry: SharedDiaryEntry) => void; onDelete: (entry: SharedDiaryEntry) => void; busy: boolean }) {
  const ownEntry = entry.member.id === viewerId;
  const sections = [
    ["Tasks completed", entry.completedTasks],
    ["In progress", entry.ongoingTasks],
    ["Blockers", entry.blockers],
    ["Next working day", entry.nextDayPlan],
    ["Project / ticket references", entry.projectReference],
  ] as const;

  return (
    <article className="diary-card diary-update-card">
      <div className="diary-update-header">
        <div className="diary-person">
          <span className="diary-avatar" aria-hidden="true">{initials(entry.member.name)}</span>
          <span><strong>{entry.member.name}</strong><small>{roleLabel(entry.member.role)} · {dateLabel(entry.workDate)}</small></span>
        </div>
        <span className={`diary-status-pill ${entry.status === "published" ? "published" : "draft"}`}>{entry.status === "published" ? <><Check aria-hidden="true" /> Published</> : "Draft · only you"}</span>
      </div>
      <div className="diary-update-body">
        {entry.workSummary && <section className="diary-update-summary"><h3>Work summary</h3><p>{entry.workSummary}</p></section>}
        <div className="diary-update-details">
          {sections.map(([label, value]) => hasText(value) && <section className={label === "Blockers" ? "diary-update-detail diary-blocker-detail" : "diary-update-detail"} key={label}><h4>{label}</h4><p>{value}</p></section>)}
          {entry.links.split(/\r?\n/).filter(Boolean).length > 0 && <section className="diary-update-detail"><h4>Links</h4><ul className="diary-link-list">{entry.links.split(/\r?\n/).filter(Boolean).map((link) => <li key={link}><a href={link} target="_blank" rel="noopener noreferrer"><Link2 aria-hidden="true" />{link}</a></li>)}</ul></section>}
        </div>
      </div>
      <div className="diary-update-footer">
        <span><Clock3 aria-hidden="true" /> Updated {timeLabel(entry.updatedAt)}</span>
        {ownEntry && <div className="diary-button-row"><button className="diary-button diary-button-quiet" type="button" disabled={busy} onClick={() => onEdit(entry)}><Pencil aria-hidden="true" /> Edit</button><button className="diary-button diary-button-danger" type="button" disabled={busy} onClick={() => onDelete(entry)}><Trash2 aria-hidden="true" /> Delete</button></div>}
      </div>
    </article>
  );
}

export default function TeamDiarySharedPanel({ initialData }: { initialData: TeamDiaryInitialData }) {
  const router = useRouter();
  const [entriesPage, setEntriesPage] = useState<DiaryPageSlice<SharedDiaryEntry>>(initialData.shared);
  const [dashboard, setDashboard] = useState<DiaryDashboard>(initialData.dashboard);
  const [people, setPeople] = useState<TeamProfile[]>(initialData.people);
  const [filters, setFilters] = useState<SharedFilters>({ query: "", period: "day", anchor: initialData.today, employeeId: "", role: "", project: "", page: 1 });
  const [form, setForm] = useState<EntryForm>(initialData.myTodayEntry ? entryFormFromEntry(initialData.myTodayEntry) : emptyForm(initialData.today));
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDashboard(initialData.dashboard);
    setPeople(initialData.people);
  }, [initialData.dashboard, initialData.people]);

  const loadEntries = async (nextFilters: SharedFilters) => {
    setBusy(true);
    setNotice(null);
    try {
      const nextPage = await getSharedDiaryPage(nextFilters);
      setEntriesPage(nextPage);
      setFilters(nextFilters);
    } catch (error) {
      setNotice({ type: "error", message: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const loadDashboard = async () => {
    const latest = await getDiaryInitialData();
    setDashboard(latest.dashboard);
    setPeople(latest.people);
  };

  const onFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadEntries({ ...filters, page: 1 });
  };

  const choosePeriod = (period: Period) => {
    void loadEntries({ ...filters, period, page: 1 });
  };

  const selectDate = async (workDate: string) => {
    setForm((current) => ({ ...current, workDate }));
    setBusy(true);
    setNotice(null);
    try {
      const existing = await getMyDiaryEntry(workDate);
      setForm(existing ? entryFormFromEntry(existing) : emptyForm(workDate));
    } catch (error) {
      setNotice({ type: "error", message: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const save = async (status: "draft" | "published") => {
    setBusy(true);
    setNotice(null);
    try {
      const saved = await saveSharedDiaryEntry({
        id: form.id,
        workDate: form.workDate,
        workSummary: form.workSummary,
        completedTasks: form.completedTasks,
        ongoingTasks: form.ongoingTasks,
        blockers: form.blockers,
        nextDayPlan: form.nextDayPlan,
        projectReference: form.projectReference,
        links: form.links,
      }, status);
      setForm((current) => ({ ...current, id: saved.id, status }));
      const [nextPage] = await Promise.all([getSharedDiaryPage(filters), loadDashboard()]);
      setEntriesPage(nextPage);
      setNotice({ type: "success", message: status === "published" ? "Your update is published and visible to the GritGrid team." : "Draft saved. Only you can see this update until you publish it." });
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", message: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const editEntry = async (entry: SharedDiaryEntry) => {
    setBusy(true);
    setNotice(null);
    try {
      const ownEntry = await getMyDiaryEntry(entry.workDate);
      if (!ownEntry || ownEntry.id !== entry.id) throw new Error("That entry is no longer available to edit.");
      setForm(entryFormFromEntry(ownEntry));
      setNotice({ type: "success", message: "Your update is ready to edit. Changes will be recorded with an updated timestamp." });
    } catch (error) {
      setNotice({ type: "error", message: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const removeEntry = async (entry: SharedDiaryEntry) => {
    if (!window.confirm(`Delete your diary update for ${dateLabel(entry.workDate)}? This cannot be undone.`)) return;
    setBusy(true);
    setNotice(null);
    try {
      await deleteSharedDiaryEntry(entry.id);
      if (form.id === entry.id) setForm(emptyForm(initialData.today));
      const [nextPage] = await Promise.all([getSharedDiaryPage(filters), loadDashboard()]);
      setEntriesPage(nextPage);
      setNotice({ type: "success", message: "Your diary update was deleted." });
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", message: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const showMyUpdates = filters.employeeId === initialData.viewerId;
  const toggleMyUpdates = () => {
    const nextFilters = { ...filters, employeeId: showMyUpdates ? "" : initialData.viewerId, period: "month" as Period, anchor: initialData.today, page: 1 };
    void loadEntries(nextFilters);
  };

  const resetFilters = () => {
    const nextFilters: SharedFilters = { query: "", period: "day", anchor: initialData.today, employeeId: "", role: "", project: "", page: 1 };
    void loadEntries(nextFilters);
  };

  const setField = (key: keyof EntryForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const activeBlockers = dashboard.blockers.length;

  return (
    <div className="diary-panel-content">
      <div className="diary-panel-heading">
        <div>
          <p className="diary-kicker"><UsersRound aria-hidden="true" /> Organization-wide updates</p>
          <h2>Team Shared Diary</h2>
          <p>Published updates are visible to authenticated team members. Drafts stay private to their author.</p>
        </div>
        <button className={`diary-button ${showMyUpdates ? "diary-button-primary" : "diary-button-outline"}`} type="button" aria-pressed={showMyUpdates} onClick={toggleMyUpdates} disabled={busy}>
          <Filter aria-hidden="true" /> {showMyUpdates ? "Show team updates" : "My previous updates"}
        </button>
      </div>

      <div className="diary-dashboard-grid" aria-label="Team diary summary">
        <article className="diary-metric-card"><span>Published today</span><strong>{dashboard.todayUpdates}</strong><small>Shared work updates</small></article>
        <article className="diary-metric-card"><span>Team members reporting</span><strong>{dashboard.todayContributors}</strong><small>Distinct contributors today</small></article>
        <article className="diary-metric-card diary-metric-alert"><span>Blockers reported</span><strong>{activeBlockers}</strong><small>Published in the past 7 days</small></article>
      </div>

      <div className="diary-insights-grid">
        <section className="diary-insight-card" aria-labelledby="diary-recent-title">
          <div className="diary-insight-heading"><span className="diary-insight-icon"><Clock3 aria-hidden="true" /></span><div><h3 id="diary-recent-title">Recent team updates</h3><p>Latest published work summaries</p></div></div>
          {dashboard.recentUpdates.length ? <ul className="diary-activity-list">{dashboard.recentUpdates.map((item) => <li key={item.id}><span className="diary-activity-dot" aria-hidden="true" /><div><strong>{item.member.name}</strong><p>{item.workSummary}</p><small>{dateLabel(item.workDate)} · {roleLabel(item.member.role)}</small></div></li>)}</ul> : <p className="diary-subtle-empty">No published updates yet. Be the first to share a summary.</p>}
        </section>
        <section className="diary-insight-card" aria-labelledby="diary-blockers-title">
          <div className="diary-insight-heading"><span className="diary-insight-icon blocker"><AlertCircle aria-hidden="true" /></span><div><h3 id="diary-blockers-title">Reported blockers</h3><p>Notes shared by the team in the last 7 days</p></div></div>
          {dashboard.blockers.length ? <ul className="diary-blocker-list">{dashboard.blockers.map((item) => <li key={item.id}><div><strong>{item.member.name}</strong><small>{dateLabel(item.workDate)}{item.projectReference ? ` · ${item.projectReference}` : ""}</small></div><p>{item.blockers}</p></li>)}</ul> : <p className="diary-subtle-empty">No blockers have been reported in the past week.</p>}
        </section>
      </div>

      {notice && <p className={`diary-notice ${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>{notice.message}</p>}

      <div className="diary-shared-layout">
        <section className="diary-card diary-entry-composer" aria-labelledby="diary-entry-form-title">
          <div className="diary-composer-heading">
            <div><p className="diary-kicker"><CalendarDays aria-hidden="true" /> Daily work update</p><h3 id="diary-entry-form-title">{form.id ? "Edit your update" : "Write today’s update"}</h3></div>
            {form.id && <span className={`diary-status-pill ${form.status === "published" ? "published" : "draft"}`}>{form.status === "published" ? "Published" : "Draft"}</span>}
          </div>
          <div className="diary-security-note compact" role="note"><AlertCircle aria-hidden="true" /><p>Do not include passwords, API keys, access tokens, or other credentials in shared updates.</p></div>
          <div className="diary-form-grid">
            <label className="diary-field diary-field-full"><span>Work date <b>*</b></span><input type="date" value={form.workDate} onChange={(event) => void selectDate(event.target.value)} /></label>
            <label className="diary-field diary-field-full"><span>What did you work on today? <b>*</b></span><textarea rows={3} maxLength={4000} required value={form.workSummary} onChange={(event) => setField("workSummary", event.target.value)} placeholder="Summarize your focus and progress." /></label>
            <label className="diary-field diary-field-full"><span>What tasks did you complete?</span><textarea rows={3} maxLength={4000} value={form.completedTasks} onChange={(event) => setField("completedTasks", event.target.value)} placeholder="List completed tasks, milestones, or outcomes." /></label>
            <label className="diary-field diary-field-full"><span>What are you currently working on?</span><textarea rows={3} maxLength={4000} value={form.ongoingTasks} onChange={(event) => setField("ongoingTasks", event.target.value)} placeholder="Share work in progress." /></label>
            <label className="diary-field diary-field-full"><span>Did you face any blockers?</span><textarea rows={3} maxLength={4000} value={form.blockers} onChange={(event) => setField("blockers", event.target.value)} placeholder="Describe a blocker, or leave blank if there is none." /></label>
            <label className="diary-field diary-field-full"><span>Plan for the next working day</span><textarea rows={3} maxLength={4000} value={form.nextDayPlan} onChange={(event) => setField("nextDayPlan", event.target.value)} placeholder="What will you focus on next?" /></label>
            <label className="diary-field diary-field-full"><span>Related project or ticket references <small>Optional</small></span><input maxLength={500} value={form.projectReference} onChange={(event) => setField("projectReference", event.target.value)} placeholder="Project name, issue ID, or ticket reference" /></label>
            <label className="diary-field diary-field-full"><span>Helpful links <small>Optional · one http(s) URL per line</small></span><textarea rows={2} maxLength={2000} value={form.links} onChange={(event) => setField("links", event.target.value)} placeholder="https://docs.example.com/…" /></label>
          </div>
          <p className="diary-entry-privacy">Your name and current team role are shown with a published update. Only you can access this date’s draft.</p>
          <div className="diary-composer-actions">
            <button className="diary-button diary-button-outline" type="button" disabled={busy || !form.workSummary.trim()} onClick={() => void save("draft")}>{busy ? <LoaderCircle className="diary-spinner" aria-hidden="true" /> : null} Save draft</button>
            <button className="diary-button diary-button-primary" type="button" disabled={busy || !form.workSummary.trim()} onClick={() => void save("published")}>{busy ? <LoaderCircle className="diary-spinner" aria-hidden="true" /> : <Send aria-hidden="true" />} {form.status === "published" ? "Update published entry" : "Publish update"}</button>
          </div>
        </section>

        <section className="diary-timeline-section" aria-labelledby="diary-timeline-title">
          <div className="diary-timeline-heading"><div><p className="diary-kicker">Shared timeline</p><h3 id="diary-timeline-title">{showMyUpdates ? "My previous updates" : "Team work log"}</h3></div><span>{entriesPage.total} {entriesPage.total === 1 ? "update" : "updates"}</span></div>
          <div className="diary-period-switcher" role="group" aria-label="Timeline date range">
            {(["day", "week", "month"] as const).map((period) => <button key={period} type="button" aria-pressed={filters.period === period} className={filters.period === period ? "active" : ""} onClick={() => choosePeriod(period)} disabled={busy}>{period === "day" ? "Daily" : period === "week" ? "Weekly" : "Monthly"}</button>)}
          </div>
          <form className="diary-shared-filters" onSubmit={onFilterSubmit}>
            <label className="diary-field"><span>Reference date</span><input type="date" value={filters.anchor} onChange={(event) => setFilters({ ...filters, anchor: event.target.value })} /></label>
            <label className="diary-field"><span>Employee</span><select value={filters.employeeId} onChange={(event) => setFilters({ ...filters, employeeId: event.target.value })}><option value="">Everyone</option>{people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label>
            <label className="diary-field"><span>Team / role</span><select value={filters.role} onChange={(event) => setFilters({ ...filters, role: event.target.value })}><option value="">All roles</option><option value="employee">Employee</option><option value="manager">Team lead / Manager</option><option value="owner">Owner</option><option value="admin">Admin</option></select></label>
            <label className="diary-field"><span>Project / ticket</span><input maxLength={120} value={filters.project} onChange={(event) => setFilters({ ...filters, project: event.target.value })} placeholder="Filter references" /></label>
            <label className="diary-field diary-field-full"><span>Keyword search</span><input maxLength={120} value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder="Search published updates" /></label>
            <div className="diary-filter-actions diary-field-full"><button className="diary-button diary-button-primary" type="submit" disabled={busy}><Filter aria-hidden="true" /> Apply filters</button><button className="diary-button diary-button-quiet" type="button" disabled={busy} onClick={resetFilters}>Clear</button></div>
          </form>

          {busy && <p className="diary-loading" role="status"><LoaderCircle className="diary-spinner" aria-hidden="true" /> Updating timeline…</p>}
          {!busy && entriesPage.items.length === 0 && <div className="diary-empty-state compact"><div className="diary-empty-icon"><UsersRound aria-hidden="true" /></div><h3>No diary updates found</h3><p>Try another date range or filter, or add your own daily update.</p><button className="diary-text-button" type="button" onClick={resetFilters}>Show today&apos;s team updates <ArrowRight aria-hidden="true" /></button></div>}
          {entriesPage.items.length > 0 && <div className="diary-timeline">{entriesPage.items.map((entry) => <SharedUpdateCard key={entry.id} entry={entry} viewerId={initialData.viewerId} onEdit={(selected) => void editEntry(selected)} onDelete={(selected) => void removeEntry(selected)} busy={busy} />)}</div>}
          {entriesPage.pageCount > 1 && <nav className="diary-pagination" aria-label="Shared diary pages"><button className="diary-button diary-button-outline" type="button" disabled={busy || entriesPage.page <= 1} onClick={() => void loadEntries({ ...filters, page: entriesPage.page - 1 })}><ChevronLeft aria-hidden="true" /> Previous</button><span>Page {entriesPage.page} of {entriesPage.pageCount}</span><button className="diary-button diary-button-outline" type="button" disabled={busy || entriesPage.page >= entriesPage.pageCount} onClick={() => void loadEntries({ ...filters, page: entriesPage.page + 1 })}>Next <ChevronRight aria-hidden="true" /></button></nav>}
          <p className="diary-timeline-footnote">Only published updates from the selected date range are shared. Drafts are visible only to their author.</p>
        </section>
      </div>
    </div>
  );
}
