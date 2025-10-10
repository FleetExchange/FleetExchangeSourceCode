/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as crons from "../crons.js";
import type * as files from "../files.js";
import type * as fleet from "../fleet.js";
import type * as notifications from "../notifications.js";
import type * as payments from "../payments.js";
import type * as payoutAccount from "../payoutAccount.js";
import type * as proofOfDelivery from "../proofOfDelivery.js";
import type * as purchasetrip from "../purchasetrip.js";
import type * as trip from "../trip.js";
import type * as truck from "../truck.js";
import type * as userQueries from "../userQueries.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  files: typeof files;
  fleet: typeof fleet;
  notifications: typeof notifications;
  payments: typeof payments;
  payoutAccount: typeof payoutAccount;
  proofOfDelivery: typeof proofOfDelivery;
  purchasetrip: typeof purchasetrip;
  trip: typeof trip;
  truck: typeof truck;
  userQueries: typeof userQueries;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
