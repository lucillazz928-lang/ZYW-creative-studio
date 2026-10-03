-- 扩展便签颜色（已有 wall_notes 表时执行一次）
alter table public.wall_notes
  drop constraint if exists wall_notes_color_check;

alter table public.wall_notes
  add constraint wall_notes_color_check
  check (color in ('yellow', 'pink', 'orange', 'blue', 'green', 'mint', 'lavender', 'peach'));
