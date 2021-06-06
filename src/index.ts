import axios from "axios";
import Steam from "./models/Steam";
import { HowLongToBeatService } from "howlongtobeat";
import Stat, { Result } from "./models/Result";
import HowLongToBeatEntry from "./models/HowLongToBeat";

export default async function getPileOfShame(steamApiKey: string, steamId: string): Promise<Stat> {
  const hltbService = new HowLongToBeatService();
  console.log("Initialized HLTB Service");
  const stats: Stat = {
    results: [],
    totalGames: 0,
    trackedGames: 0,
    averagePlaythroughPercentageMain: 0,
    averagePlaythroughPercentageMainExtra: 0,
    averagePlaythroughPercentageCompletionist: 0,
    probablyCompletedMain: 0,
    probablyCompletedMainExtra: 0,
    probablyCompletedCompletionist: 0,
    probablyCompletedMainPercentage: 0,
    probablyCompletedMainExtraPercentage: 0,
    probablyCompletedCompletionistPercentage: 0,
    accuracy: 0,
  };
  console.log("Collecting Steam Games...");
  const steamData: Steam = await getGamesList(steamApiKey, steamId);
  stats.totalGames = steamData.game_count;
  console.log(`Found ${steamData.game_count} Steam Games!`);
  console.log("Collecting How Long To Beat Statistics...");
  for (let game of steamData.games) {
    const hltbEntries = await hltbService.search(game.name);
    if (hltbEntries.length === 0) {
      console.warn(`"${game.name}" not found in HowLongToBeat.`);
      continue;
    }
    let mostAccurateEntry: HowLongToBeatEntry = hltbEntries.reduce((prev, current) => {
      return prev.similarity > current.similarity ? prev : current;
    });
    if (mostAccurateEntry.gameplayMain === 0) {
      console.warn(`"${game.name}" has not enough data yet in HowLongToBeat.`);
      continue;
    }
    // Sanitize Anomalies
    if (mostAccurateEntry.gameplayMainExtra < mostAccurateEntry.gameplayMain) {
      mostAccurateEntry.gameplayMainExtra = mostAccurateEntry.gameplayMain;
    }
    if (mostAccurateEntry.gameplayCompletionist < mostAccurateEntry.gameplayMainExtra) {
      mostAccurateEntry.gameplayCompletionist = mostAccurateEntry.gameplayMainExtra;
    }
    const percentageMain = (100 * game.playtime_forever) / mostAccurateEntry.gameplayMain;
    const percentageMainExtra = (100 * game.playtime_forever) / mostAccurateEntry.gameplayMainExtra;
    const percentageCompletionist = (100 * game.playtime_forever) / mostAccurateEntry.gameplayCompletionist;
    const result: Result = {
      steamAppId: game.appid,
      hltbId: mostAccurateEntry.id,
      name: game.name,
      hltbMatchName: mostAccurateEntry.name,
      accuracy: mostAccurateEntry.similarity,
      img_icon_url: game.img_icon_url,
      img_logo_url: game.img_logo_url,
      playtime: game.playtime_forever,
      gameplayMain: mostAccurateEntry.gameplayMain,
      gameplayMainExtra: mostAccurateEntry.gameplayMainExtra,
      gameplayCompletionist: mostAccurateEntry.gameplayCompletionist,
      percentageMain: percentageMain,
      percentageMainExtra: percentageMainExtra,
      percentageCompletionist: percentageCompletionist,
      probablyCompletedMain: percentageMain >= 100,
      probablyCompletedMainExtra: percentageMainExtra >= 100,
      probablyCompletedCompletionist: percentageCompletionist >= 100,
    };
    stats.results.push(result);
    console.log(`Collected "${game.name}" as "${mostAccurateEntry.name}" (${(result.accuracy * 100).toFixed(2)}% Accuracy)`);
  }
  stats.trackedGames = stats.results.length;
  stats.accuracy = stats.results.reduce((r, c) => r + c.accuracy, 0) / stats.results.length;
  stats.averagePlaythroughPercentageMain = stats.results.reduce((r, c) => r + c.percentageMain, 0) / stats.results.length;
  stats.averagePlaythroughPercentageMainExtra = stats.results.reduce((r, c) => r + c.percentageMainExtra, 0) / stats.results.length;
  stats.averagePlaythroughPercentageCompletionist = stats.results.reduce((r, c) => r + c.percentageCompletionist, 0) / stats.results.length;
  stats.probablyCompletedMain = stats.results.filter((res) => res.probablyCompletedMain).length;
  stats.probablyCompletedMainExtra = stats.results.filter((res) => res.probablyCompletedMainExtra).length;
  stats.probablyCompletedCompletionist = stats.results.filter((res) => res.probablyCompletedCompletionist).length;
  stats.probablyCompletedMainPercentage = (100 * stats.probablyCompletedMain) / stats.trackedGames;
  stats.probablyCompletedMainExtraPercentage = (100 * stats.probablyCompletedMainExtra) / stats.trackedGames;
  stats.probablyCompletedCompletionistPercentage = (100 * stats.probablyCompletedCompletionist) / stats.trackedGames;
  console.log("Done!");
  return stats;
}

async function getGamesList(steamApiKey: string, steamId: string): Promise<Steam> {
  const request = await axios.get(
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamApiKey}&steamid=${steamId}&format=json&include_appinfo=true&include_played_free_games=true`
  );
  if (request.status !== 200) throw Error(request.statusText);
  const data = (await request.data.response) as Steam;
  data.games.map((game) => (game.playtime_forever = game.playtime_forever / 60));
  data.games.sort((a, b) => a.name.localeCompare(b.name));
  return data;
}
