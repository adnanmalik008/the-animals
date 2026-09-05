import type { BoardMeta } from "@/data/board";
import type { IRunOptions } from "docx";
import type { FusedIdea, InsightItem, TopicCircle } from "./insights";

/* Ideas panel → Word document. Built in the browser on demand; the docx
   library is loaded only when someone actually clicks Export. */

const CIRCLE_HEX: Record<TopicCircle["color"], string> = {
  orange: "FF4500",
  yellow: "FABD05",
  blue: "258CED",
  green: "00B67A",
  red: "D92D20",
  purple: "988BAC",
};

const ORANGE = "FF4500";
const INK = "000000";
const GRAPHITE = "4D4D4D";
const SILVER = "D5D7DA";
const FONT = "Calibri";

/* A4 (11906 twips) minus the 1134-twip margins either side */
const TEXT_WIDTH = 9638;
const LOGO_HEIGHT = 26; // px — the nav's 36px wordmark scaled for a page header

const ANIMALS_LOGO = "/assets/logo/animals-logo.png";
const ADIDAS_LOGO = "/assets/brand-bar/adidas-logo.png";

export interface IdeasExportInput {
  meta: BoardMeta;
  ideas: FusedIdea[];
  circles: TopicCircle[];
  insights: InsightItem[];
  /** how the list was narrowed at export time, shown under the title */
  filterLabel?: string;
}

interface Png {
  data: ArrayBuffer;
  width: number;
  height: number;
}

/* Fetch a PNG and measure it. Resolves null on any failure so the export
   still goes out — the header falls back to text instead of throwing. */
async function loadPng(url: string): Promise<Png | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    const { width, height } = bitmap;
    bitmap.close();
    return { data: await blob.arrayBuffer(), width, height };
  } catch {
    return null;
  }
}

function safeFilename(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "board";
}

/** YYYY-MM-DD in the viewer's own timezone, matching the "exported" line */
function localIsoDate() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function buildIdeasDocx({ meta, ideas, circles, insights, filterLabel }: IdeasExportInput) {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    ImageRun,
    Header,
    Footer,
    Table,
    TableRow,
    TableCell,
    Tab,
    HeadingLevel,
    AlignmentType,
    BorderStyle,
    WidthType,
    VerticalAlignTable,
    TabStopType,
    PageNumber,
  } = await import("docx");

  /* the BrandBar shows the adidas PNG for adidas and a lowercase wordmark
     for everyone else; the header mirrors that */
  const isAdidas = meta.clientName.toLowerCase() === "adidas";
  const [animalsPng, clientPng] = await Promise.all([
    loadPng(ANIMALS_LOGO),
    isAdidas ? loadPng(ADIDAS_LOGO) : Promise.resolve(null),
  ]);

  const circleById = new Map(circles.map((c) => [c.id, c]));
  const insightById = new Map(insights.map((i) => [i.id, i]));

  const run = (text: string, opts: Omit<IRunOptions, "text"> = {}) =>
    new TextRun({ text, font: FONT, color: INK, ...opts });

  const rule = () =>
    new Paragraph({
      spacing: { before: 120, after: 240 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ORANGE, space: 1 } },
      children: [],
    });

  /* logo at a fixed height, width from the PNG's own aspect so it never
     stretches; the id is passed because docx restarts its counter per image */
  const logo = (png: Png, name: string, id: number) =>
    new ImageRun({
      type: "png",
      data: png.data,
      transformation: { width: Math.round((png.width / png.height) * LOGO_HEIGHT), height: LOGO_HEIGHT },
      altText: { name, description: name, title: name, id: String(id) },
    });
  const wordmark = (text: string) => run(text, { size: 22, bold: true });

  const animalsMark = animalsPng ? logo(animalsPng, "The Animals", 1) : wordmark("The Animals");
  const clientMark = clientPng ? logo(clientPng, meta.clientName, 2) : wordmark(meta.clientName.toLowerCase());

  const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const half = TEXT_WIDTH / 2;
  const headerCell = (mark: typeof animalsMark, alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]) =>
    new TableCell({
      width: { size: half, type: WidthType.DXA },
      verticalAlign: VerticalAlignTable.CENTER,
      children: [new Paragraph({ alignment, children: [mark] })],
    });

  const header = new Header({
    children: [
      new Table({
        width: { size: TEXT_WIDTH, type: WidthType.DXA },
        columnWidths: [half, half],
        borders: { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none },
        margins: { marginUnitType: WidthType.DXA, top: 0, bottom: 0, left: 0, right: 0 },
        rows: [new TableRow({ children: [headerCell(animalsMark), headerCell(clientMark, AlignmentType.RIGHT)] })],
      }),
      /* brand rule under the chrome, like the nav's bottom edge */
      new Paragraph({
        spacing: { before: 80, after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ORANGE, space: 1 } },
        children: [],
      }),
    ],
  });

  const footer = new Footer({
    children: [
      new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: TEXT_WIDTH }],
        /* one run per piece: LibreOffice drops a run's formatting after a
           page field, so the field and the text around it stay separate */
        children: [
          run("The Animals · theanimals.live", { size: 16, color: GRAPHITE }),
          new TextRun({ font: FONT, size: 16, color: GRAPHITE, children: [new Tab(), "Page "] }),
          new TextRun({ font: FONT, size: 16, color: GRAPHITE, children: [PageNumber.CURRENT] }),
          new TextRun({ font: FONT, size: 16, color: GRAPHITE, children: [" of "] }),
          new TextRun({ font: FONT, size: 16, color: GRAPHITE, children: [PageNumber.TOTAL_PAGES] }),
        ],
      }),
    ],
  });

  const children: InstanceType<typeof Paragraph>[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 40 },
      children: [run("Ideas", { size: 52, bold: true })],
    }),
    new Paragraph({
      spacing: { after: 160 },
      children: [
        run("Client Intelligence Board · Anomalies", { size: 18, color: GRAPHITE, allCaps: true, characterSpacing: 20 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [run(meta.clientName, { size: 26, bold: true, color: ORANGE })],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [run(meta.briefQuestion, { size: 22, italics: true, color: GRAPHITE })],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [
        run(
          `${ideas.length} ${ideas.length === 1 ? "idea" : "ideas"} · exported ${formatDate(Date.now())}${
            filterLabel ? ` · ${filterLabel}` : ""
          }`,
          { size: 20, color: GRAPHITE }
        ),
      ],
    }),
    rule(),
  ];

  if (ideas.length === 0) {
    children.push(
      new Paragraph({ children: [run("No ideas yet. Fuse two insights on the Anomalies board to create one.", { color: GRAPHITE })] })
    );
  }

  ideas.forEach((idea, index) => {
    /* circle pair, each name in its circle's colour */
    const pairRuns = idea.circleIds.flatMap((cid, i) => {
      const c = circleById.get(cid);
      const name = c?.name ?? "Removed";
      const color = c ? CIRCLE_HEX[c.color] : GRAPHITE;
      const runs = [run(name, { bold: true, size: 20, color })];
      if (i > 0) runs.unshift(run("  /  ", { size: 20, color: SILVER }));
      return runs;
    });

    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: index === 0 ? 0 : 360, after: 60 },
        children: [
          run(`${index + 1}. `, { size: 28, bold: true, color: CIRCLE_HEX[idea.colorTag ?? "orange"] }),
          run(idea.text, { size: 28, bold: true }),
        ],
      }),
      new Paragraph({ spacing: { after: 120 }, children: pairRuns })
    );

    if (idea.note) {
      children.push(
        new Paragraph({
          spacing: { after: 160 },
          indent: { left: 360 },
          children: [run(idea.note, { size: 22, color: GRAPHITE })],
        })
      );
    }

    /* the two insights this idea fused from */
    const fused = idea.itemIds.map((id) => insightById.get(id)).filter(Boolean) as InsightItem[];
    if (fused.length > 0) {
      children.push(
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [run("Fused from", { size: 18, bold: true, color: GRAPHITE, allCaps: true })],
        })
      );
      for (const item of fused) {
        const c = circleById.get(item.circleId);
        const label = [c?.name, item.source, item.category].filter(Boolean).join(" · ");
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [
              run(item.headline, { size: 21 }),
              ...(label ? [run(`  — ${label}`, { size: 19, color: GRAPHITE })] : []),
            ],
          })
        );
      }
    }

    children.push(
      new Paragraph({
        spacing: { before: 80 },
        children: [run(`Saved ${formatDate(idea.createdAt)}`, { size: 18, color: GRAPHITE })],
      })
    );
  });

  const doc = new Document({
    creator: "The Animals",
    title: `Ideas — ${meta.clientName}`,
    description: "Ideas exported from The Animals Anomalies board",
    styles: {
      default: { document: { run: { font: FONT, size: 22, color: INK } } },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1134, header: 567, footer: 567 } },
        },
        headers: { default: header },
        footers: { default: footer },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `ideas-${safeFilename(meta.clientName)}-${localIsoDate()}.docx`;
  return { blob, filename };
}

/** Build the document and hand it to the browser as a download. */
export async function downloadIdeasDocx(input: IdeasExportInput) {
  const { blob, filename } = await buildIdeasDocx(input);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
