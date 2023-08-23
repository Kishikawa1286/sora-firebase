import { randomBytes } from 'crypto';

const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

export const randomString = (length: number) => {
  const bytes = randomBytes(length);
  const result = Array.from(bytes)
    .map((byte) => charset[byte % charset.length])
    .join('');
  return result;
};
