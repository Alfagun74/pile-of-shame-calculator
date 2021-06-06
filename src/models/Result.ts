export interface Result {
  steamAppId: number;
  hltbId: string;
  name: string;
  hltbMatchName: string;
  accuracy: number;
  img_icon_url: string;
  img_logo_url: string;
  playtime: number;
  gameplayMain: number;
  gameplayMainExtra: number;
  gameplayCompletionist: number;
  percentageMain: number;
  percentageMainExtra: number;
  percentageCompletionist: number;
  probablyCompletedMain: boolean;
  probablyCompletedMainExtra: boolean;
  probablyCompletedCompletionist: boolean;
}

export default interface Stat {
  results: Result[];
  totalGames: number;
  trackedGames: number;
  totalPlayedHours: number;
  totalNeededHoursMain: number;
  totalNeededHoursMainExtra: number;
  totalNeededHoursCompletionist: number;
  averagePlaythroughPercentageMain: number;
  averagePlaythroughPercentageMainExtra: number;
  averagePlaythroughPercentageCompletionist: number;
  probablyCompletedMain: number;
  probablyCompletedMainPercentage: number;
  probablyCompletedMainExtra: number;
  probablyCompletedMainExtraPercentage: number;
  probablyCompletedCompletionist: number;
  probablyCompletedCompletionistPercentage: number;
  accuracy: number;
}
