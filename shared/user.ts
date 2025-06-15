// Define our own Id type since the generated file is not available
export type Id<T extends string> = string & { __type: T };

export type UserRole = "client" | "transporter" | "admin";

export interface User {
  _id: Id<"users">;
  clerkId: string;
  role: UserRole;
  isApproved: boolean;
  email: string;
  name: string;
  createdAt: number;
}
