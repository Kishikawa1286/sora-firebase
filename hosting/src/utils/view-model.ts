export type ViewModel<T> = {
  state: T;
  actions: Record<string, () => Promise<void> | void>;
};
