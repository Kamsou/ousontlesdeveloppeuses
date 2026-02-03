export interface QgProfile {
  id: number
  name: string
  email: string | null
  avatarUrl: string | null
  bio: string | null
  title: string | null
  location: string | null
  yearsExperience: number | null
  website: string | null
  githubUrl: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  profileType: string | null
  profilePhrase: string | null
  skills: string[]
  openTo: string[]
  speakerProfile: {
    topics: string[]
    available: boolean | null
    remoteOk: boolean | null
    travelWilling: boolean | null
  } | null
  emailOptIn: boolean
  emailOptInAsked: boolean
}

export interface HelpRequest {
  id: number
  title: string
  description: string
  status: 'open' | 'closed'
  developerId: number
  createdAt: string
  techs: { id: number; techName: string }[]
}

export interface Offer {
  id: number
  title: string
  description: string | null
  url: string | null
  type: string
  location: string | null
  verified: boolean
  createdAt: string
  developer: {
    id: number
    name: string
    avatarUrl: string | null
  }
}

export interface Challenge {
  id: number
  templateId: string
  title: string
  description: string
  category: 'comparer' | 'verifier' | 'enseigner' | 'collaborer' | 'resister'
  status: 'active' | 'completed' | 'skipped'
  reflection: string | null
  completedAt: string | null
  createdAt: string
}

export interface QgActivity {
  isNew: boolean
  weeklyContactsReceived?: number
  weeklyContactsSent?: number
  recentExchanges?: { type: 'sent' | 'received'; name: string; avatarUrl?: string; helpRequestTitle?: string }[]
  unreadComments?: { type: 'project' | 'request'; id: number; title: string; count: number }[]
  totalHelpGiven?: number
  profileComplete?: boolean
  missingFields?: string[]
  memberSince?: string
  communityNewMembers?: number
  communityHelpRequests?: number
  communityNewProjects?: number
}
