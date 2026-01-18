import { injectable } from "@ooneex/container";
import { Polar } from "@polar-sh/sdk";
import { PaymentException } from "./PaymentException";
import type { CustomerSessionCreateType, CustomerSessionType } from "./types";

@injectable()
export class PolarCustomerPortal {
  private client: Polar;

  constructor() {
    const accessToken = Bun.env.POLAR_ACCESS_TOKEN;

    if (!accessToken) {
      throw new PaymentException(
        "Polar access token is required. Please set the POLAR_ACCESS_TOKEN environment variable.",
      );
    }

    this.client = new Polar({
      accessToken,
      server: (Bun.env.POLAR_ENVIRONMENT as "sandbox" | "production") || "production",
    });
  }

  public async create(data: CustomerSessionCreateType): Promise<CustomerSessionType> {
    const response = await this.client.customerSessions.create({
      customerId: data.customerId,
    });

    return this.mapResponse(response as unknown as CustomerSessionResponse);
  }

  public getPortalUrl(organizationSlug: string): string {
    const baseUrl = Bun.env.POLAR_ENVIRONMENT === "sandbox" ? "https://sandbox.polar.sh" : "https://polar.sh";

    return `${baseUrl}/${organizationSlug}/portal`;
  }

  private mapResponse(response: CustomerSessionResponse): CustomerSessionType {
    const session: CustomerSessionType = {
      id: response.id,
      token: response.token,
      customerPortalUrl: response.customerPortalUrl,
    };

    if (response.createdAt) {
      session.createdAt = response.createdAt;
    }

    if (response.expiresAt) {
      session.expiresAt = response.expiresAt;
    }

    if (response.customerId) {
      session.customerId = response.customerId;
    }

    return session;
  }
}

type CustomerSessionResponse = {
  id: string;
  token: string;
  customerPortalUrl: string;
  createdAt?: Date;
  expiresAt?: Date;
  customerId?: string;
};
