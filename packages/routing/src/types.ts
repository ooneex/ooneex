import type { Environment } from "@ooneex/app-env";
import type { ControllerClassType } from "@ooneex/controller";
import type { ERole } from "@ooneex/role";
import type { HttpMethodType } from "@ooneex/types";
import type { AssertType, IAssert } from "@ooneex/validation";

export const VALID_NAMESPACES = [
  "api",
  "client",
  "admin",
  "public",
  "auth",
  "webhook",
  "internal",
  "external",
  "system",
  "health",
  "metrics",
  "docs",
] as const;

export const VALID_ACTIONS = [
  "list",
  "show",
  "read",
  "create",
  "update",
  "delete",
  "store",
  "edit",
  "index",
  "search",
  "filter",
  "sort",
  "export",
  "import",
  "upload",
  "download",
  "duplicate",
  "clone",
  "archive",
  "restore",
  "activate",
  "deactivate",
  "enable",
  "disable",
  "publish",
  "unpublish",
  "approve",
  "reject",
  "cancel",
  "confirm",
  "validate",
  "verify",
  "reset",
  "refresh",
  "sync",
  "backup",
  "migrate",
  "seed",
  "truncate",
  "count",
  "exists",
  "find",
  "aggregate",
  "bulk",
  "batch",
  "preview",
  "template",
  "history",
  "audit",
  "log",
  "track",
  "monitor",
  "health",
  "status",
  "ping",
  "test",
  "debug",
  "info",
  "stats",
  "report",
  "analytics",
  "metrics",
  "summary",
  "detail",
  "config",
  "settings",
  "preferences",
  "profile",
  "avatar",
  "password",
  "login",
  "logout",
  "register",
  "unregister",
  "subscribe",
  "unsubscribe",
  "follow",
  "unfollow",
  "like",
  "unlike",
  "share",
  "comment",
  "reply",
  "rate",
  "review",
  "bookmark",
  "favorite",
  "tag",
  "untag",
  "assign",
  "unassign",
  "invite",
  "revoke",
  "grant",
  "deny",
  "lock",
  "unlock",
  "move",
  "copy",
  "rename",
  "reorder",
  "merge",
  "split",
  "convert",
  "transform",
  "process",
  "queue",
  "retry",
  "skip",
  "pause",
  "resume",
  "stop",
  "start",
  "restart",
  "reload",
  "clear",
  "flush",
  "purge",
  "cleanup",
  "optimize",
  "compress",
  "decompress",
  "manage",
  "administer",
  "supervise",
  "oversee",
  "govern",
  "control",
  "execute",
  "perform",
  "run",
  "operate",
  "handle",
  "maintain",
  "service",
  "support",
  "assist",
  "help",
  "guide",
  "instruct",
  "teach",
  "train",
  "educate",
  "inform",
  "notify",
  "alert",
  "warn",
  "remind",
  "schedule",
  "plan",
  "organize",
  "arrange",
  "coordinate",
  "integrate",
  "connect",
  "link",
  "bind",
  "attach",
  "detach",
  "separate",
  "isolate",
  "quarantine",
  "protect",
  "secure",
  "encrypt",
  "decrypt",
  "encode",
  "decode",
  "format",
  "parse",
  "serialize",
  "deserialize",
  "marshal",
  "unmarshal",
  "package",
  "unpack",
  "bundle",
  "unbundle",
  "group",
  "ungroup",
  "categorize",
  "classify",
  "order",
  "rank",
  "prioritize",
  "weight",
  "score",
  "evaluate",
  "assess",
  "measure",
  "calculate",
  "compute",
  "analyze",
  "examine",
  "inspect",
  "check",
  "scan",
  "detect",
  "discover",
  "explore",
  "browse",
  "navigate",
  "travel",
  "visit",
  "access",
  "enter",
  "exit",
  "leave",
  "join",
  "disconnect",
  "reconnect",
  "establish",
  "initialize",
  "setup",
  "configure",
  "customize",
  "personalize",
  "adapt",
  "adjust",
  "modify",
  "change",
  "alter",
  "revise",
  "amend",
  "correct",
  "fix",
  "repair",
  "recover",
  "retrieve",
  "fetch",
  "get",
  "obtain",
  "acquire",
  "receive",
  "accept",
  "take",
  "capture",
  "record",
  "save",
  "preserve",
  "keep",
  "retain",
  "hold",
  "sustain",
  "continue",
  "proceed",
  "advance",
  "progress",
  "develop",
  "evolve",
  "grow",
  "expand",
  "extend",
  "stretch",
  "scale",
  "resize",
  "tune",
  "calibrate",
  "balance",
  "stabilize",
  "normalize",
  "standardize",
  "regulate",
  "moderate",
  "mediate",
  "negotiate",
  "compromise",
  "resolve",
  "solve",
  "address",
  "tackle",
  "approach",
  "deal",
  "cope",
  "direct",
  "lead",
  "command",
  "instruct",
  "order",
  "request",
  "ask",
  "query",
  "question",
  "inquire",
  "investigate",
  "research",
  "study",
  "learn",
  "understand",
  "comprehend",
  "grasp",
  "realize",
  "recognize",
  "identify",
  "determine",
  "decide",
  "choose",
  "select",
  "pick",
  "opt",
  "prefer",
  "favor",
  "recommend",
  "suggest",
  "propose",
  "offer",
  "provide",
  "supply",
  "deliver",
  "send",
  "transmit",
  "transfer",
  "forward",
  "relay",
  "redirect",
  "route",
  "dispatch",
  "distribute",
  "allocate",
  "designate",
  "appoint",
  "nominate",
  "elect",
  "vote",
  "poll",
  "survey",
  "interview",
  "examine",
  "trial",
  "experiment",
  "try",
  "attempt",
  "endeavor",
  "strive",
  "effort",
  "work",
  "labor",
  "toil",
  "struggle",
  "fight",
  "battle",
  "compete",
  "contest",
  "challenge",
  "oppose",
  "resist",
  "defend",
  "guard",
  "shield",
  "cover",
  "hide",
  "conceal",
  "mask",
  "disguise",
  "camouflage",
  "cloak",
  "wrap",
  "enclose",
  "contain",
  "include",
  "encompass",
  "comprise",
  "consist",
  "compose",
  "constitute",
  "form",
  "shape",
  "mold",
  "craft",
  "build",
  "construct",
  "assemble",
  "compile",
  "gather",
  "collect",
  "accumulate",
  "amass",
  "pile",
  "stack",
  "heap",
  "load",
  "fill",
  "populate",
  "occupy",
  "inhabit",
  "reside",
  "dwell",
  "live",
  "exist",
  "become",
  "turn",
  "metamorphose",
  "mutate",
  "accommodate",
  "conform",
  "comply",
  "obey",
  "follow",
  "adhere",
  "stick",
  "fasten",
  "tie",
  "unite",
  "combine",
  "mix",
  "blend",
  "fuse",
  "incorporate",
  "embed",
  "insert",
  "inject",
  "introduce",
  "bring",
  "carry",
  "transport",
  "convey",
  "spread",
  "scatter",
  "disperse",
  "disseminate",
  "broadcast",
  "announce",
  "declare",
  "proclaim",
  "state",
  "express",
  "voice",
  "speak",
  "say",
  "tell",
  "communicate",
  "shift",
  "relocate",
  "journey",
  "voyage",
  "trip",
  "tour",
  "locate",
  "position",
  "place",
  "put",
  "set",
  "lay",
  "rest",
  "sit",
  "stand",
  "rise",
  "lift",
  "raise",
  "elevate",
  "boost",
  "enhance",
  "improve",
  "upgrade",
  "renew",
  "revive",
  "mend",
  "heal",
  "cure",
  "treat",
  "remedy",
  "settle",
  "conclude",
  "finish",
  "complete",
  "end",
  "terminate",
  "halt",
  "break",
  "interrupt",
  "suspend",
  "delay",
  "postpone",
  "defer",
  "wait",
  "uphold",
  "safeguard",
  "ensure",
  "guarantee",
  "warrant",
  "promise",
  "pledge",
  "commit",
  "dedicate",
  "devote",
  "consecrate",
  "sacrifice",
  "give",
  "donate",
  "contribute",
  "furnish",
  "equip",
  "outfit",
  "prepare",
  "ready",
  "design",
  "make",
  "produce",
  "manufacture",
  "fabricate",
  "erect",
  "found",
  "institute",
  "inaugurate",
  "launch",
  "begin",
  "commence",
  "initiate",
  "trigger",
  "turn-on",
  "switch-on",
  "power-on",
  "boot",
  "startup",
  "function",
  "act",
  "behave",
  "conduct",
  "steer",
  "pilot",
  "drive",
  "rule",
  "manipulate",
  "use",
  "utilize",
  "employ",
  "apply",
  "implement",
  "deploy",
  "install",
  "refine",
  "polish",
  "perfect",
  "finalize",
  "close",
  "shut",
  "seal",
  "watch",
  "observe",
] as const;

export type RouteNamespace = (typeof VALID_NAMESPACES)[number];
export type RouteAction = (typeof VALID_ACTIONS)[number];
export type RouteNameSegment = string;

/**
 * Route name type that enforces 'api.users.list' format
 * Must be three segments separated by dots: namespace.resource.action
 * Example: 'api.users.list', 'web.posts.show', 'admin.settings.update'
 */
export type RouteNameType = `${RouteNamespace}.${RouteNameSegment}.${RouteAction}`;

export type RouteConfigType = {
  name: RouteNameType;
  path: `/${string}`;
  method: HttpMethodType;
  params?: Record<string, AssertType | IAssert>;
  queries?: AssertType | IAssert;
  payload?: AssertType | IAssert;
  response?: AssertType | IAssert;
  controller: ControllerClassType;
  description: string;
  env?: Environment[];
  ip?: string[];
  host?: string[];
  roles?: ERole[];
  isSocket: boolean;
  generate?: {
    doc?: boolean;
    fetcher?: boolean;
    queryHook?: boolean;
  };
};

export interface IRouter {
  addRoute: (route: RouteConfigType) => this;
  findRouteByPath: (path: string) => RouteConfigType[] | null;
  findRouteByName: (name: RouteNameType) => RouteConfigType | null;
  getRoutes: () => Map<string, RouteConfigType[]>;
  getSocketRoutes: () => Map<string, RouteConfigType[]>;
  getHttpRoutes: () => Map<string, RouteConfigType[]>;
  generate: <P extends Record<string, string | number> = Record<string, string | number>>(
    name: RouteNameType,
    params?: P,
  ) => string;
}

/**
 * Check if a string segment is a route parameter (starts with :)
 */
export type IsParameter<T extends string> = T extends `:${string}` ? true : false;

/**
 * Extract all parameter names from a route path
 * Examples:
 * - "/users/:id" -> "id"
 * - "/users/:id/bills/:billId" -> "id" | "billId"
 * - "/static/path" -> never
 */
export type ExtractParameters<T extends string> = T extends `${infer _Start}/:${infer Param}/${infer Rest}`
  ? Param | ExtractParameters<`/${Rest}`>
  : T extends `${infer _Start}/:${infer Param}`
    ? Param
    : never;

/**
 * Helper type to check for malformed parameters in a single segment
 */
type HasMalformedParameter<T extends string> = T extends `:${string}:${string}` ? true : false;

/**
 * Helper type to validate each path segment recursively
 */
type ValidateSegments<T extends string> = T extends `${infer Segment}/${infer Rest}`
  ? HasMalformedParameter<Segment> extends true
    ? never
    : ValidateSegments<Rest>
  : HasMalformedParameter<T> extends true
    ? never
    : T;

/**
 * Validate that a route path follows correct patterns
 * - Must start with /
 * - No double slashes (//)
 * - No malformed parameters (like :id:name within same segment)
 * - Parameters must be in format /:paramName
 * - Allow multiple parameters like /users/:id/emails/:emailId
 */
export type ValidateRoutePath<T extends string> = T extends `/${infer Path}`
  ? T extends `${string}//${string}`
    ? never // Reject paths with double slashes
    : T extends `${string}/:${string}/:`
      ? never // Reject trailing colon after parameter
      : T extends `${string}/:`
        ? never // Reject parameter without name
        : T extends `${string}:${string}/`
          ? never // Reject trailing slash after parameter with colon
          : ValidateSegments<Path> extends never
            ? never
            : T
  : never; // Must start with /

/**
 * Main route path type that ensures valid path structure
 */
export type RoutePathType<T extends string = string> = ValidateRoutePath<T>;

/**
 * Extract route parameters as a typed record
 * Examples:
 * - RouteParameters<"/users/:id"> -> { id: string }
 * - RouteParameters<"/users/:id/bills/:billId"> -> { id: string; billId: string }
 * - RouteParameters<"/static"> -> Record<string, never>
 */
export type RouteParameters<T extends string> = ExtractParameters<T> extends never
  ? Record<string, never>
  : Record<ExtractParameters<T>, string>;

/**
 * Check if a route path has parameters
 */
export type HasParameters<T extends string> = ExtractParameters<T> extends never ? false : true;

/**
 * Get parameter count for a route path
 */
export type CountParameters<
  T extends string,
  Count extends readonly unknown[] = readonly [],
> = ExtractParameters<T> extends never
  ? Count["length"]
  : T extends `${infer _Start}/:${infer _Param}/${infer Rest}`
    ? CountParameters<`/${Rest}`, readonly [...Count, unknown]>
    : T extends `${infer _Start}/:${infer _Param}`
      ? [...Count, unknown]["length"]
      : Count["length"];

export type ParameterCount<T extends string> = CountParameters<T>;

/**
 * Utility type to ensure route path is valid at compile time
 * Usage: const path: ValidRoutePath = "/users/:id/bills/:billId";
 */
export type ValidRoutePath = RoutePathType<string>;
