export type DiaryPageSlice<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type PrivateDiaryNote = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type PrivateDiaryPage = DiaryPageSlice<PrivateDiaryNote> & { categories: string[] };

export type TeamProfile = {
  id: string;
  name: string;
  role: string;
  image: string | null;
};

export type SharedDiaryEntry = {
  id: string;
  workDate: string;
  workSummary: string;
  completedTasks: string;
  ongoingTasks: string;
  blockers: string;
  nextDayPlan: string;
  projectReference: string;
  links: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  publishedAt: Date | string | null;
  member: TeamProfile;
};

export type MyDiaryEntry = Omit<SharedDiaryEntry, "member">;

export type DiaryDashboard = {
  todayUpdates: number;
  todayContributors: number;
  recentUpdates: Array<{
    id: string;
    workDate: string;
    workSummary: string;
    status: string;
    member: { name: string; role: string };
  }>;
  blockers: Array<{
    id: string;
    workDate: string;
    blockers: string;
    projectReference: string;
    member: { name: string; role: string };
  }>;
};

export type TeamDiaryInitialData = {
  viewerId: string;
  viewerRole: string;
  today: string;
  privateNotes: PrivateDiaryPage;
  shared: DiaryPageSlice<SharedDiaryEntry>;
  dashboard: DiaryDashboard;
  people: TeamProfile[];
  myTodayEntry: MyDiaryEntry | null;
};
