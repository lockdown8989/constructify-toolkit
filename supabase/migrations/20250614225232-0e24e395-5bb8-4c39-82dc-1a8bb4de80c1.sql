
-- Add file_type column if it doesn't exist and update constraints
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS file_type text,
ADD COLUMN IF NOT EXISTS file_extension text;

-- Update the documents table to include better file handling
ALTER TABLE public.documents 
ALTER COLUMN file_type SET DEFAULT 'application/octet-stream';

-- Create an index for better performance when filtering by file type
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON public.documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_file_extension ON public.documents(file_extension);

-- Add a function to validate file types
CREATE OR REPLACE FUNCTION public.validate_document_file_type()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Extract file extension from the file name
  NEW.file_extension = lower(substring(NEW.name from '\.([^.]*)$'));
  
  -- Set appropriate MIME type based on extension
  CASE NEW.file_extension
    WHEN 'pdf' THEN NEW.file_type = 'application/pdf';
    WHEN 'doc' THEN NEW.file_type = 'application/msword';
    WHEN 'docx' THEN NEW.file_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    WHEN 'jpg', 'jpeg' THEN NEW.file_type = 'image/jpeg';
    WHEN 'png' THEN NEW.file_type = 'image/png';
    WHEN 'gif' THEN NEW.file_type = 'image/gif';
    WHEN 'txt' THEN NEW.file_type = 'text/plain';
    WHEN 'csv' THEN NEW.file_type = 'text/csv';
    WHEN 'xls' THEN NEW.file_type = 'application/vnd.ms-excel';
    WHEN 'xlsx' THEN NEW.file_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    ELSE NEW.file_type = COALESCE(NEW.file_type, 'application/octet-stream');
  END CASE;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically set file type and extension
DROP TRIGGER IF EXISTS trigger_validate_document_file_type ON public.documents;
CREATE TRIGGER trigger_validate_document_file_type
  BEFORE INSERT OR UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_document_file_type();

-- Update existing records to have proper file types
UPDATE public.documents 
SET 
  file_extension = lower(substring(name from '\.([^.]*)$')),
  file_type = CASE 
    WHEN lower(substring(name from '\.([^.]*)$')) = 'pdf' THEN 'application/pdf'
    WHEN lower(substring(name from '\.([^.]*)$')) = 'doc' THEN 'application/msword'
    WHEN lower(substring(name from '\.([^.]*)$')) = 'docx' THEN 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    WHEN lower(substring(name from '\.([^.]*)$')) IN ('jpg', 'jpeg') THEN 'image/jpeg'
    WHEN lower(substring(name from '\.([^.]*)$')) = 'png' THEN 'image/png'
    WHEN lower(substring(name from '\.([^.]*)$')) = 'gif' THEN 'image/gif'
    WHEN lower(substring(name from '\.([^.]*)$')) = 'txt' THEN 'text/plain'
    WHEN lower(substring(name from '\.([^.]*)$')) = 'csv' THEN 'text/csv'
    WHEN lower(substring(name from '\.([^.]*)$')) = 'xls' THEN 'application/vnd.ms-excel'
    WHEN lower(substring(name from '\.([^.]*)$')) = 'xlsx' THEN 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ELSE COALESCE(file_type, 'application/octet-stream')
  END
WHERE file_type IS NULL OR file_extension IS NULL;

-- Create a storage bucket for employee documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'employee-documents',
  'employee-documents',
  false,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

-- Create storage policies for the employee-documents bucket
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'employee-documents');

CREATE POLICY "Allow users to read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'employee-documents');

CREATE POLICY "Allow users to update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'employee-documents');

CREATE POLICY "Allow users to delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'employee-documents');
