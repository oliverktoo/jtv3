-- Create admin request status enum
CREATE TYPE admin_request_status_enum AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED'
);

-- Create tournament_admin_requests table
CREATE TABLE tournament_admin_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  status admin_request_status_enum NOT NULL DEFAULT 'PENDING',
  request_message TEXT,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_tournament_admin_requests_user_id ON tournament_admin_requests(user_id);
CREATE INDEX idx_tournament_admin_requests_tournament_id ON tournament_admin_requests(tournament_id);
CREATE INDEX idx_tournament_admin_requests_status ON tournament_admin_requests(status);
CREATE INDEX idx_tournament_admin_requests_created_at ON tournament_admin_requests(created_at DESC);

-- Add RLS policies (if using Row Level Security)
ALTER TABLE tournament_admin_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
CREATE POLICY "Users can view their own requests" 
ON tournament_admin_requests FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Super admins can view all requests (adjust based on your auth setup)
CREATE POLICY "Super admins can view all requests" 
ON tournament_admin_requests FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_organization_roles
    WHERE user_id::text = auth.uid()::text
    AND role = 'SUPER_ADMIN'
    AND org_id IS NULL
  )
);

-- Policy: Users can insert their own requests
CREATE POLICY "Users can insert their own requests" 
ON tournament_admin_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pending requests (for cancellation)
CREATE POLICY "Users can cancel their own pending requests" 
ON tournament_admin_requests FOR UPDATE 
USING (auth.uid() = user_id AND status = 'PENDING')
WITH CHECK (status = 'CANCELLED');

-- Policy: Super admins can update any pending request (for approval/rejection)
CREATE POLICY "Super admins can approve or reject requests" 
ON tournament_admin_requests FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_organization_roles
    WHERE user_id::text = auth.uid()::text
    AND role = 'SUPER_ADMIN'
    AND org_id IS NULL
  )
  AND status = 'PENDING'
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_tournament_admin_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tournament_admin_requests_updated_at
BEFORE UPDATE ON tournament_admin_requests
FOR EACH ROW
EXECUTE FUNCTION update_tournament_admin_requests_updated_at();

-- Optional: Add constraint to prevent duplicate pending/approved requests
CREATE UNIQUE INDEX idx_unique_active_request 
ON tournament_admin_requests(user_id, tournament_id, status)
WHERE status IN ('PENDING', 'APPROVED');

COMMENT ON TABLE tournament_admin_requests IS 'Tracks user requests to become tournament admins';
COMMENT ON COLUMN tournament_admin_requests.request_message IS 'Optional message from user explaining why they want to admin';
COMMENT ON COLUMN tournament_admin_requests.rejection_reason IS 'Reason provided by super admin if request is rejected';
