export default interface HowLongToBeatEntry {
  id: string;
  name: string;
  description?: string;
  platforms?: string[];
  imageUrl?: string;
  timeLabels?: Array<string[]>;
  gameplayMain: number;
  gameplayMainExtra: number;
  gameplayCompletionist: number;
  similarity: number;
  playableOn?: string[]}