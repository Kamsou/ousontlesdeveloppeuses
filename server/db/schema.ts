import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const developers = sqliteTable('developers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  githubId: text('github_id').unique().notNull(),
  name: text('name').notNull(),
  email: text('email'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  location: text('location'),
  yearsExperience: integer('years_experience'),
  website: text('website'),
  githubUrl: text('github_url'),
  linkedinUrl: text('linkedin_url'),
  twitterUrl: text('twitter_url'),
  profileType: text('profile_type'),
  profilePhrase: text('profile_phrase'),
  isAdmin: integer('is_admin', { mode: 'boolean' }).default(false),
  emailOptIn: integer('email_opt_in', { mode: 'boolean' }).default(false),
  emailOptInDate: integer('email_opt_in_date', { mode: 'timestamp' }),
  cocAcceptedAt: integer('coc_accepted_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const developerSkills = sqliteTable('developer_skills', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  developerId: integer('developer_id').notNull().references(() => developers.id, { onDelete: 'cascade' }),
  skillName: text('skill_name').notNull()
})

export const developerOpenTo = sqliteTable('developer_open_to', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  developerId: integer('developer_id').notNull().references(() => developers.id, { onDelete: 'cascade' }),
  type: text('type', {
    enum: ['conference', 'mentoring', 'freelance', 'cdi', 'coffee_chat', 'pair_programming', 'cv_review']
  }).notNull()
})

export const speakerProfiles = sqliteTable('speaker_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  developerId: integer('developer_id').unique().notNull().references(() => developers.id, { onDelete: 'cascade' }),
  topics: text('topics'),
  pastTalksUrl: text('past_talks_url'),
  available: integer('available', { mode: 'boolean' }).default(true),
  travelWilling: integer('travel_willing', { mode: 'boolean' }).default(false),
  remoteOk: integer('remote_ok', { mode: 'boolean' }).default(true)
})

export const companies = sqliteTable('companies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  logoUrl: text('logo_url'),
  website: text('website'),
  description: text('description'),
  location: text('location'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const companyReviews = sqliteTable('company_reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  developerId: integer('developer_id').notNull().references(() => developers.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  isInclusive: integer('is_inclusive', { mode: 'boolean' }).notNull(),
  comment: text('comment'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const helpRequests = sqliteTable('help_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  developerId: integer('developer_id').notNull().references(() => developers.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  helpType: text('help_type', {
    enum: ['bug', 'review', 'advice', 'pair', 'other']
  }).notNull(),
  status: text('status', {
    enum: ['open', 'in_progress', 'closed']
  }).notNull().default('open'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const helpRequestTechs = sqliteTable('help_request_techs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  helpRequestId: integer('help_request_id').notNull().references(() => helpRequests.id, { onDelete: 'cascade' }),
  techName: text('tech_name').notNull()
})

export const developersRelations = relations(developers, ({ many, one }) => ({
  skills: many(developerSkills),
  openTo: many(developerOpenTo),
  speakerProfile: one(speakerProfiles),
  reviews: many(companyReviews),
  helpRequests: many(helpRequests),
  sideProjects: many(sideProjects)
}))

export const developerSkillsRelations = relations(developerSkills, ({ one }) => ({
  developer: one(developers, {
    fields: [developerSkills.developerId],
    references: [developers.id]
  })
}))

export const developerOpenToRelations = relations(developerOpenTo, ({ one }) => ({
  developer: one(developers, {
    fields: [developerOpenTo.developerId],
    references: [developers.id]
  })
}))

export const speakerProfilesRelations = relations(speakerProfiles, ({ one }) => ({
  developer: one(developers, {
    fields: [speakerProfiles.developerId],
    references: [developers.id]
  })
}))

export const companiesRelations = relations(companies, ({ many }) => ({
  reviews: many(companyReviews)
}))

export const companyReviewsRelations = relations(companyReviews, ({ one }) => ({
  company: one(companies, {
    fields: [companyReviews.companyId],
    references: [companies.id]
  }),
  developer: one(developers, {
    fields: [companyReviews.developerId],
    references: [developers.id]
  })
}))

export const helpRequestsRelations = relations(helpRequests, ({ one, many }) => ({
  developer: one(developers, {
    fields: [helpRequests.developerId],
    references: [developers.id]
  }),
  techs: many(helpRequestTechs),
  comments: many(comments)
}))

export const helpRequestTechsRelations = relations(helpRequestTechs, ({ one }) => ({
  helpRequest: one(helpRequests, {
    fields: [helpRequestTechs.helpRequestId],
    references: [helpRequests.id]
  })
}))

export const contactRequests = sqliteTable('contact_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  senderId: integer('sender_id').notNull().references(() => developers.id, { onDelete: 'cascade' }),
  recipientId: integer('recipient_id').notNull().references(() => developers.id, { onDelete: 'cascade' }),
  helpRequestId: integer('help_request_id').references(() => helpRequests.id, { onDelete: 'set null' }),
  message: text('message').notNull(),
  status: text('status', {
    enum: ['sent', 'read', 'replied']
  }).notNull().default('sent'),
  feedbackToken: text('feedback_token').unique(),
  feedbackRequestedAt: integer('feedback_requested_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const contactFeedbacks = sqliteTable('contact_feedbacks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  contactRequestId: integer('contact_request_id').unique().notNull().references(() => contactRequests.id, { onDelete: 'cascade' }),
  exchangeHappened: integer('exchange_happened', { mode: 'boolean' }).notNull(),
  usefulnessRating: integer('usefulness_rating'),
  comment: text('comment'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const contactRequestsRelations = relations(contactRequests, ({ one }) => ({
  sender: one(developers, {
    fields: [contactRequests.senderId],
    references: [developers.id],
    relationName: 'sentContacts'
  }),
  recipient: one(developers, {
    fields: [contactRequests.recipientId],
    references: [developers.id],
    relationName: 'receivedContacts'
  }),
  helpRequest: one(helpRequests, {
    fields: [contactRequests.helpRequestId],
    references: [helpRequests.id]
  }),
  feedback: one(contactFeedbacks)
}))

export const contactFeedbacksRelations = relations(contactFeedbacks, ({ one }) => ({
  contactRequest: one(contactRequests, {
    fields: [contactFeedbacks.contactRequestId],
    references: [contactRequests.id]
  })
}))

export const programs = sqliteTable('programs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category', {
    enum: ['community', 'mentoring', 'conference', 'funding']
  }).notNull(),
  url: text('url').notNull(),
  highlight: integer('highlight', { mode: 'boolean' }).default(false),
  active: integer('active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const sideProjects = sqliteTable('side_projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  developerId: integer('developer_id').notNull().references(() => developers.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  repoUrl: text('repo_url'),
  websiteUrl: text('website_url'),
  status: text('status', {
    enum: ['idea', 'open_to_contributors', 'looking_for_cofounder', 'completed']
  }).notNull().default('open_to_contributors'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const sideProjectTechs = sqliteTable('side_project_techs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sideProjectId: integer('side_project_id').notNull().references(() => sideProjects.id, { onDelete: 'cascade' }),
  techName: text('tech_name').notNull()
})

export const sideProjectsRelations = relations(sideProjects, ({ one, many }) => ({
  developer: one(developers, {
    fields: [sideProjects.developerId],
    references: [developers.id]
  }),
  techs: many(sideProjectTechs),
  comments: many(comments)
}))

export const sideProjectTechsRelations = relations(sideProjectTechs, ({ one }) => ({
  sideProject: one(sideProjects, {
    fields: [sideProjectTechs.sideProjectId],
    references: [sideProjects.id]
  })
}))

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  developerId: integer('developer_id').notNull().references(() => developers.id, { onDelete: 'cascade' }),
  helpRequestId: integer('help_request_id').references(() => helpRequests.id, { onDelete: 'cascade' }),
  sideProjectId: integer('side_project_id').references(() => sideProjects.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const commentsRelations = relations(comments, ({ one }) => ({
  developer: one(developers, {
    fields: [comments.developerId],
    references: [developers.id]
  }),
  helpRequest: one(helpRequests, {
    fields: [comments.helpRequestId],
    references: [helpRequests.id]
  }),
  sideProject: one(sideProjects, {
    fields: [comments.sideProjectId],
    references: [sideProjects.id]
  })
}))
