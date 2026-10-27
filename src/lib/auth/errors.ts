import { CredentialsSignin } from "next-auth";

export class DashboardAccessRevoked extends CredentialsSignin {
  code = "access_revoked";
}
