"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, LockKeyhole, UsersRound } from "lucide-react";
import TeamDiaryPrivatePanel from "@/components/team-diary-private";
import TeamDiarySharedPanel from "@/components/team-diary-shared";
import type { TeamDiaryInitialData } from "@/components/team-diary-types";

export default function TeamDiary({ initialData }: { initialData: TeamDiaryInitialData }) {
  const [activeTab, setActiveTab] = useState<"private" | "shared">("private");
  const roleLabel = initialData.viewerRole === "manager" ? "Team lead / Manager" : initialData.viewerRole === "owner" || initialData.viewerRole === "admin" ? "Owner" : "Employee";

  return (
    <main className="diary-page">
      <div className="diary-container">
        <Link className="diary-back-link" href="/team"><ArrowLeft aria-hidden="true" /> Back to Team Portal</Link>
        <header className="diary-header">
          <div>
            <p className="eyebrow"><BookOpen aria-hidden="true" /> GritGrid team workspace</p>
            <h1>Team <em>Diary</em></h1>
            <p className="diary-intro">Keep your own reference notes private, and share a clear daily update with the team.</p>
          </div>
          <span className="diary-role-badge">{roleLabel}</span>
        </header>

        <div className="diary-tabs" role="tablist" aria-label="Diary spaces">
          <button id="private-diary-tab" className={activeTab === "private" ? "active" : ""} type="button" role="tab" aria-selected={activeTab === "private"} aria-controls="private-diary-panel" onClick={() => setActiveTab("private")}>
            <LockKeyhole aria-hidden="true" /><span>My Private Diary</span><small>Only you can see these notes</small>
          </button>
          <button id="shared-diary-tab" className={activeTab === "shared" ? "active" : ""} type="button" role="tab" aria-selected={activeTab === "shared"} aria-controls="shared-diary-panel" onClick={() => setActiveTab("shared")}>
            <UsersRound aria-hidden="true" /><span>Team Shared Diary</span><small>Published updates for everyone</small>
          </button>
        </div>

        <section id="private-diary-panel" role="tabpanel" aria-labelledby="private-diary-tab" hidden={activeTab !== "private"}>
          <TeamDiaryPrivatePanel initialPage={initialData.privateNotes} />
        </section>
        <section id="shared-diary-panel" role="tabpanel" aria-labelledby="shared-diary-tab" hidden={activeTab !== "shared"}>
          <TeamDiarySharedPanel initialData={initialData} />
        </section>
      </div>
    </main>
  );
}
