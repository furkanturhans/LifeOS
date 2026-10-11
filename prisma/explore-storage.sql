-- Run once in the Supabase SQL editor after reviewing the bucket policies.
-- Media is private; authenticated Explore viewers use short-lived signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('explore-media', 'explore-media', false, 52428800,
  array['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict (id) do nothing;

create policy "Explore media authenticated read" on storage.objects for select to authenticated
using (bucket_id = 'explore-media');
create policy "Explore media own upload" on storage.objects for insert to authenticated
with check (bucket_id = 'explore-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Explore media own delete" on storage.objects for delete to authenticated
using (bucket_id = 'explore-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
