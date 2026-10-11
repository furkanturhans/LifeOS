-- Apply after platform.sql. Never make this bucket public.
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('profession-documents','profession-documents',false,5242880,ARRAY['application/pdf','image/jpeg','image/png'])
ON CONFLICT(id) DO UPDATE SET public=false,file_size_limit=5242880,allowed_mime_types=EXCLUDED.allowed_mime_types;

CREATE OR REPLACE FUNCTION public.can_access_profession_document(object_name text, reviewing boolean DEFAULT false)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public
AS $$
 SELECT EXISTS (
   SELECT 1 FROM public.users u WHERE u."supabaseId"=auth.uid()::text
   AND ((NOT reviewing AND split_part(object_name,'/',1)=u.id)
     OR (reviewing AND EXISTS (SELECT 1 FROM public.user_permissions p
       WHERE p."userId"=u.id AND p."moduleId"='platform' AND p.resource='profession-review' AND p.granted=true)))
 );
$$;
REVOKE ALL ON FUNCTION public.can_access_profession_document(text,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_profession_document(text,boolean) TO authenticated;
CREATE POLICY "profession document owner upload" ON storage.objects FOR INSERT TO authenticated
WITH CHECK(bucket_id='profession-documents' AND public.can_access_profession_document(name,false));
CREATE POLICY "profession document private read" ON storage.objects FOR SELECT TO authenticated
USING(bucket_id='profession-documents' AND (public.can_access_profession_document(name,false) OR public.can_access_profession_document(name,true)));
-- No client UPDATE or DELETE policy: reviewed evidence cannot be replaced afterwards.
