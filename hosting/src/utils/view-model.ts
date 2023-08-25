export type ViewModel<T> = {
  state: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actions: Record<string, (...args: any[]) => Promise<void> | void>;
};
