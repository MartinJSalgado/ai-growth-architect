/**
 * GoHighLevel API Integration
 * Docs: https://highlevel.stoplight.io/docs/integrations/
 */

const GHL_API_BASE = "https://services.leadconnectorhq.com";
const GHL_AUTH_BASE = "https://marketplace.gohighlevel.com";

export interface GHLTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  userType: string;
  locationId?: string;
  companyId?: string;
}

export interface GHLOpportunity {
  id: string;
  name: string;
  monetaryValue: number;
  pipelineId: string;
  pipelineStageId: string;
  assignedTo?: string;
  status: string;
  source?: string;
  lastStatusChangeAt: string;
  createdAt: string;
}

export interface GHLContact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  source?: string;
  dateAdded: string;
}

export interface GHLCampaignStats {
  id: string;
  name: string;
  status: string;
  emailsSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
}

/**
 * Generate OAuth authorization URL
 */
export function getGHLAuthorizationUrl(state: string): string {
  const clientId = process.env.GHL_CLIENT_ID!;
  const redirectUri = process.env.NEXT_PUBLIC_GHL_REDIRECT_URI!;

  const scopes = [
    "contacts.readonly",
    "contacts.write",
    "opportunities.readonly",
    "opportunities.write",
    "locations.readonly",
    "campaigns.readonly",
    "calendars.readonly",
    "calendars/events.readonly",
  ];

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(" "),
    response_type: "code",
    state: state, // Use session_id as state for CSRF protection
  });

  return `${GHL_AUTH_BASE}/oauth/chooselocation?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<GHLTokenResponse> {
  const clientId = process.env.GHL_CLIENT_ID!;
  const clientSecret = process.env.GHL_CLIENT_SECRET!;
  const redirectUri = process.env.NEXT_PUBLIC_GHL_REDIRECT_URI!;

  const response = await fetch(`${GHL_API_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  return response.json();
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<GHLTokenResponse> {
  const clientId = process.env.GHL_CLIENT_ID!;
  const clientSecret = process.env.GHL_CLIENT_SECRET!;

  const response = await fetch(`${GHL_API_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  return response.json();
}

/**
 * Make authenticated API request to GHL
 */
async function ghlApiRequest(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<any> {
  const response = await fetch(`${GHL_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Version: "2021-07-28",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GHL API request failed: ${error}`);
  }

  return response.json();
}

/**
 * Fetch opportunities (pipeline data)
 */
export async function getOpportunities(
  accessToken: string,
  locationId: string
): Promise<GHLOpportunity[]> {
  const data = await ghlApiRequest(
    `/opportunities/search?location_id=${locationId}&limit=100`,
    accessToken
  );
  return data.opportunities || [];
}

/**
 * Fetch contacts
 */
export async function getContacts(
  accessToken: string,
  locationId: string
): Promise<GHLContact[]> {
  const data = await ghlApiRequest(
    `/contacts/?locationId=${locationId}&limit=100`,
    accessToken
  );
  return data.contacts || [];
}

/**
 * Fetch location info
 */
export async function getLocationInfo(accessToken: string, locationId: string): Promise<any> {
  return ghlApiRequest(`/locations/${locationId}`, accessToken);
}

/**
 * Fetch campaigns (for email stats)
 * Note: GHL API might require different endpoint based on version
 */
export async function getCampaigns(
  accessToken: string,
  locationId: string
): Promise<GHLCampaignStats[]> {
  try {
    const data = await ghlApiRequest(
      `/campaigns/?locationId=${locationId}`,
      accessToken
    );
    return data.campaigns || [];
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    return [];
  }
}

/**
 * Fetch calendar appointments
 */
export async function getAppointments(
  accessToken: string,
  locationId: string,
  startDate?: string,
  endDate?: string
): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      locationId: locationId,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    const data = await ghlApiRequest(
      `/calendars/events?${params.toString()}`,
      accessToken
    );
    return data.events || [];
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return [];
  }
}

/**
 * Calculate opportunity pipeline metrics
 */
export function calculatePipelineMetrics(opportunities: GHLOpportunity[]) {
  const totalOpportunities = opportunities.length;
  const totalValue = opportunities.reduce((sum, opp) => sum + (opp.monetaryValue || 0), 0);
  const avgValue = totalOpportunities > 0 ? totalValue / totalOpportunities : 0;

  // Group by status
  const statusCounts = opportunities.reduce((acc, opp) => {
    acc[opp.status] = (acc[opp.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by pipeline stage
  const stageCounts = opportunities.reduce((acc, opp) => {
    acc[opp.pipelineStageId] = (acc[opp.pipelineStageId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalOpportunities,
    totalValue,
    avgValue,
    statusBreakdown: statusCounts,
    stageBreakdown: stageCounts,
  };
}

/**
 * Calculate email campaign metrics
 */
export function calculateEmailMetrics(campaigns: GHLCampaignStats[]) {
  const totalCampaigns = campaigns.length;
  const totalSent = campaigns.reduce((sum, c) => sum + (c.emailsSent || 0), 0);
  const totalOpened = campaigns.reduce((sum, c) => sum + (c.opened || 0), 0);
  const totalClicked = campaigns.reduce((sum, c) => sum + (c.clicked || 0), 0);

  const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
  const avgClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

  return {
    totalCampaigns,
    totalSent,
    totalOpened,
    totalClicked,
    avgOpenRate: parseFloat(avgOpenRate.toFixed(2)),
    avgClickRate: parseFloat(avgClickRate.toFixed(2)),
  };
}

/**
 * Calculate contact metrics
 */
export function calculateContactMetrics(contacts: GHLContact[]) {
  const totalContacts = contacts.length;

  // Group by source
  const sourceCounts = contacts.reduce((acc, contact) => {
    const source = contact.source || "unknown";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count contacts added in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentContacts = contacts.filter(
    (c) => new Date(c.dateAdded) >= thirtyDaysAgo
  ).length;

  return {
    totalContacts,
    recentContacts,
    sourceBreakdown: sourceCounts,
  };
}
