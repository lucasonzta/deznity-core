-- Row Level Security Policies for Deznity
-- Enable RLS on all tables

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_spend ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view their organization" ON organizations
    FOR SELECT USING (id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Admins can update their organization" ON organizations
    FOR UPDATE USING (id IN (
        SELECT organization_id FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Users policies
CREATE POLICY "Users can view users in their organization" ON users
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Admins can manage users in their organization" ON users
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Projects policies
CREATE POLICY "Users can view projects in their organization" ON projects
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create projects in their organization" ON projects
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update projects in their organization" ON projects
    FOR UPDATE USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- Sites policies
CREATE POLICY "Users can view sites for their projects" ON sites
    FOR SELECT USING (project_id IN (
        SELECT id FROM projects WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can manage sites for their projects" ON sites
    FOR ALL USING (project_id IN (
        SELECT id FROM projects WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

-- Leads policies
CREATE POLICY "Users can view leads in their organization" ON leads
    FOR SELECT USING (true); -- Leads are shared across organization

CREATE POLICY "Users can create leads" ON leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update leads" ON leads
    FOR UPDATE USING (true);

-- Deals policies
CREATE POLICY "Users can view deals in their organization" ON deals
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create deals in their organization" ON deals
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update deals in their organization" ON deals
    FOR UPDATE USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- Subscriptions policies
CREATE POLICY "Users can view subscriptions for their organization" ON subscriptions
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- Invoices policies
CREATE POLICY "Users can view invoices for their organization" ON invoices
    FOR SELECT USING (customer_id IN (
        SELECT stripe_customer_id FROM organizations WHERE id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

-- Contents policies
CREATE POLICY "Users can view contents for their projects" ON contents
    FOR SELECT USING (project_id IN (
        SELECT id FROM projects WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can create contents for their projects" ON contents
    FOR INSERT WITH CHECK (project_id IN (
        SELECT id FROM projects WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can update contents for their projects" ON contents
    FOR UPDATE USING (project_id IN (
        SELECT id FROM projects WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

-- Activities policies
CREATE POLICY "Users can view activities in their organization" ON activities
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create activities in their organization" ON activities
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- Tickets policies
CREATE POLICY "Users can view tickets in their organization" ON tickets
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create tickets in their organization" ON tickets
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update tickets in their organization" ON tickets
    FOR UPDATE USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- NPS Scores policies
CREATE POLICY "Users can view NPS scores in their organization" ON nps_scores
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create NPS scores in their organization" ON nps_scores
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- Events policies
CREATE POLICY "Users can view events in their organization" ON events
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create events in their organization" ON events
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- User Attributions policies
CREATE POLICY "Users can view their own attributions" ON user_attributions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own attributions" ON user_attributions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Ad Spend policies
CREATE POLICY "Users can view ad spend in their organization" ON ad_spend
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create ad spend in their organization" ON ad_spend
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- Marketing Campaigns policies
CREATE POLICY "Users can view marketing campaigns in their organization" ON marketing_campaigns
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create marketing campaigns in their organization" ON marketing_campaigns
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update marketing campaigns in their organization" ON marketing_campaigns
    FOR UPDATE USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- Marketing Creatives policies
CREATE POLICY "Users can view marketing creatives for their campaigns" ON marketing_creatives
    FOR SELECT USING (campaign_id IN (
        SELECT id FROM marketing_campaigns WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can create marketing creatives for their campaigns" ON marketing_creatives
    FOR INSERT WITH CHECK (campaign_id IN (
        SELECT id FROM marketing_campaigns WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

-- Outbox Events policies (service role only)
CREATE POLICY "Service role can manage outbox events" ON outbox_events
    FOR ALL USING (auth.role() = 'service_role');

-- Audit Logs policies
CREATE POLICY "Users can view audit logs in their organization" ON audit_logs
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Service role can create audit logs" ON audit_logs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');
