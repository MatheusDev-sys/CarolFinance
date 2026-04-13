-- Database Schema for Carolaine Finance
-- Project ID: mstbobevexibrrlsyihx

-- 1. Create Requests Table
CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    valor NUMERIC(12, 2) NOT NULL CHECK (valor > 0),
    motivo TEXT NOT NULL,
    comprovante_url TEXT,
    status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'APROVADO', 'NEGADO')),
    resposta_admin TEXT,
    pago BOOLEAN NOT NULL DEFAULT FALSE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    data_resposta TIMESTAMP WITH TIME ZONE
);

-- 2. Enable RLS
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- 3. Create Profiles Table (to manage roles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Requests

-- Users can view their own requests
CREATE POLICY "Users can view own requests" 
ON requests FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create own requests" 
ON requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all requests" 
ON requests FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Admins can update requests (status, resposta_admin, pago)
CREATE POLICY "Admins can update requests" 
ON requests FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 5. Policies for Profiles

-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 6. Storage Setup (Manual step in Supabase UI usually, but here are the policies)
-- Bucket name: 'comprovantes'

-- 7. Enable Realtime
-- Execute no SQL Editor:
-- ALTER publication supabase_realtime ADD TABLE requests;

-- Policy for authenticated users to upload their own files
-- CREATE POLICY "Authenticated users can upload comprovantes"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'comprovantes' AND auth.role() = 'authenticated');

-- Policy for users to see their own files
-- CREATE POLICY "Users can view own comprovantes"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'comprovantes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy for admins to see all files
-- CREATE POLICY "Admins can view all comprovantes"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'comprovantes' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
