import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://api.quran.com/api/v4/juzs", {
      next: { revalidate: 86400 },
    });
    const data = await response.json();

    const uniqueJuzs: any[] = [];
    const seen = new Set<number>();
    if (data.juzs) {
      for (const j of data.juzs) {
        if (!seen.has(j.juz_number)) {
          seen.add(j.juz_number);
          uniqueJuzs.push(j);
        }
      }
    }

    return NextResponse.json({ juzs: uniqueJuzs });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch juz list" },
      { status: 500 },
    );
  }
}
