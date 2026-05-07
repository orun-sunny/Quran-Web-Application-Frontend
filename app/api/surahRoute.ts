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
      const index = await readJson(path.join(chaptersDir, "index.json"));
      return NextResponse.json(index);
    }

    const id = Number(idParam);
    if (!Number.isInteger(id) || id < 1 || id > 114) {
      return NextResponse.json({ error: "Invalid chapter id" }, { status: 400 });
    }

    const chapter = await readJson(path.join(chaptersDir, `${id}.json`));
    return NextResponse.json(chapter);
  } catch (error) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }
}
