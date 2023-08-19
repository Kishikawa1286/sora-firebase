export const extractSlackMentions = (text: string): string[] =>
  Array.from(text.matchAll(/<@(\w+)>/g), (match) => match[1]);
