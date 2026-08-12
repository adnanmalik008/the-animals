/* Templates for the admin module editor: every CMS-editable module
   key with its default (fixture) document. Saving a key writes the
   same shape to module_data; the board components read it back via
   useModuleData(key) and fall back to these fixtures when unset. */

import { aiVisibility, incomingNewsItem, newsItems, shareOfVoice } from "@/data/board";
import {
  appStoreVoice,
  conversationQuotes,
  hiringRows,
  hiringSummary,
  opinionLeaders,
  redditInsights,
  redditors,
  searchTerms,
  socialPosts,
  stageEvents,
  subreddits,
  topSites,
  trafficChannels,
  wikiPulse,
  wikiPulseSpikes,
} from "@/data/live";
import { wildCams } from "@/data/wild";
import {
  aiObservations,
  aiProfiles,
  analystNote,
  channelMix,
  homepageCards,
  horizon,
  mediaOverlap,
  overlapBrands,
  searchLandscape,
  socialCards,
} from "@/data/competition";

export const MODULE_TEMPLATES: Record<string, unknown> = {
  newswire: { items: newsItems, incoming: incomingNewsItem },
  "social-pulse": { posts: socialPosts },
  conversation: { quotes: conversationQuotes },
  "on-stage": { events: stageEvents },
  "ai-visibility": aiVisibility,
  "share-of-voice": { rows: shareOfVoice },
  "search-velocity": { terms: searchTerms },
  "top-sites": topSites,
  "opinion-leaders": { leaders: opinionLeaders },
  reddit: { subreddits, influencers: redditors, insights: redditInsights },
  "app-store": appStoreVoice,
  "traffic-sources": { channels: trafficChannels },
  pulse: { spikes: wikiPulseSpikes, rows: wikiPulse },
  hiring: { summary: hiringSummary, rows: hiringRows },
  "wild-cams": { cams: wildCams },
  "channel-mix": { competitors: channelMix },
  "media-overlap": { brands: overlapBrands, rows: mediaOverlap },
  "animal-view": analystNote,
  "show-up": { homepage: homepageCards, social: socialCards },
  "ai-profile": { rows: aiProfiles, observations: aiObservations },
  "search-landscape": { rows: searchLandscape },
  horizon: { columns: horizon },
};
