import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/shell/TopNav";
import { BrandBar } from "@/components/shell/BrandBar";
import { BoardDataProvider } from "@/components/board/BoardDataContext";
import { boardToMeta, getCurrentBoard, getModuleData } from "@/lib/server/boards";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Animals — Intelligence Board",
  description: "Four-tab client intelligence dashboard by The Animals",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const board = await getCurrentBoard();
  const modules = await getModuleData(board.id);

  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <BoardDataProvider meta={boardToMeta(board)} modules={modules}>
          <TopNav />
          <BrandBar />
          {children}
        </BoardDataProvider>
      </body>
    </html>
  );
}
