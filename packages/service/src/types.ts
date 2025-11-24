// biome-ignore lint/suspicious/noExplicitAny: trust me
export type ServiceClassType = new (...args: any[]) => IService;

export interface IService {
  execute: () => Promise<void>;
}
