/* eslint-disable @typescript-eslint/no-explicit-any */

export type ViewModel<T extends Record<string, any>> = {
  model: T;
  actions: Record<string, (...args: any[]) => Promise<void> | void>;
};
