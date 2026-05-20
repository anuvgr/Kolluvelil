-- Create the 5 required tables for Kolluvelil Rental Management
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT, 
  phone TEXT, 
  email TEXT, 
  address TEXT,
  rentAmount NUMERIC, 
  deposit NUMERIC, 
  status TEXT,
  agreementDate TEXT, 
  vacateDate TEXT, 
  photo TEXT,
  idType TEXT, 
  idCard TEXT, 
  documents JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  clientId TEXT, 
  tenantName TEXT,
  tenantPhone TEXT,
  amount NUMERIC, 
  month TEXT, 
  year INTEGER,
  paymentMethod TEXT, 
  date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  title TEXT, 
  amount NUMERIC, 
  tenantId TEXT,
  category TEXT, 
  description TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "user" TEXT, 
  action TEXT, 
  details TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1. Disable security for now so your sync works immediately
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. ENABLE REAL-TIME REPLICATION
-- This allows different browsers to see updates instantly without refreshing
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE clients, payments, expenses, logs, users;
