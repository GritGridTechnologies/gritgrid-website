CREATE TABLE public.finance_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_system boolean NOT NULL DEFAULT false,
  created_by text REFERENCES public."user"(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT finance_categories_name_length CHECK (char_length(btrim(name)) BETWEEN 1 AND 80),
  CONSTRAINT finance_categories_description_length CHECK (char_length(description) <= 500)
);

CREATE UNIQUE INDEX finance_categories_name_unique_idx
  ON public.finance_categories (lower(btrim(name)));

CREATE INDEX finance_categories_active_name_idx
  ON public.finance_categories (name)
  WHERE archived_at IS NULL;

CREATE TABLE public.finance_expenses (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  amount numeric(14, 2) NOT NULL,
  currency varchar(3) NOT NULL DEFAULT 'INR',
  category_id text NOT NULL REFERENCES public.finance_categories(id) ON DELETE RESTRICT,
  expense_date date NOT NULL,
  expense_time time,
  payment_method text NOT NULL,
  paid_by text NOT NULL DEFAULT '',
  vendor text NOT NULL DEFAULT '',
  project_reference text NOT NULL DEFAULT '',
  reference_number text,
  status text NOT NULL DEFAULT 'active',
  source text NOT NULL DEFAULT 'manual',
  idempotency_key text NOT NULL,
  created_by text NOT NULL REFERENCES public."user"(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_by text REFERENCES public."user"(id) ON DELETE RESTRICT,
  updated_at timestamptz NOT NULL DEFAULT now(),
  voided_by text REFERENCES public."user"(id) ON DELETE RESTRICT,
  voided_at timestamptz,
  CONSTRAINT finance_expenses_title_length CHECK (char_length(btrim(title)) BETWEEN 1 AND 160),
  CONSTRAINT finance_expenses_description_length CHECK (char_length(description) <= 4000),
  CONSTRAINT finance_expenses_amount_positive CHECK (amount > 0),
  CONSTRAINT finance_expenses_currency_valid CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT finance_expenses_payment_method_valid CHECK (payment_method IN ('cash', 'upi', 'bank_transfer', 'debit_card', 'credit_card', 'other')),
  CONSTRAINT finance_expenses_vendor_length CHECK (char_length(vendor) <= 160),
  CONSTRAINT finance_expenses_paid_by_length CHECK (char_length(paid_by) <= 160),
  CONSTRAINT finance_expenses_project_reference_length CHECK (char_length(project_reference) <= 160),
  CONSTRAINT finance_expenses_reference_number_length CHECK (reference_number IS NULL OR char_length(reference_number) <= 120),
  CONSTRAINT finance_expenses_status_valid CHECK (status IN ('active', 'void')),
  CONSTRAINT finance_expenses_source_valid CHECK (source IN ('manual', 'assistant')),
  CONSTRAINT finance_expenses_idempotency_key_length CHECK (char_length(idempotency_key) BETWEEN 1 AND 180),
  CONSTRAINT finance_expenses_idempotency_key_unique UNIQUE (idempotency_key),
  CONSTRAINT finance_expenses_void_metadata_consistent CHECK (
    (status = 'active' AND voided_by IS NULL AND voided_at IS NULL) OR
    (status = 'void' AND voided_by IS NOT NULL AND voided_at IS NOT NULL)
  )
);

CREATE INDEX finance_expenses_active_date_currency_idx
  ON public.finance_expenses (expense_date DESC, currency)
  WHERE status = 'active';

CREATE INDEX finance_expenses_active_category_date_idx
  ON public.finance_expenses (category_id, expense_date DESC)
  WHERE status = 'active';

CREATE INDEX finance_expenses_active_payment_date_idx
  ON public.finance_expenses (payment_method, expense_date DESC)
  WHERE status = 'active';

CREATE INDEX finance_expenses_vendor_search_idx
  ON public.finance_expenses USING GIN (to_tsvector('simple'::regconfig, coalesce(title, '') || ' ' || coalesce(vendor, '') || ' ' || coalesce(description, '') || ' ' || coalesce(project_reference, '')));

CREATE TABLE public.finance_expense_attachments (
  id text PRIMARY KEY,
  expense_id text NOT NULL REFERENCES public.finance_expenses(id) ON DELETE RESTRICT,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  byte_size integer NOT NULL,
  sha256 text NOT NULL,
  content bytea NOT NULL,
  uploaded_by text NOT NULL REFERENCES public."user"(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT finance_attachment_file_name_length CHECK (char_length(file_name) BETWEEN 1 AND 180),
  CONSTRAINT finance_attachment_mime_valid CHECK (mime_type IN ('application/pdf', 'image/jpeg', 'image/png')),
  CONSTRAINT finance_attachment_size_valid CHECK (byte_size BETWEEN 1 AND 4194304),
  CONSTRAINT finance_attachment_hash_valid CHECK (sha256 ~ '^[a-f0-9]{64}$'),
  CONSTRAINT finance_attachment_content_size_matches CHECK (octet_length(content) = byte_size),
  CONSTRAINT finance_attachment_expense_hash_unique UNIQUE (expense_id, sha256)
);

CREATE INDEX finance_expense_attachments_expense_created_idx
  ON public.finance_expense_attachments (expense_id, created_at DESC);

CREATE TABLE public.finance_budgets (
  id text PRIMARY KEY,
  name text NOT NULL,
  budget_type text NOT NULL,
  amount numeric(14, 2) NOT NULL,
  currency varchar(3) NOT NULL DEFAULT 'INR',
  category_id text REFERENCES public.finance_categories(id) ON DELETE RESTRICT,
  project_reference text,
  period_start date NOT NULL,
  period_end date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_by text NOT NULL REFERENCES public."user"(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_by text REFERENCES public."user"(id) ON DELETE RESTRICT,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT finance_budgets_name_length CHECK (char_length(btrim(name)) BETWEEN 1 AND 120),
  CONSTRAINT finance_budgets_type_valid CHECK (budget_type IN ('company', 'category', 'project')),
  CONSTRAINT finance_budgets_amount_positive CHECK (amount > 0),
  CONSTRAINT finance_budgets_currency_valid CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT finance_budgets_period_valid CHECK (period_start <= period_end),
  CONSTRAINT finance_budgets_scope_valid CHECK (
    (budget_type = 'company' AND category_id IS NULL AND project_reference IS NULL) OR
    (budget_type = 'category' AND category_id IS NOT NULL AND project_reference IS NULL) OR
    (budget_type = 'project' AND category_id IS NULL AND nullif(btrim(project_reference), '') IS NOT NULL)
  )
);

CREATE UNIQUE INDEX finance_budgets_scope_period_unique_idx
  ON public.finance_budgets (
    budget_type,
    coalesce(category_id, ''),
    coalesce(project_reference, ''),
    currency,
    period_start,
    period_end
  )
  WHERE is_active = true;

CREATE INDEX finance_budgets_active_period_idx
  ON public.finance_budgets (period_start, period_end)
  WHERE is_active = true;

CREATE TABLE public.finance_audit_log (
  id text PRIMARY KEY,
  expense_id text NOT NULL REFERENCES public.finance_expenses(id) ON DELETE RESTRICT,
  action text NOT NULL,
  previous_data jsonb,
  new_data jsonb NOT NULL,
  changed_by text NOT NULL REFERENCES public."user"(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT finance_audit_action_valid CHECK (action IN ('created', 'updated', 'voided'))
);

CREATE INDEX finance_audit_expense_created_idx
  ON public.finance_audit_log (expense_id, created_at DESC);

CREATE INDEX finance_audit_changed_by_created_idx
  ON public.finance_audit_log (changed_by, created_at DESC);

CREATE TABLE public.finance_ai_drafts (
  id text PRIMARY KEY,
  owner_id text NOT NULL REFERENCES public."user"(id) ON DELETE RESTRICT,
  request_date date NOT NULL,
  request_hash text NOT NULL,
  draft_payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  confirmed_at timestamptz,
  CONSTRAINT finance_ai_draft_hash_valid CHECK (request_hash ~ '^[a-f0-9]{64}$'),
  CONSTRAINT finance_ai_draft_status_valid CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  CONSTRAINT finance_ai_draft_confirmation_consistent CHECK (
    (status = 'confirmed' AND confirmed_at IS NOT NULL) OR
    (status IN ('pending', 'cancelled') AND confirmed_at IS NULL)
  ),
  CONSTRAINT finance_ai_draft_request_unique UNIQUE (owner_id, request_date, request_hash)
);

CREATE INDEX finance_ai_drafts_owner_created_idx
  ON public.finance_ai_drafts (owner_id, created_at DESC);

INSERT INTO public.finance_categories (id, name, is_system)
VALUES
  ('finance-cat-software-subscriptions', 'Software subscriptions', true),
  ('finance-cat-cloud-hosting', 'Cloud hosting', true),
  ('finance-cat-domains-hosting', 'Domains and hosting', true),
  ('finance-cat-ai-api-expenses', 'AI API expenses', true),
  ('finance-cat-marketing-advertising', 'Marketing and advertising', true),
  ('finance-cat-travel-transportation', 'Travel and transportation', true),
  ('finance-cat-food-refreshments', 'Food and refreshments', true),
  ('finance-cat-office-expenses', 'Office expenses', true),
  ('finance-cat-salaries-payments', 'Salaries and payments', true),
  ('finance-cat-hardware-equipment', 'Hardware and equipment', true),
  ('finance-cat-internet-communication', 'Internet and communication', true),
  ('finance-cat-client-project-expenses', 'Client project expenses', true),
  ('finance-cat-legal-accounting', 'Legal and accounting', true),
  ('finance-cat-miscellaneous', 'Miscellaneous', true)
ON CONFLICT DO NOTHING;
