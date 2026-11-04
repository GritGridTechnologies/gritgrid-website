CREATE TABLE IF NOT EXISTS public.private_diary_note (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Personal Notes',
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT private_diary_note_title_length CHECK (char_length(title) BETWEEN 1 AND 160),
  CONSTRAINT private_diary_note_content_length CHECK (char_length(content) <= 20000),
  CONSTRAINT private_diary_note_category_length CHECK (char_length(category) BETWEEN 1 AND 64),
  CONSTRAINT private_diary_note_tags_limit CHECK (cardinality(tags) <= 10)
);

CREATE INDEX IF NOT EXISTS private_diary_note_owner_updated_idx
  ON public.private_diary_note (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS private_diary_note_search_idx
  ON public.private_diary_note USING GIN (
    to_tsvector('simple'::regconfig, coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(category, ''))
  );

CREATE INDEX IF NOT EXISTS private_diary_note_tags_idx
  ON public.private_diary_note USING GIN (tags);

CREATE TABLE IF NOT EXISTS public.shared_diary_entry (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  work_date date NOT NULL,
  work_summary text NOT NULL,
  completed_tasks text NOT NULL DEFAULT '',
  ongoing_tasks text NOT NULL DEFAULT '',
  blockers text NOT NULL DEFAULT '',
  next_day_plan text NOT NULL DEFAULT '',
  project_reference text NOT NULL DEFAULT '',
  links text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT shared_diary_status_valid CHECK (status IN ('draft', 'published')),
  CONSTRAINT shared_diary_summary_length CHECK (char_length(work_summary) BETWEEN 1 AND 4000),
  CONSTRAINT shared_diary_completed_length CHECK (char_length(completed_tasks) <= 4000),
  CONSTRAINT shared_diary_ongoing_length CHECK (char_length(ongoing_tasks) <= 4000),
  CONSTRAINT shared_diary_blockers_length CHECK (char_length(blockers) <= 4000),
  CONSTRAINT shared_diary_next_day_length CHECK (char_length(next_day_plan) <= 4000),
  CONSTRAINT shared_diary_project_ref_length CHECK (char_length(project_reference) <= 500),
  CONSTRAINT shared_diary_links_length CHECK (char_length(links) <= 2000),
  CONSTRAINT shared_diary_user_date_unique UNIQUE (user_id, work_date),
  CONSTRAINT shared_diary_publish_timestamp_consistent CHECK (
    (status = 'draft' AND published_at IS NULL) OR
    (status = 'published' AND published_at IS NOT NULL)
  )
);

ALTER TABLE public.shared_diary_entry
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'shared_diary_publish_timestamp_consistent'
      AND conrelid = 'public.shared_diary_entry'::regclass
  ) THEN
    ALTER TABLE public.shared_diary_entry
      ADD CONSTRAINT shared_diary_publish_timestamp_consistent CHECK (
        (status = 'draft' AND published_at IS NULL) OR
        (status = 'published' AND published_at IS NOT NULL)
      );
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS shared_diary_published_date_idx
  ON public.shared_diary_entry (work_date DESC, created_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS shared_diary_search_idx
  ON public.shared_diary_entry USING GIN (
    to_tsvector('simple'::regconfig,
      coalesce(work_summary, '') || ' ' ||
      coalesce(completed_tasks, '') || ' ' ||
      coalesce(ongoing_tasks, '') || ' ' ||
      coalesce(blockers, '') || ' ' ||
      coalesce(next_day_plan, '') || ' ' ||
      coalesce(project_reference, '')
    )
  );
