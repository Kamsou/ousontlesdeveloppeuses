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

export const developersRelations = relations(developers, ({ many, one }) => ({
  skills: many(developerSkills),
  openTo: many(developerOpenTo),
  speakerProfile: one(speakerProfiles),
  reviews: many(companyReviews)
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
