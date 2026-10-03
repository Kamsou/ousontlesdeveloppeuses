import { Resend } from 'resend'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

let resendClient: Resend | null = null

function getResend() {
  if (!resendClient) {
    const config = useRuntimeConfig()
    resendClient = new Resend(config.resendApiKey)
  }
  return resendClient
}

const FROM_EMAIL = 'Camille de OSLD <contact@ousontlesdeveloppeuses.fr>'

export async function sendWelcomeEmail(to: string, name: string) {
  const resend = getResend()

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Bienvenue sur OSLD, ${name}`,
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff; color: #1a1a1a;">

        <h1 style="font-size: 26px; font-weight: 600; margin-bottom: 24px; color: #1a1a1a;">
          Ton profil est live
        </h1>

        <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 16px;">
          Hey ${escapeHtml(name)}, c'est Camille :)
        </p>

        <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 16px;">
          J'ai créé OSLD pour qu'on se retrouve entre développeuses. Ça démarre avec un annuaire, mais je te réserve une vraie expérience derrière.
        </p>

        <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 28px;">
          Ton profil est live ! Je te tiens au courant de la suite.
        </p>

        <a href="https://ousontlesdeveloppeuses.fr/profil"
           style="display: inline-block; padding: 14px 24px; background: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 15px;">
          Compléter mon profil
        </a>

        <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          Je suis une vraie personne et je lis toutes les réponses. Si t'as une question, réponds direct à cet email.
        </p>

        <p style="font-size: 14px; color: #6b7280; margin-top: 16px;">
          Camille
        </p>
      </div>
    `
  })
}

export async function sendNotificationEmail(to: string, subject: string, content: string) {
  const resend = getResend()

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <p style="color: #64748b; line-height: 1.6;">
          ${content}
        </p>
        <a href="https://ousontlesdeveloppeuses.fr/profil"
           style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #f8fafc; color: #0a0a0f; text-decoration: none; border-radius: 8px; font-weight: 500;">
          Voir mon profil
        </a>
        <p style="margin-top: 40px; color: #94a3b8; font-size: 14px;">
          - L'équipe OSLD
        </p>
      </div>
    `
  })
}

export async function sendNewsletterEmail(to: string[], subject: string, content: string) {
  const resend = getResend()

  return resend.batch.send(
    to.map(email => ({
      from: FROM_EMAIL,
      to: email,
      subject,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          ${content}
          <hr style="margin: 40px 0; border: none; border-top: 1px solid #e2e8f0;" />
          <p style="color: #94a3b8; font-size: 12px;">
            Tu reçois cet email car tu es inscrite à la newsletter OSLD.
            <a href="https://ousontlesdeveloppeuses.fr/profil" style="color: #94a3b8;">Se désinscrire</a>
          </p>
        </div>
      `
    }))
  )
}

const ADMIN_EMAIL = 'contact@ousontlesdeveloppeuses.fr'

export async function sendAdminNewHelpRequest(developerName: string, title: string, techs: string[]) {
  const resend = getResend()

  const techsHtml = techs.length
    ? `<p style="font-size: 14px; color: #6b7280;">Technos : ${escapeHtml(techs.join(', '))}</p>`
    : ''

  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `[OSLD] Nouvelle demande : ${title}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">Nouvelle demande d'aide</h1>
        <p style="font-size: 16px; color: #374151; margin-bottom: 8px;">
          <strong>${escapeHtml(developerName)}</strong> a posté une demande :
        </p>
        <p style="font-size: 18px; color: #1a1a1a; margin-bottom: 16px;">
          "${escapeHtml(title)}"
        </p>
        ${techsHtml}
        <a href="https://ousontlesdeveloppeuses.fr/qg"
           style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500;">
          Voir sur OSLD
        </a>
      </div>
    `
  })
}

interface ContactEmailParams {
  senderName: string
  senderEmail: string
  recipientName: string
  recipientEmail: string
  message: string
  helpRequestTitle?: string
}

export async function sendFeedbackRequestEmail(
  to: string,
  senderName: string,
  recipientName: string,
  feedbackToken: string
) {
  const resend = getResend()
  const feedbackUrl = `https://ousontlesdeveloppeuses.fr/feedback/${feedbackToken}`

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Comment s\'est passé ton échange ?',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff; color: #1a1a1a;">

        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px; color: #1a1a1a;">
          Hey ${escapeHtml(senderName)}
        </h1>

        <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 16px;">
          Tu as contacté <strong>${escapeHtml(recipientName)}</strong> via OSLD il y a quelques jours.
        </p>

        <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 28px;">
          Ça s'est bien passé ? Ton retour m'aide à améliorer la plateforme.
        </p>

        <a href="${feedbackUrl}"
           style="display: inline-block; padding: 14px 24px; background: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 15px;">
          Donner mon avis (30 sec)
        </a>

        <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          Camille
        </p>
      </div>
    `
  })
}

export async function sendContactEmail({
  senderName,
  senderEmail,
  recipientName,
  recipientEmail,
  message,
  helpRequestTitle
}: ContactEmailParams) {
  const resend = getResend()

  const context = helpRequestTitle
    ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 24px; padding: 12px 16px; background: #f9fafb; border-radius: 8px;">
        Concernant : <strong>${escapeHtml(helpRequestTitle)}</strong>
      </p>`
    : ''

  return resend.emails.send({
    from: FROM_EMAIL,
    to: recipientEmail,
    replyTo: senderEmail,
    subject: `${senderName} veut te contacter sur OSLD`,
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff; color: #1a1a1a;">

        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px; color: #1a1a1a;">
          Hey ${escapeHtml(recipientName)}
        </h1>

        <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 24px;">
          <strong>${escapeHtml(senderName)}</strong> t'a envoy\u00e9 un message via OSLD.
        </p>

        ${context}

        <div style="padding: 20px; background: #fafafa; border-left: 3px solid #1a1a1a; margin-bottom: 28px;">
          <p style="font-size: 16px; line-height: 1.7; color: #374151; margin: 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6; color: #374151; margin-bottom: 8px;">
          Pour r\u00e9pondre, r\u00e9ponds directement \u00e0 cet email.
        </p>

        <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          Ce message a \u00e9t\u00e9 envoy\u00e9 via <a href="https://ousontlesdeveloppeuses.fr" style="color: #6b7280;">OSLD</a>.
          Si tu ne veux plus recevoir de messages, modifie tes pr\u00e9f\u00e9rences dans ton profil.
        </p>
      </div>
    `
  })
}

interface CommentNotificationParams {
  recipientEmail: string
  recipientName: string
  commenterName: string
  opportunityTitle: string
  commentSnippet: string
  opportunityType: 'help_request' | 'side_project' | 'offer'
  opportunityUrl: string
  isCreator: boolean
}

export async function sendCommentNotificationEmail({
  recipientEmail,
  recipientName,
  commenterName,
  opportunityTitle,
  commentSnippet,
  opportunityType,
  opportunityUrl,
  isCreator
}: CommentNotificationParams) {
  const resend = getResend()

  const typeLabels = {
    help_request: 'demande d\'aide',
    side_project: 'side project',
    offer: 'offre'
  }

  const typeLabel = typeLabels[opportunityType]
  const possessive = isCreator ? 'ton' : 'le'
  const subject = `${commenterName} a commenté ${possessive} ${typeLabel}`
  const bodyText = isCreator
    ? `<strong>${escapeHtml(commenterName)}</strong> a commenté ton ${typeLabel} :`
    : `<strong>${escapeHtml(commenterName)}</strong> a commenté le ${typeLabel} que tu suis :`

  return resend.emails.send({
    from: FROM_EMAIL,
    to: recipientEmail,
    subject,
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff; color: #1a1a1a;">

        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px; color: #1a1a1a;">
          Hey ${escapeHtml(recipientName)}
        </h1>

        <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 16px;">
          ${bodyText}
        </p>

        <p style="font-size: 18px; font-weight: 500; color: #1a1a1a; margin-bottom: 16px;">
          "${escapeHtml(opportunityTitle)}"
        </p>

        <div style="padding: 16px 20px; background: #f3f4f6; border-radius: 8px; margin-bottom: 28px;">
          <p style="font-size: 15px; line-height: 1.6; color: #374151; margin: 0;">${escapeHtml(commentSnippet)}${commentSnippet.length >= 150 ? '...' : ''}</p>
        </div>

        <a href="${opportunityUrl}"
           style="display: inline-block; padding: 14px 24px; background: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 15px;">
          Voir le commentaire
        </a>

        <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          Tu peux gérer tes notifications dans <a href="https://ousontlesdeveloppeuses.fr/qg?tab=profil" style="color: #6b7280;">tes préférences</a>.
        </p>
      </div>
    `
  })
}

interface LookingForReminderParams {
  recipientEmail: string
  recipientName: string
  lookingForTypes: string[]
  renewToken: string
  deactivateToken: string
}

export async function sendLookingForReminderEmail({
  recipientEmail,
  recipientName,
  lookingForTypes,
  renewToken,
  deactivateToken
}: LookingForReminderParams) {
  const resend = getResend()

  const typeLabels: Record<string, string> = {
    freelance: 'Mission freelance',
    cdi: 'CDI',
    stage: 'Stage',
    alternance: 'Alternance'
  }

  const labels = lookingForTypes.map(t => typeLabels[t] || t).join(', ')
  const renewUrl = `https://ousontlesdeveloppeuses.fr/api/looking-for/renew?token=${renewToken}`
  const deactivateUrl = `https://ousontlesdeveloppeuses.fr/api/looking-for/deactivate?token=${deactivateToken}`

  return resend.emails.send({
    from: FROM_EMAIL,
    to: recipientEmail,
    subject: 'Tu es toujours en recherche ?',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff; color: #1a1a1a;">

        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px; color: #1a1a1a;">
          Hey ${escapeHtml(recipientName)}
        </h1>

        <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 16px;">
          Tu as indiqué être en recherche active sur OSLD :
        </p>

        <p style="font-size: 18px; font-weight: 500; color: #1a1a1a; margin-bottom: 24px;">
          ${escapeHtml(labels)}
        </p>

        <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 28px;">
          Ta recherche expire dans quelques jours. Tu es toujours en recherche ?
        </p>

        <div style="margin-bottom: 16px;">
          <a href="${renewUrl}"
             style="display: inline-block; padding: 14px 24px; background: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 15px;">
            Oui, je cherche toujours
          </a>
        </div>

        <div>
          <a href="${deactivateUrl}"
             style="display: inline-block; padding: 14px 24px; background: #ffffff; color: #374151; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 15px; border: 1px solid #e5e7eb;">
            Non, j'ai trouvé !
          </a>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          Sans action de ta part, ta recherche sera désactivée automatiquement.
        </p>
      </div>
    `
  })
}
