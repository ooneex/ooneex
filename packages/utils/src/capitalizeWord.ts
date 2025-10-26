export const capitalizeWord = (word: string): string => {
  return word ? word[0]?.toUpperCase() + word.slice(1).toLowerCase() : word;
};
