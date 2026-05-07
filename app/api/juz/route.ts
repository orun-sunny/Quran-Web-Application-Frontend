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

  console.log(idParam);

  try {
    if (!idParam) {
      return NextResponse.json({ error: "Missing juz id" }, { status: 400 });
    }

    const juzId = Number(idParam);
    if (!Number.isInteger(juzId) || juzId < 1 || juzId > 30) {
      return NextResponse.json({ error: "Invalid juz id" }, { status: 400 });
    }

    // Fetch official Juz mapping from quran.com
    const res = await fetch(`https://api.quran.com/api/v4/juzs`);
    const juzData = await res.json();
    const currentJuz = juzData.juzs.find((j: any) => j.juz_number === juzId);

    if (!currentJuz) {
      return NextResponse.json({ error: "Juz not found in metadata" }, { status: 404 });
    }

    const indexJson = await readJson<any[]>(path.join(chaptersDir, "index.json"));
    let allVerses: any[] = [];

    // verse_mapping is like: { "1": "1-7", "2": "1-141" }
    for (const [surahIdStr, verseRange] of Object.entries(currentJuz.verse_mapping)) {
      const surahId = parseInt(surahIdStr);
      const [startVerse, endVerse] = (verseRange as string).split("-").map(Number);
      
      const surahData = await readJson<any>(path.join(chaptersDir, `${surahId}.json`));
      const surahInfo = indexJson.find(s => s.id === surahId);
      
      // Filter verses in range
      const versesInRange = surahData.verses
        .filter((v: any) => v.id >= startVerse && v.id <= endVerse)
        .map((v: any) => ({
          ...v,
          surah_id: surahId,
          surah_name: surahInfo?.name || surahData.name,
          surah_transliteration: surahInfo?.transliteration || surahData.transliteration,
        }));
        
      allVerses = allVerses.concat(versesInRange);
    }

    const firstSurahId = parseInt(Object.keys(currentJuz.verse_mapping)[0]);
    const firstSurahInfo = indexJson.find(s => s.id === firstSurahId);

    const feedData = {
      id: `juz-${juzId}`,
      type: "juz",
      title: `Juz ${juzId}`,
      subtitle: `${firstSurahInfo?.transliteration} & More`,
      verses: allVerses
    };

    return NextResponse.json(feedData);
  } catch (error) {
    console.error("Juz fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch Juz" }, { status: 500 });
  }
}
