const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"] as const;

export type MethodType = (typeof METHODS)[number];

export type RouteConfigType = {
  name: string;
  path: `/${string}`;
  method: MethodType;
  description?: string;
};
