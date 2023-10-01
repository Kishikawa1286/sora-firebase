/* eslint-disable @typescript-eslint/no-explicit-any */
import { RecoilState, atom as _atom, selector } from "recoil";

const recoilCache: Record<string, RecoilState<any>> = {};

export const cachedAtom = <T>({
  key,
  default: defaultValue
}: {
  key: string;
  default: T;
}): RecoilState<T> => {
  if (!recoilCache[key]) {
    recoilCache[key] = _atom({
      key,
      default: defaultValue
    });
  }

  return recoilCache[key];
};

export const cachedSelector = <T>({
  atom,
  selectorKey
}: {
  atom: RecoilState<T>;
  selectorKey: string;
}): RecoilState<T> => {
  if (!recoilCache[selectorKey]) {
    recoilCache[selectorKey] = selector({
      key: selectorKey,
      get: ({ get }) => get(atom),
      set: ({ set }, value) => set(atom, value)
    });
  }

  return recoilCache[selectorKey];
};
