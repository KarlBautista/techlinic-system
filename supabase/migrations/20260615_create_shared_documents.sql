-- Stores prescription/certificate data so patients can view & print/save as PDF
CREATE TABLE shared_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('prescription', 'certificate')),
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days')
);

-- RLS: anyone can read (patients access via email link without logging in)
ALTER TABLE shared_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read shared documents"
  ON shared_documents FOR SELECT USING (true);

-- Only logged-in staff can create documents
CREATE POLICY "Authenticated users can insert shared documents"
  ON shared_documents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
