# Supabase Setup Instructions

## Database Migration

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration file `001_initial_schema.sql` to set up:
   - pgvector extension
   - All tables (users, courses, enrollments, documents, chunks, conversations, messages)
   - Row Level Security policies
   - Indexes and triggers

## Storage Setup

Create a storage bucket for course documents:

1. Go to Storage in Supabase dashboard
2. Create a new bucket named `course-documents`
3. Set it to **Public** (or configure policies as needed)
4. Add the following storage policy:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-documents');

-- Allow authenticated users to read files
CREATE POLICY "Authenticated users can read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'course-documents');

-- Allow lecturers to delete files
CREATE POLICY "Lecturers can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-documents' AND
  EXISTS (
    SELECT 1 FROM public.courses c
    JOIN public.documents d ON d.course_id = c.id
    WHERE d.storage_path = (storage.foldername(name) || '/' || storage.filename(name))
    AND c.lecturer_id = auth.uid()
  )
);
```

## Environment Variables

Make sure to set these in your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

