
-- Function to create storage policies for the documents bucket
CREATE OR REPLACE FUNCTION public.create_storage_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow authenticated users to upload files
  EXECUTE format($policy$
    CREATE POLICY "Allow authenticated users to upload files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'documents')
  $policy$);
  
  -- Allow users to read any file
  EXECUTE format($policy$
    CREATE POLICY "Allow users to read any file"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'documents')
  $policy$);
  
  -- Allow users to update their own files
  EXECUTE format($policy$
    CREATE POLICY "Allow users to update their own files"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'documents' AND auth.uid() = owner)
  $policy$);
  
  -- Allow users to delete their own files
  EXECUTE format($policy$
    CREATE POLICY "Allow users to delete their own files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'documents' AND auth.uid() = owner)
  $policy$);
END;
$$;
