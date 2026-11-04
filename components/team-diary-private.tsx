"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BookOpen, ChevronLeft, ChevronRight, FileText, LockKeyhole, Pencil, Plus, Search, ShieldCheck, Trash2, X } from "lucide-react";
import { deletePrivateDiaryNote, getPrivateDiaryPage, savePrivateDiaryNote } from "@/app/team/diary/actions";
import type { PrivateDiaryNote, PrivateDiaryPage } from "@/components/team-diary-types";

const CATEGORIES = ["Personal Notes", "Technical Notes", "Important Links", "Server & Infrastructure", "IP References", "Project References", "Reminders", "Other"];

type NoteDraft = { id: string | null; title: string; content: string; category: string; tags: string };
type Notice = { type: "success" | "error"; message: string };

function formatTimestamp(value: Date | string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export default function TeamDiaryPrivatePanel({ initialPage }: { initialPage: PrivateDiaryPage }) {
  const router = useRouter();
  const [page, setPage] = useState(initialPage);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [draft, setDraft] = useState<NoteDraft | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => setPage(initialPage), [initialPage]);

  const search = async (event?: React.FormEvent<HTMLFormElement>, nextPage = 1) => {
    event?.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      setPage(await getPrivateDiaryPage({ query, category, page: nextPage }));
    } catch (error) {
      setNotice({ type: "error", message: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    setBusy(true);
    setNotice(null);
    try {
      await savePrivateDiaryNote({
        id: draft.id,
        title: draft.title,
        content: draft.content,
        category: draft.category,
        tags: draft.tags.split(/[\n,]/).map((tag) => tag.trim()).filter(Boolean),
      });
      setDraft(null);
      setNotice({ type: "success", message: "Your private note was saved. It is visible only to you." });
      setPage(await getPrivateDiaryPage({ query, category, page: 1 }));
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", message: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (note: PrivateDiaryNote) => {
    if (!window.confirm(`Delete “${note.title}”? This cannot be undone.`)) return;
    setBusy(true);
    setNotice(null);
    try {
      await deletePrivateDiaryNote(note.id);
      setNotice({ type: "success", message: "The note was deleted." });
      const nextPage = page.items.length === 1 && page.page > 1 ? page.page - 1 : page.page;
      setPage(await getPrivateDiaryPage({ query, category, page: nextPage }));
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", message: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const categories = CATEGORIES.slice();
  for (const item of page.categories) {
    if (!categories.includes(item)) categories.push(item);
  }

  return (
    <div className="diary-panel-content">
      <div className="diary-panel-heading">
        <div>
          <p className="diary-kicker"><LockKeyhole aria-hidden="true" /> Personal workspace</p>
          <h2>My Private Diary</h2>
          <p>Save reference notes, links, reminders, and project context. These entries are scoped to your account.</p>
        </div>
        <button className="diary-button diary-button-primary" type="button" onClick={() => { setDraft({ id: null, title: "", content: "", category: "Personal Notes", tags: "" }); setNotice(null); }}>
          <Plus aria-hidden="true" /> New note
        </button>
      </div>

      <div className="diary-security-note" role="note">
        <ShieldCheck aria-hidden="true" />
        <p><strong>Keep credentials out of your diary.</strong> Do not save passwords, API keys, access tokens, private keys, or other secrets here. Store a reference to your approved secure vault instead.</p>
      </div>

      {notice && <p className={`diary-notice ${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>{notice.message}</p>}

      {draft && (
        <form className="diary-card diary-note-editor" onSubmit={save}>
          <div className="diary-editor-heading">
            <div><p className="diary-kicker">{draft.id ? "Edit note" : "New note"}</p><h3>{draft.id ? "Update your reference" : "Capture something useful"}</h3></div>
            <button className="diary-icon-button" type="button" aria-label="Close note editor" onClick={() => setDraft(null)}><X aria-hidden="true" /></button>
          </div>
          <div className="diary-form-grid">
            <label className="diary-field">
              <span>Title <b>*</b></span>
              <input autoComplete="off" maxLength={160} required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. API documentation links" />
            </label>
            <label className="diary-field">
              <span>Category <b>*</b></span>
              <input list="diary-note-categories" maxLength={64} required value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} placeholder="Choose or add a category" />
              <datalist id="diary-note-categories">{CATEGORIES.map((item) => <option key={item} value={item} />)}</datalist>
            </label>
            <label className="diary-field diary-field-full">
              <span>Note</span>
              <textarea maxLength={20000} rows={7} value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder="Add multiline notes, URLs, IP references, project context, or reminders." />
            </label>
            <label className="diary-field diary-field-full">
              <span>Tags <small>Separate tags with commas</small></span>
              <input maxLength={360} value={draft.tags} onChange={(event) => setDraft({ ...draft, tags: event.target.value })} placeholder="infrastructure, project-alpha, follow-up" />
            </label>
          </div>
          <div className="diary-form-footer">
            <span>Up to 10 tags. Notes are private to your account.</span>
            <div className="diary-button-row">
              <button className="diary-button diary-button-quiet" type="button" disabled={busy} onClick={() => setDraft(null)}>Cancel</button>
              <button className="diary-button diary-button-primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save private note"}</button>
            </div>
          </div>
        </form>
      )}

      <div className="diary-list-toolbar">
        <form className="diary-filter-form" onSubmit={(event) => void search(event, 1)}>
          <label className="diary-field diary-search-field">
            <span>Search private notes</span>
            <div className="diary-input-with-icon"><Search aria-hidden="true" /><input value={query} maxLength={120} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, notes, and tags" /></div>
          </label>
          <label className="diary-field diary-category-filter">
            <span>Category</span>
            <select value={category} onChange={(event) => { setCategory(event.target.value); }}>
              <option value="">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <button className="diary-button diary-button-outline" type="submit" disabled={busy}><Search aria-hidden="true" /> Search</button>
        </form>
        <p className="diary-result-count"><FileText aria-hidden="true" /> {page.total} {page.total === 1 ? "note" : "notes"}</p>
      </div>

      {busy && <p className="diary-loading" role="status">Loading your private notes…</p>}
      {!busy && page.items.length === 0 && (
        <div className="diary-empty-state">
          <div className="diary-empty-icon"><BookOpen aria-hidden="true" /></div>
          <h3>{query || category ? "No notes match those filters" : "Your private diary is ready"}</h3>
          <p>{query || category ? "Try a different keyword or category." : "Keep useful technical references, project notes, and reminders together in one private place."}</p>
          {!query && !category && <button className="diary-button diary-button-primary" type="button" onClick={() => setDraft({ id: null, title: "", content: "", category: "Personal Notes", tags: "" })}><Plus aria-hidden="true" /> Create your first note</button>}
        </div>
      )}

      {page.items.length > 0 && (
        <div className="diary-note-grid">
          {page.items.map((note) => (
            <article className="diary-card diary-note-card" key={note.id}>
              <div className="diary-note-card-top"><span className="diary-category-pill">{note.category}</span><span className="diary-private-mark"><LockKeyhole aria-hidden="true" /> Private</span></div>
              <h3>{note.title}</h3>
              {note.content ? <p className="diary-note-body">{note.content}</p> : <p className="diary-note-empty">No note content added.</p>}
              {note.tags.length > 0 && <ul className="diary-tag-list" aria-label="Tags">{note.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>}
              <div className="diary-note-meta"><span>Created {formatTimestamp(note.createdAt)}</span><span>Updated {formatTimestamp(note.updatedAt)}</span></div>
              <div className="diary-note-actions">
                <button className="diary-button diary-button-quiet" type="button" disabled={busy} onClick={() => { setDraft({ id: note.id, title: note.title, content: note.content, category: note.category, tags: note.tags.join(", ") }); setNotice(null); }}><Pencil aria-hidden="true" /> Edit</button>
                <button className="diary-button diary-button-danger" type="button" disabled={busy} onClick={() => void remove(note)}><Trash2 aria-hidden="true" /> Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {page.pageCount > 1 && (
        <nav className="diary-pagination" aria-label="Private diary pages">
          <button className="diary-button diary-button-outline" type="button" disabled={busy || page.page <= 1} onClick={() => void search(undefined, page.page - 1)}><ChevronLeft aria-hidden="true" /> Previous</button>
          <span>Page {page.page} of {page.pageCount}</span>
          <button className="diary-button diary-button-outline" type="button" disabled={busy || page.page >= page.pageCount} onClick={() => void search(undefined, page.page + 1)}>Next <ChevronRight aria-hidden="true" /></button>
        </nav>
      )}

      <div className="diary-privacy-footnote"><AlertTriangle aria-hidden="true" /><span>Private notes are not visible to managers, team leads, owners, or other employees.</span></div>
    </div>
  );
}
