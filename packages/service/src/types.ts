// biome-ignore lint/suspicious/noExplicitAny: trust me
export type ServiceClassType = new (...args: any[]) => IService;

// biome-ignore lint/suspicious/noExplicitAny: trust me
export interface IService<T extends Record<string, any> = Record<string, any>> {
  // biome-ignore lint/suspicious/noExplicitAny: trust me
  execute: (data?: T) => Promise<any> | any;
}
