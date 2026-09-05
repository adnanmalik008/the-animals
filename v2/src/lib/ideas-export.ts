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

const INK = "000000";
const GRAPHITE = "4D4D4D";
const SILVER = "D5D7DA";
const FONT = "Calibri";

export interface IdeasExportInput {
  meta: BoardMeta;
  ideas: FusedIdea[];
  circles: TopicCircle[];
  insights: InsightItem[];
  /** how the list was narrowed at export time, shown under the title */
  filterLabel?: string;
}

function safeFilename(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "board";
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function buildIdeasDocx({ meta, ideas, circles, insights, filterLabel }: IdeasExportInput) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } =
    await import("docx");

  const circleById = new Map(circles.map((c) => [c.id, c]));
  const insightById = new Map(insights.map((i) => [i.id, i]));

  const run = (text: string, opts: Omit<IRunOptions, "text"> = {}) =>
    new TextRun({ text, font: FONT, color: INK, ...opts });

  const rule = () =>
    new Paragraph({
      spacing: { before: 120, after: 240 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: SILVER, space: 1 } },
      children: [],
    });

  const children: InstanceType<typeof Paragraph>[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 80 },
      children: [run("Ideas", { size: 52, bold: true })],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [run(meta.clientName, { size: 26, bold: true, color: "FF4500" })],
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

  children.push(
    rule(),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [run(`The Animals · ${meta.clientName} board · Anomalies`, { size: 18, color: GRAPHITE })],
    })
  );

  const doc = new Document({
    creator: "The Animals",
    title: `Ideas — ${meta.clientName}`,
    styles: {
      default: { document: { run: { font: FONT, size: 22, color: INK } } },
    },
    sections: [
      {
        properties: { page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } } },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `ideas-${safeFilename(meta.clientName)}-${new Date().toISOString().slice(0, 10)}.docx`;
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
