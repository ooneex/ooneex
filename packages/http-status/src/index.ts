const STATUS_CODE = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,

  OK: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInfo: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  IMUsed: 226,

  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,

  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  ContentTooLarge: 413,
  URITooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  Teapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,

  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HTTPVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
} as const;

const STATUS_TEXT = {
  [STATUS_CODE.Accepted]: "Accepted",
  [STATUS_CODE.AlreadyReported]: "Already Reported",
  [STATUS_CODE.BadGateway]: "Bad Gateway",
  [STATUS_CODE.BadRequest]: "Bad Request",
  [STATUS_CODE.Conflict]: "Conflict",
  [STATUS_CODE.Continue]: "Continue",
  [STATUS_CODE.Created]: "Created",
  [STATUS_CODE.EarlyHints]: "Early Hints",
  [STATUS_CODE.ExpectationFailed]: "Expectation Failed",
  [STATUS_CODE.FailedDependency]: "Failed Dependency",
  [STATUS_CODE.Forbidden]: "Forbidden",
  [STATUS_CODE.Found]: "Found",
  [STATUS_CODE.GatewayTimeout]: "Gateway Timeout",
  [STATUS_CODE.Gone]: "Gone",
  [STATUS_CODE.HTTPVersionNotSupported]: "HTTP Version Not Supported",
  [STATUS_CODE.IMUsed]: "IM Used",
  [STATUS_CODE.InsufficientStorage]: "Insufficient Storage",
  [STATUS_CODE.InternalServerError]: "Internal Server Error",
  [STATUS_CODE.LengthRequired]: "Length Required",
  [STATUS_CODE.Locked]: "Locked",
  [STATUS_CODE.LoopDetected]: "Loop Detected",
  [STATUS_CODE.MethodNotAllowed]: "Method Not Allowed",
  [STATUS_CODE.MisdirectedRequest]: "Misdirected Request",
  [STATUS_CODE.MovedPermanently]: "Moved Permanently",
  [STATUS_CODE.MultiStatus]: "Multi Status",
  [STATUS_CODE.MultipleChoices]: "Multiple Choices",
  [STATUS_CODE.NetworkAuthenticationRequired]: "Network Authentication Required",
  [STATUS_CODE.NoContent]: "No Content",
  [STATUS_CODE.NonAuthoritativeInfo]: "Non Authoritative Info",
  [STATUS_CODE.NotAcceptable]: "Not Acceptable",
  [STATUS_CODE.NotExtended]: "Not Extended",
  [STATUS_CODE.NotFound]: "Not Found",
  [STATUS_CODE.NotImplemented]: "Not Implemented",
  [STATUS_CODE.NotModified]: "Not Modified",
  [STATUS_CODE.OK]: "OK",
  [STATUS_CODE.PartialContent]: "Partial Content",
  [STATUS_CODE.PaymentRequired]: "Payment Required",
  [STATUS_CODE.PermanentRedirect]: "Permanent Redirect",
  [STATUS_CODE.PreconditionFailed]: "Precondition Failed",
  [STATUS_CODE.PreconditionRequired]: "Precondition Required",
  [STATUS_CODE.Processing]: "Processing",
  [STATUS_CODE.ProxyAuthRequired]: "Proxy Auth Required",
  [STATUS_CODE.ContentTooLarge]: "Content Too Large",
  [STATUS_CODE.RequestHeaderFieldsTooLarge]: "Request Header Fields Too Large",
  [STATUS_CODE.RequestTimeout]: "Request Timeout",
  [STATUS_CODE.URITooLong]: "URI Too Long",
  [STATUS_CODE.RangeNotSatisfiable]: "Range Not Satisfiable",
  [STATUS_CODE.ResetContent]: "Reset Content",
  [STATUS_CODE.SeeOther]: "See Other",
  [STATUS_CODE.ServiceUnavailable]: "Service Unavailable",
  [STATUS_CODE.SwitchingProtocols]: "Switching Protocols",
  [STATUS_CODE.Teapot]: "I'm a teapot",
  [STATUS_CODE.TemporaryRedirect]: "Temporary Redirect",
  [STATUS_CODE.TooEarly]: "Too Early",
  [STATUS_CODE.TooManyRequests]: "Too Many Requests",
  [STATUS_CODE.Unauthorized]: "Unauthorized",
  [STATUS_CODE.UnavailableForLegalReasons]: "Unavailable For Legal Reasons",
  [STATUS_CODE.UnprocessableEntity]: "Unprocessable Entity",
  [STATUS_CODE.UnsupportedMediaType]: "Unsupported Media Type",
  [STATUS_CODE.UpgradeRequired]: "Upgrade Required",
  [STATUS_CODE.UseProxy]: "Use Proxy",
  [STATUS_CODE.VariantAlsoNegotiates]: "Variant Also Negotiates",
} as const;

export type StatusCodeType = (typeof STATUS_CODE)[keyof typeof STATUS_CODE];
export type StatusTextType = (typeof STATUS_TEXT)[keyof typeof STATUS_TEXT];

export interface IStatus {
  isInformational(code: StatusCodeType): boolean;
  isSuccessful(code: StatusCodeType): boolean;
  isRedirect(code: StatusCodeType): boolean;
  isClientError(code: StatusCodeType): boolean;
  isServerError(code: StatusCodeType): boolean;
  isError(code: StatusCodeType): boolean;
}

export class Status implements IStatus {
  public static Code = STATUS_CODE;
  public static Text = STATUS_TEXT;

  public isInformational = (code: StatusCodeType) => {
    return code >= STATUS_CODE.Continue && code < STATUS_CODE.OK;
  };

  public isSuccessful = (code: StatusCodeType) => {
    return code >= STATUS_CODE.OK && code < STATUS_CODE.MultipleChoices;
  };

  public isRedirect = (code: StatusCodeType) => {
    return code >= STATUS_CODE.MultipleChoices && code < STATUS_CODE.BadRequest;
  };

  public isClientError = (code: StatusCodeType) => {
    return code >= STATUS_CODE.BadRequest && code < STATUS_CODE.InternalServerError;
  };

  public isServerError = (code: StatusCodeType) => {
    return code >= STATUS_CODE.InternalServerError && code < 600;
  };

  public isError = (code: StatusCodeType) => {
    return this.isClientError(code) || this.isServerError(code);
  };
}
