/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRecoilState } from "recoil";
import { cachedAtom, cachedSelector } from "./cached-recoil";

export const useModel = <T extends Record<string, any>>({
  name,
  default: defaultModel
}: {
  name: string;
  default: T;
}): {
  model: T;
  setterOf: { [K in keyof T]: (value: T[K]) => void };
} => {
  const model: Partial<T> = {};
  const setterOf: Partial<{ [K in keyof T]: (value: T[K]) => void }> = {};

  Object.entries(defaultModel).forEach(([key, defaultValue]) => {
    const atomKey = `atom-${name}-${key}`;
    const selectorKey = `selector-${name}-${key}`;

    const atom = cachedAtom({
      key: atomKey,
      default: defaultValue
    });

    const selector = cachedSelector({
      atom,
      selectorKey
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useRecoilState(selector);

    model[key as keyof T] = value;
    setterOf[key as keyof T] = setValue;
  });

  return {
    model: model as T,
    setterOf: setterOf as { [K in keyof T]: (value: T[K]) => void }
  };
};
