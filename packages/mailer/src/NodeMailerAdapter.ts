import nodemailer from "nodemailer";
import { renderToString } from "react-dom/server";
import { decorator } from "./decorators";
import { MailerException } from "./MailerException";
import type { IMailer } from "./types";

@decorator.mailer()
export class NodeMailerAdapter implements IMailer {
  private dsn: string;
  private from?: { name: string; address: string };

  constructor() {
    this.dsn = Bun.env.NODE_MAILER_DSN?.trim() as string;

    this.from = {
      name: Bun.env.MAILER_SENDER_NAME?.trim() || "",
      address: Bun.env.MAILER_SENDER_ADDRESS?.trim() || "",
    };

    if (!this.dsn) {
      throw new MailerException(
        "NODE_MAILER_DSN environment variable is not set or is empty. Please configure the mailer DSN connection string.",
      );
    }
  }

  public async send(config: {
    to: string[];
    subject: string;
    content: React.ReactNode;
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

    const transporter = nodemailer.createTransport({
      url: this.dsn,
    });

    await transporter.sendMail({
      from: { name: senderName, address: senderAddress },
      to: config.to,
      subject: config.subject,
      html: renderToString(config.content),
    });
  }
}
