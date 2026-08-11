/* ============================================================
   In the Wild — 24/7 nature live cams.

   NOTE: YouTube video ids below are manually curated and are
   meant to be replaceable via a CMS later. All six ids were
   verified against YouTube's oembed API on 2026-08-11. Live
   streams occasionally rotate their ids; every card degrades
   gracefully (emoji fallback) when a thumbnail is unavailable.
   ============================================================ */

export interface WildCam {
  id: string;
  /** YouTube video id of the 24/7 live stream */
  videoId: string;
  emoji: string;
  name: string;
  location: string;
}

export const wildCams: WildCam[] = [
  {
    id: "tembe-elephants",
    videoId: "gdrNUUf-cQw",
    emoji: "\u{1F418}", // elephant
    name: "Elephant Watch",
    location: "Tembe Elephant Park · South Africa",
  },
  {
    id: "namib-waterhole",
    videoId: "ydYDqZQpim8",
    emoji: "\u{1F992}", // giraffe
    name: "Desert Waterhole",
    location: "Namib Desert · Namibia",
  },
  {
    id: "big-bear-eagles",
    videoId: "B4-L2nfGcuE",
    emoji: "\u{1F985}", // eagle
    name: "Bald Eagle Nest",
    location: "Big Bear Valley · CA",
  },
  {
    id: "cornell-feeders",
    videoId: "N609loYkFJo",
    emoji: "\u{1F426}", // bird
    name: "Bird Feeders",
    location: "Cornell Lab, Sapsucker Woods · NY",
  },
  {
    id: "tropical-reef",
    videoId: "DHUnz4dyb54",
    emoji: "\u{1F420}", // tropical fish
    name: "Tropical Reef",
    location: "Explore.org · Cayman Islands",
  },
  {
    id: "earth-orbit",
    videoId: "P9C25Un7xaM",
    emoji: "\u{1F30D}", // earth
    name: "The Blue Marble",
    location: "ISS · Low Earth Orbit",
  },
];
