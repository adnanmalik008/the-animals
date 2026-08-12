/* Templates for the admin module editor: every CMS-editable module
   key with its default (fixture) document. Saving a key writes the
   same shape to module_data; the board components read it back via
   useModuleData(key) and fall back to these fixtures when unset. */

import { aiVisibility, incomingNewsItem, newsItems, shareOfVoice } from "@/data/board";
import {
  appStoreVoice,
  hiringRows,
  hiringSummary,
  opinionLeaders,
  pulseWeek,
  redditInsights,
  redditors,
  searchTerms,
  socialPosts,
  stageVideos,
  subreddits,
  topSites,
  trafficChannels,
  voiceQuotes,
} from "@/data/live";
import { wildCams } from "@/data/wild";
import {
  aiProfiles,
  analystNote,
  channelMix,
  mediaOverlap,
  overlapBrands,
  searchKeywords,
  searchLandscape,
} from "@/data/competition";

export const MODULE_TEMPLATES: Record<string, unknown> = {
  newswire: { items: newsItems, incoming: incomingNewsItem },
  "social-pulse": { posts: socialPosts },
  conversation: { quotes: voiceQuotes },
  "on-stage": { videos: stageVideos },
  "ai-visibility": aiVisibility,
  "share-of-voice": { rows: shareOfVoice },
  "search-velocity": { terms: searchTerms },
  "top-sites": topSites,
  "opinion-leaders": { leaders: opinionLeaders },
  reddit: { subreddits, influencers: redditors, insights: redditInsights },
  "app-store": appStoreVoice,
  "traffic-sources": { channels: trafficChannels },
  pulse: { week: pulseWeek },
  hiring: { summary: hiringSummary, rows: hiringRows },
  "wild-cams": { cams: wildCams },
  "channel-mix": { competitors: channelMix },
  "media-overlap": { brands: overlapBrands, rows: mediaOverlap },
  "animal-view": analystNote,
  "ai-profile": { rows: aiProfiles },
  "search-landscape": { rows: searchLandscape, keywords: searchKeywords },
};
