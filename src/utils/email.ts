import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('Configuração de e-mail ausente (SMTP_HOST/SMTP_USER/SMTP_PASS).');
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

export type SendMailOptions = {
  to: string;
  subject: string;
  html: string;
  /** Fallback em texto puro, exibido por clientes de e-mail que bloqueiam HTML e usado por filtros antispam. */
  text?: string;
  attachments?: MailAttachment[];
};

export async function sendMail(options: SendMailOptions): Promise<void> {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await getTransporter().sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text ?? htmlToPlainText(options.html),
    attachments: options.attachments,
  });
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|tr|div|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const BRAND_COLOR = '#2563eb';

export type EmailLayoutOptions = {
  /** Usado no <title> do documento e como título visível no topo do cartão. */
  title: string;
  /** Nome exibido na barra superior (normalmente o nome da empresa). */
  companyName?: string;
  /** Parágrafo de abertura, já com os dados do destinatário interpolados. */
  intro: string;
  /** Linhas de <tr> extras (tabela já aberta) com o conteúdo principal do e-mail. */
  bodyRows?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  /** Texto de rodapé; por padrão explica que é um e-mail automático. */
  footerNote?: string;
};

/**
 * Layout base (tabelas + estilos inline) reutilizado por todos os e-mails transacionais,
 * para manter a mesma identidade visual e compatibilidade com clientes de e-mail
 * que ignoram <style> (Outlook, versões antigas do Gmail, etc.).
 */
export function renderEmailLayout(options: EmailLayoutOptions): string {
  const { title, companyName, intro, bodyRows = '', ctaLabel, ctaUrl, footerNote } = options;

  const ctaBlock = ctaLabel && ctaUrl ? `
    <tr>
      <td style="padding: 28px 0 12px;">
        <a href="${ctaUrl}" style="background-color:${BRAND_COLOR}; color:#ffffff; text-decoration:none; font-weight:600; font-size:14px; padding:13px 30px; border-radius:8px; display:inline-block;">${ctaLabel}</a>
      </td>
    </tr>
    <tr>
      <td style="padding-bottom:4px; font-size:12px; color:#94a3b8;">
        Ou copie e cole este link no navegador:<br/>
        <a href="${ctaUrl}" style="color:${BRAND_COLOR}; word-break:break-all;">${ctaUrl}</a>
      </td>
    </tr>` : '';

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(15,23,42,0.08);">
            <tr>
              <td style="background-color:${BRAND_COLOR}; padding:22px 32px;">
                <span style="color:#ffffff; font-size:17px; font-weight:700; letter-spacing:0.2px;">${companyName || 'API de Orçamentos'}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 14px; font-size:20px; line-height:1.3; color:#0f172a;">${title}</h1>
                <p style="margin:0; font-size:14px; line-height:1.6; color:#334155;">${intro}</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${bodyRows}
                  ${ctaBlock}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px; background-color:#f8fafc; border-top:1px solid #e2e8f0;">
                <p style="margin:0; font-size:12px; line-height:1.5; color:#94a3b8;">${footerNote || 'Este é um e-mail automático, não é necessário responder.'}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
