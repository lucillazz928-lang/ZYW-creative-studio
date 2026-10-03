-- 在 Supabase Dashboard → SQL Editor 中执行本脚本一次即可。
-- 留言墙：全站共享、匿名可读可写（第一阶段访客墙）

create table if not exists public.wall_notes (
  id uuid primary key default gen_random_uuid(),
  text text not null check (char_length(trim(text)) > 0 and char_length(text) <= 120),
  color text not null default 'yellow'
    check (color in ('yellow', 'pink', 'orange', 'blue', 'green', 'mint', 'lavender', 'peach')),
  x numeric not null default 20 check (x >= 0 and x <= 100),
  y numeric not null default 20 check (y >= 0 and y <= 100),
  created_at timestamptz not null default now()
);

create index if not exists wall_notes_created_at_idx
  on public.wall_notes (created_at desc);

alter table public.wall_notes enable row level security;

drop policy if exists "wall_notes_select_all" on public.wall_notes;
drop policy if exists "wall_notes_insert_all" on public.wall_notes;
drop policy if exists "wall_notes_update_all" on public.wall_notes;
drop policy if exists "wall_notes_delete_all" on public.wall_notes;

create policy "wall_notes_select_all"
  on public.wall_notes for select
  using (true);

create policy "wall_notes_insert_all"
  on public.wall_notes for insert
  with check (true);

create policy "wall_notes_update_all"
  on public.wall_notes for update
  using (true)
  with check (true);

create policy "wall_notes_delete_all"
  on public.wall_notes for delete
  using (true);

-- 开启 Realtime（若已添加过会报错，可忽略）
do $$
begin
  alter publication supabase_realtime add table public.wall_notes;
exception
  when duplicate_object then null;
  when others then null;
end $$;

-- 可选：种子便签（表为空时手动取消注释执行）
-- insert into public.wall_notes (text, color, x, y) values
--   ('欢迎来到创意小屋', 'yellow', 18, 22),
--   ('把想法贴在墙上', 'pink', 42, 30);
