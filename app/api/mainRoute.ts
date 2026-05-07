import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const chaptersDir = path.join(process.cwd(), "data", "surahs");

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");

  try {
    if (!idParam) {
      return NextResponse.json({ error: "Missing page id" }, { status: 400 });
    }

    const pageId = Number(idParam);
    if (!Number.isInteger(pageId) || pageId < 1 || pageId > 604) {
      return NextResponse.json({ error: "Invalid page id" }, { status: 400 });
    }

    const res = await fetch(`https://api.quran.com/api/v4/verses/by_page/${pageId}`);
    const pageData = await res.json();

    if (!pageData.verses || pageData.verses.length === 0) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const indexJson = await readJson<any[]>(path.join(chaptersDir, "index.json"));
    const surahGroups: Record<number, number[]> = {};

    for (const v of pageData.verses) {
      const [surahId, verseId] = v.verse_key.split(":").map(Number);
      if (!surahGroups[surahId]) surahGroups[surahId] = [];
      surahGroups[surahId].push(verseId);
    }

    let allVerses: any[] = [];
    let firstSurahInfo: any = null;

    for (const [surahIdStr, verseIds] of Object.entries(surahGroups)) {
      const surahId = parseInt(surahIdStr, 10);
      const surahData = await readJson<any>(path.join(chaptersDir, `${surahId}.json`));
      const surahInfo = indexJson.find((s) => s.id === surahId);

      if (!firstSurahInfo) firstSurahInfo = surahInfo;

      const minVerse = Math.min(...verseIds);
      const maxVerse = Math.max(...verseIds);

      const versesInRange = surahData.verses
        .filter((v: any) => v.id >= minVerse && v.id <= maxVerse)
        .map((v: any) => ({
          ...v,
          surah_id: surahId,
          surah_name: surahInfo?.name || surahData.name,
          surah_transliteration:
            surahInfo?.transliteration || surahData.transliteration,
        }));

      allVerses = allVerses.concat(versesInRange);
    }

    return NextResponse.json({
      id: `page-${pageId}`,
      type: "page",
      title: `Page ${pageId}`,
      subtitle: `${firstSurahInfo?.transliteration || ""} & More`,
      verses: allVerses,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch Page" }, { status: 500 });
  }
}
