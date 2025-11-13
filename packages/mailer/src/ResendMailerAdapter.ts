import type { ScalarType } from "@ooneex/types";
import { renderToString } from "react-dom/server";
import { Resend } from "resend";
import { MailerException } from "./MailerException";
import type { IMailer } from "./types";

export class ResendMailerAdapter implements IMailer {
  private apiKey: string;
  private from?: { name: string; address: string };

  constructor() {
    this.apiKey = Bun.env.RESEND_API_KEY?.trim() as string;

    this.from = {
      name: Bun.env.MAILER_SENDER_NAME?.trim() || "",
      address: Bun.env.MAILER_SENDER_ADDRESS?.trim() || "",
    };

    if (!this.apiKey) {
      throw new MailerException(
        "RESEND_API_KEY environment variable is not set or is empty. Please configure the mailer DSN connection string.",
      );
    }
  }

  public async send(config: {
    to: string[];
    subject: string;
    content: React.ReactNode;
    params?: Record<string, ScalarType>;
    from?: { name: string; address: string };
  }): Promise<void> {
    const senderName = config.from?.name || this.from?.name || "";
    const senderAddress = config.from?.address || this.from?.address || "";

    if (!senderName) {
      throw new MailerException(
        "MAILER_SENDER_NAME environment variable is not set or is empty. Please configure the mailer sender name.",
      );
    }

    if (!senderAddress) {
      throw new MailerException(
        "MAILER_SENDER_ADDRESS environment variable is not set or is empty. Please configure the mailer sender address.",
      );
    }

    const client = new Resend(this.apiKey);

    await client.emails.send({
      to: config.to,
      from: `${senderName} <${senderAddress}>`,
      subject: `${config.subject}`,
      html: renderToString(config.content, config.params),
    });
  }
}
