-- ====================================================
-- クラウドファンディング クーポン管理アプリ スキーマ
-- Supabase SQL Editorで実行してください
-- ====================================================

-- campaigns テーブル（クラウドファンディングキャンペーン）
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  goal_amount integer,
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

-- coupon_tiers テーブル（支援金額ごとのリターン種別）
create table if not exists coupon_tiers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  name text not null,
  min_amount integer not null default 0,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed', 'item')),
  discount_value text not null,
  valid_from date,
  valid_until date,
  created_at timestamptz default now()
);

-- coupons テーブル（個別クーポン）
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete set null,
  tier_id uuid references coupon_tiers(id) on delete set null,
  code text unique not null,
  supporter_name text,
  supporter_email text,
  support_amount integer,
  status text not null default 'unused' check (status in ('unused', 'used', 'expired')),
  used_at timestamptz,
  issued_at timestamptz default now(),
  created_at timestamptz default now()
);

-- インデックス
create index if not exists idx_coupons_code on coupons(code);
create index if not exists idx_coupons_email on coupons(supporter_email);
create index if not exists idx_coupons_status on coupons(status);
create index if not exists idx_coupons_campaign on coupons(campaign_id);

-- Row Level Security
alter table campaigns enable row level security;
alter table coupon_tiers enable row level security;
alter table coupons enable row level security;

-- 一般公開ポリシー（支援者がクーポンを確認できるようにする）
create policy "Anyone can read campaigns" on campaigns
  for select using (true);

create policy "Anyone can read tiers" on coupon_tiers
  for select using (true);

create policy "Anyone can read coupons" on coupons
  for select using (true);

-- 管理者操作はサービスロールキーを使用（バックエンドAPI経由）
-- サービスロールはRLSをバイパスするため追加ポリシー不要

-- サンプルデータ（任意）
insert into campaigns (title, description, goal_amount, start_date, end_date)
values (
  'uKa 開店クラウドファンディング',
  'こだわりの食材を使った本格フレンチレストランの開店を応援してください！',
  1000000,
  '2026-06-01',
  '2026-08-31'
) on conflict do nothing;
