-- Manager-Led Registration System Seed Data
-- This file contains sample data for testing the manager dashboard

-- Insert sample team managers
INSERT INTO team_managers (id, org_id, first_name, last_name, email, phone_number, id_number, certification_level, status, experience_years, bio) VALUES
('demo-manager-1', '550e8400-e29b-41d4-a716-446655440001', 'John', 'Manager', 'john.manager@example.com', '+254700123450', '12345678', 'CAF_A', 'ACTIVE', 5, 'Experienced team manager with 5 years in youth football development.'),
('demo-manager-2', '550e8400-e29b-41d4-a716-446655440001', 'Sarah', 'Coach', 'sarah.coach@example.com', '+254700123451', '12345679', 'CAF_B', 'ACTIVE', 3, 'Youth development specialist focused on grassroots football.'),
('demo-manager-3', '550e8400-e29b-41d4-a716-446655440001', 'Mike', 'Anderson', 'mike.anderson@example.com', '+254700123452', '12345680', 'GRASSROOTS', 'ACTIVE', 8, 'Veteran coach with extensive experience in competitive youth leagues.');

-- Insert sample teams
INSERT INTO teams (id, org_id, tournament_id, name, manager_id, club_name, registration_status, contact_email, contact_phone, home_venue, description) VALUES
('demo-team-1', '550e8400-e29b-41d4-a716-446655440001', NULL, 'Nairobi Eagles FC', 'demo-manager-1', 'Nairobi Eagles Football Club', 'ACTIVE', 'eagles@example.com', '+254700123460', 'Nairobi Stadium', 'Youth football team focused on developing local talent.'),
('demo-team-2', '550e8400-e29b-41d4-a716-446655440001', NULL, 'Eastlands United', 'demo-manager-2', 'Eastlands United FC', 'ACTIVE', 'eastlands@example.com', '+254700123461', 'Eastlands Sports Ground', 'Community-based team serving the Eastlands area.'),
('demo-team-3', '550e8400-e29b-41d4-a716-446655440001', NULL, 'Westlands Warriors', 'demo-manager-3', 'Westlands Warriors FC', 'DRAFT', 'warriors@example.com', '+254700123462', 'Westlands Recreation Center', 'Competitive youth team with focus on skill development.');

-- Insert manager-team assignments
INSERT INTO manager_team_assignments (manager_id, team_id, role, status, start_date) VALUES
('demo-manager-1', 'demo-team-1', 'HEAD_MANAGER', 'ACTIVE', '2024-01-01'),
('demo-manager-2', 'demo-team-2', 'HEAD_MANAGER', 'ACTIVE', '2024-01-15'),
('demo-manager-3', 'demo-team-3', 'HEAD_MANAGER', 'ACTIVE', '2024-02-01'),
('demo-manager-2', 'demo-team-1', 'ASSISTANT_MANAGER', 'ACTIVE', '2024-03-01'); -- Sarah as assistant to John's team

-- Insert sample team invitations with various statuses
INSERT INTO team_invitations (
  id, manager_id, team_id, org_id, first_name, last_name, email, phone_number, position, 
  invitation_code, registration_link, custom_message, invited_at, expires_at, status, 
  started_at, completed_at, reminders_sent, last_reminder_at, email_opens, link_clicks
) VALUES
-- Completed invitations
('inv-001', 'demo-manager-1', 'demo-team-1', '550e8400-e29b-41d4-a716-446655440001', 'James', 'Kiprop', 'james.kiprop@example.com', '+254701234567', 'MIDFIELDER', 
 'abc123def456', 'https://jamiitourney.com/register/abc123def456?org=550e8400-e29b-41d4-a716-446655440001', 
 'Welcome to Nairobi Eagles! We are excited to have you join our team.', 
 '2024-10-01 10:00:00', '2024-11-01 10:00:00', 'COMPLETED', 
 '2024-10-01 14:30:00', '2024-10-02 09:15:00', 0, NULL, 2, 1),

('inv-002', 'demo-manager-1', 'demo-team-1', '550e8400-e29b-41d4-a716-446655440001', 'Mary', 'Wanjiku', 'mary.wanjiku@example.com', '+254701234568', 'DEFENDER', 
 'def456ghi789', 'https://jamiitourney.com/register/def456ghi789?org=550e8400-e29b-41d4-a716-446655440001', 
 'Join our defensive lineup! Your skills would be a great addition to our team.', 
 '2024-10-02 11:00:00', '2024-11-02 11:00:00', 'COMPLETED', 
 '2024-10-02 15:45:00', '2024-10-03 08:20:00', 0, NULL, 3, 2),

('inv-003', 'demo-manager-1', 'demo-team-1', '550e8400-e29b-41d4-a716-446655440001', 'Peter', 'Otieno', 'peter.otieno@example.com', '+254701234569', 'GOALKEEPER', 
 'ghi789jkl012', 'https://jamiitourney.com/register/ghi789jkl012?org=550e8400-e29b-41d4-a716-446655440001', 
 'We need a reliable goalkeeper - perfect fit for you!', 
 '2024-10-03 12:00:00', '2024-11-03 12:00:00', 'COMPLETED', 
 '2024-10-03 16:20:00', '2024-10-04 10:45:00', 1, '2024-10-04 09:00:00', 1, 1),

-- Started but not completed
('inv-004', 'demo-manager-1', 'demo-team-1', '550e8400-e29b-41d4-a716-446655440001', 'Grace', 'Muthoni', 'grace.muthoni@example.com', '+254701234570', 'FORWARD', 
 'jkl012mno345', 'https://jamiitourney.com/register/jkl012mno345?org=550e8400-e29b-41d4-a716-446655440001', 
 'Your attacking skills would make a huge difference for our team!', 
 '2024-10-15 13:00:00', '2024-11-15 13:00:00', 'STARTED', 
 '2024-10-15 17:30:00', NULL, 1, '2024-10-20 10:00:00', 4, 3),

('inv-005', 'demo-manager-1', 'demo-team-1', '550e8400-e29b-41d4-a716-446655440001', 'David', 'Kamau', 'david.kamau@example.com', '+254701234571', 'MIDFIELDER', 
 'mno345pqr678', 'https://jamiitourney.com/register/mno345pqr678?org=550e8400-e29b-41d4-a716-446655440001', 
 'We could use your midfield expertise in our upcoming matches.', 
 '2024-10-18 14:00:00', '2024-11-18 14:00:00', 'STARTED', 
 '2024-10-18 18:45:00', NULL, 0, NULL, 2, 1),

-- Pending invitations
('inv-006', 'demo-manager-1', 'demo-team-1', '550e8400-e29b-41d4-a716-446655440001', 'Susan', 'Akinyi', 'susan.akinyi@example.com', '+254701234572', 'DEFENDER', 
 'pqr678stu901', 'https://jamiitourney.com/register/pqr678stu901?org=550e8400-e29b-41d4-a716-446655440001', 
 'Join our solid defensive unit! Training starts next week.', 
 '2024-10-25 15:00:00', '2024-11-25 15:00:00', 'PENDING', 
 NULL, NULL, 2, '2024-10-28 11:00:00', 0, 0),

('inv-007', 'demo-manager-1', 'demo-team-1', '550e8400-e29b-41d4-a716-446655440001', 'Robert', 'Njoroge', 'robert.njoroge@example.com', '+254701234573', 'FORWARD', 
 'stu901vwx234', 'https://jamiitourney.com/register/stu901vwx234?org=550e8400-e29b-41d4-a716-446655440001', 
 'Your speed and agility would be perfect for our attacking strategy.', 
 '2024-10-26 16:00:00', '2024-11-26 16:00:00', 'PENDING', 
 NULL, NULL, 1, '2024-10-29 09:00:00', 0, 0),

('inv-008', 'demo-manager-1', 'demo-team-1', '550e8400-e29b-41d4-a716-446655440001', 'Lucy', 'Chege', 'lucy.chege@example.com', '+254701234574', 'MIDFIELDER', 
 'vwx234yzab56', 'https://jamiitourney.com/register/vwx234yzab56?org=550e8400-e29b-41d4-a716-446655440001', 
 'We are looking for creative midfielders - you would be a great fit!', 
 '2024-10-28 17:00:00', '2024-11-28 17:00:00', 'PENDING', 
 NULL, NULL, 0, NULL, 0, 0),

-- Expired invitation
('inv-009', 'demo-manager-1', 'demo-team-1', '550e8400-e29b-41d4-a716-446655440001', 'Michael', 'Ouma', 'michael.ouma@example.com', '+254701234575', 'DEFENDER', 
 'yzab567cdef8', 'https://jamiitourney.com/register/yzab567cdef8?org=550e8400-e29b-41d4-a716-446655440001', 
 'This invitation has expired due to no response.', 
 '2024-09-15 10:00:00', '2024-10-15 10:00:00', 'EXPIRED', 
 NULL, NULL, 3, '2024-10-10 12:00:00', 1, 0),

-- Invitations for other managers
('inv-010', 'demo-manager-2', 'demo-team-2', '550e8400-e29b-41d4-a716-446655440001', 'Alice', 'Nyong', 'alice.nyong@example.com', '+254701234576', 'GOALKEEPER', 
 'cdef890ghij1', 'https://jamiitourney.com/register/cdef890ghij1?org=550e8400-e29b-41d4-a716-446655440001', 
 'Eastlands United needs a dedicated goalkeeper. Join our family!', 
 '2024-10-20 11:00:00', '2024-11-20 11:00:00', 'COMPLETED', 
 '2024-10-20 14:30:00', '2024-10-21 09:15:00', 0, NULL, 1, 1),

('inv-011', 'demo-manager-2', 'demo-team-2', '550e8400-e29b-41d4-a716-446655440001', 'Joseph', 'Kiprotich', 'joseph.kiprotich@example.com', '+254701234577', 'MIDFIELDER', 
 'ghij123klmn4', 'https://jamiitourney.com/register/ghij123klmn4?org=550e8400-e29b-41d4-a716-446655440001', 
 'Your ball control skills would enhance our midfield significantly.', 
 '2024-10-22 12:00:00', '2024-11-22 12:00:00', 'PENDING', 
 NULL, NULL, 1, '2024-10-27 10:00:00', 0, 0);

-- Insert email delivery logs
INSERT INTO invitation_email_log (invitation_id, email_type, recipient_email, subject, delivery_status, opened_at, clicked_at, provider) VALUES
('inv-001', 'INITIAL_INVITE', 'james.kiprop@example.com', 'Invitation to Join Nairobi Eagles FC', 'DELIVERED', '2024-10-01 12:30:00', '2024-10-01 14:30:00', 'SUPABASE'),
('inv-001', 'COMPLETION_NOTICE', 'john.manager@example.com', 'James Kiprop has completed registration', 'DELIVERED', '2024-10-02 09:30:00', NULL, 'SUPABASE'),
('inv-002', 'INITIAL_INVITE', 'mary.wanjiku@example.com', 'Invitation to Join Nairobi Eagles FC - Defender Position', 'DELIVERED', '2024-10-02 13:15:00', '2024-10-02 15:45:00', 'SUPABASE'),
('inv-003', 'INITIAL_INVITE', 'peter.otieno@example.com', 'Goalkeeper Position Available - Nairobi Eagles FC', 'DELIVERED', '2024-10-03 14:20:00', '2024-10-03 16:20:00', 'SUPABASE'),
('inv-003', 'REMINDER', 'peter.otieno@example.com', 'Reminder: Complete Your Registration - Nairobi Eagles FC', 'DELIVERED', '2024-10-04 09:15:00', '2024-10-04 09:30:00', 'SUPABASE'),
('inv-004', 'INITIAL_INVITE', 'grace.muthoni@example.com', 'Forward Position - Join Nairobi Eagles FC', 'DELIVERED', '2024-10-15 15:45:00', '2024-10-15 17:30:00', 'SUPABASE'),
('inv-004', 'REMINDER', 'grace.muthoni@example.com', 'Complete Your Registration - Nairobi Eagles FC', 'DELIVERED', '2024-10-20 10:30:00', NULL, 'SUPABASE'),
('inv-006', 'INITIAL_INVITE', 'susan.akinyi@example.com', 'Defender Position Available - Nairobi Eagles FC', 'DELIVERED', NULL, NULL, 'SUPABASE'),
('inv-006', 'REMINDER', 'susan.akinyi@example.com', 'Reminder: Join Our Defense - Nairobi Eagles FC', 'DELIVERED', NULL, NULL, 'SUPABASE'),
('inv-006', 'REMINDER', 'susan.akinyi@example.com', 'Final Reminder: Nairobi Eagles FC Registration', 'DELIVERED', NULL, NULL, 'SUPABASE');

-- Insert manager permissions
INSERT INTO manager_permissions (manager_id, permission, granted_by) VALUES
('demo-manager-1', 'INVITE_PLAYERS', NULL),
('demo-manager-1', 'MANAGE_ROSTER', NULL),
('demo-manager-1', 'VIEW_ANALYTICS', NULL),
('demo-manager-1', 'EXPORT_DATA', NULL),
('demo-manager-2', 'INVITE_PLAYERS', NULL),
('demo-manager-2', 'MANAGE_ROSTER', NULL),
('demo-manager-2', 'VIEW_ANALYTICS', NULL),
('demo-manager-3', 'INVITE_PLAYERS', NULL),
('demo-manager-3', 'MANAGE_ROSTER', NULL);

-- Insert invitation templates
INSERT INTO invitation_templates (org_id, manager_id, name, template_type, subject_template, body_template, is_default, variables) VALUES
('550e8400-e29b-41d4-a716-446655440001', NULL, 'Standard Invitation', 'INITIAL_INVITE', 
 'Invitation to Join {{team_name}} - {{position}} Position',
 'Dear {{player_name}},\n\nYou have been invited to join {{team_name}} for the {{position}} position.\n\n{{custom_message}}\n\nTo complete your registration, please click the link below:\n{{registration_link}}\n\nThis invitation expires on {{expiry_date}}.\n\nBest regards,\n{{manager_name}}\n{{team_name}}',
 true,
 '{"team_name": "Team name", "position": "Player position", "player_name": "Player full name", "custom_message": "Custom message from manager", "registration_link": "Registration URL", "expiry_date": "Invitation expiry date", "manager_name": "Manager full name"}'::jsonb),

('550e8400-e29b-41d4-a716-446655440001', NULL, 'Friendly Reminder', 'REMINDER',
 'Reminder: Complete Your Registration for {{team_name}}',
 'Hi {{player_name}},\n\nThis is a friendly reminder that your invitation to join {{team_name}} is still pending.\n\nWe are excited to have you on our team for the {{position}} position!\n\nPlease complete your registration by clicking here: {{registration_link}}\n\nIf you have any questions, feel free to reach out.\n\nCheers,\n{{manager_name}}',
 true,
 '{"team_name": "Team name", "position": "Player position", "player_name": "Player full name", "registration_link": "Registration URL", "manager_name": "Manager full name"}'::jsonb),

('550e8400-e29b-41d4-a716-446655440001', 'demo-manager-1', 'Eagles Welcome Template', 'INITIAL_INVITE',
 '🦅 Welcome to Nairobi Eagles FC - {{position}} Position Available',
 'Dear {{player_name}},\n\nWelcome to the Eagles family! 🦅\n\nWe are thrilled to invite you to join Nairobi Eagles FC as our new {{position}}. Your skills and dedication would be a perfect match for our team.\n\n{{custom_message}}\n\n🏆 Why join the Eagles?\n✓ Professional coaching and development\n✓ Competitive matches and tournaments\n✓ Supportive team environment\n✓ Modern training facilities\n\nReady to soar with us? Complete your registration here:\n{{registration_link}}\n\n⏰ This invitation expires on {{expiry_date}}\n\nFly high with the Eagles!\n\n{{manager_name}}\nHead Manager, Nairobi Eagles FC',
 false,
 '{"team_name": "Team name", "position": "Player position", "player_name": "Player full name", "custom_message": "Custom message from manager", "registration_link": "Registration URL", "expiry_date": "Invitation expiry date", "manager_name": "Manager full name"}'::jsonb);

-- Update teams table to reference the managers
UPDATE teams SET manager_id = 'demo-manager-1' WHERE id = 'demo-team-1';
UPDATE teams SET manager_id = 'demo-manager-2' WHERE id = 'demo-team-2';
UPDATE teams SET manager_id = 'demo-manager-3' WHERE id = 'demo-team-3';