import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectMongo } from "@/lib/db";
import { UserProfileModel } from "@/lib/userProfileModel";
import { PinterestBoardModel } from "@/lib/pinterestBoardModel";
import { PinterestPinModel } from "@/lib/pinterestPinModel";
import { authOptions } from "@/lib/authOptions";
import { getSessionUserId } from "@/lib/sessionUserId";

const PINTEREST_BOARDS_URL = "https://api.pinterest.com/v5/boards";
const PINTEREST_BOARD_PINS_URL = (boardId: string) =>
  `https://api.pinterest.com/v5/boards/${boardId}/pins`;

async function fetchPinterest<T>(
  url: string,
  accessToken: string
): Promise<{ data?: T; ok: boolean; status: number }> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    return { ok: false, status: res.status };
  }
  const data = (await res.json()) as T;
  return { data, ok: true, status: res.status };
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    const profile = await UserProfileModel.findOne({ userId }).lean();
    const accessToken = profile?.pinterestAccessToken as string | undefined;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Pinterest not connected" },
        { status: 400 }
      );
    }

    const boardsToSave: Array<{
      userId: string;
      boardId: string;
      name?: string;
      description?: string;
      pinCount: number;
      thumbnailUrl?: string;
      lastSyncedAt: Date;
    }> = [];
    let bookmark: string | null = null;

    do {
      const url = new URL(PINTEREST_BOARDS_URL);
      url.searchParams.set("page_size", "100");
      if (bookmark) url.searchParams.set("bookmark", bookmark);

      const result = await fetchPinterest<{
        items?: Array<{
          id?: string;
          name?: string;
          description?: string;
          pin_count?: number;
          media?: {
            image_cover_url?: string;
            pin_thumbnail_urls?: string[];
          };
        }>;
        bookmark?: string;
      }>(url.toString(), accessToken);

      if (!result.ok) {
        if (result.status === 401) {
          return NextResponse.json(
            { error: "Pinterest token expired; please reconnect" },
            { status: 401 }
          );
        }
        return NextResponse.json(
          { error: "Failed to fetch boards from Pinterest" },
          { status: 502 }
        );
      }

      const items = result.data?.items ?? [];
      const nextBookmark = (result.data as { bookmark?: string })?.bookmark ?? null;

      for (const b of items) {
        if (!b?.id) continue;
        const coverUrl =
          b.media?.image_cover_url ?? b.media?.pin_thumbnail_urls?.[0];
        boardsToSave.push({
          userId,
          boardId: b.id,
          name: b.name,
          description: b.description,
          pinCount: b.pin_count ?? 0,
          thumbnailUrl: coverUrl,
          lastSyncedAt: new Date(),
        });
      }

      bookmark = nextBookmark ?? null;
    } while (bookmark);

    for (const b of boardsToSave) {
      await PinterestBoardModel.findOneAndUpdate(
        { userId, boardId: b.boardId },
        {
          $set: {
            name: b.name,
            description: b.description,
            pinCount: b.pinCount,
            thumbnailUrl: b.thumbnailUrl,
            lastSyncedAt: b.lastSyncedAt,
          },
        },
        { upsert: true }
      );
    }

    let totalPins = 0;
    for (const b of boardsToSave) {
      let pinBookmark: string | null = null;
      const boardName = b.name ?? "";

      do {
        const pinUrl = new URL(PINTEREST_BOARD_PINS_URL(b.boardId));
        pinUrl.searchParams.set("page_size", "100");
        if (pinBookmark) pinUrl.searchParams.set("bookmark", pinBookmark);

        const pinResult = await fetchPinterest<{
          items?: Array<{
            id?: string;
            board_id?: string;
            title?: string;
            description?: string;
            link?: string;
            media?: {
              images?: Record<
                string,
                { url?: string; width?: number; height?: number }
              >;
            };
          }>;
          bookmark?: string;
        }>(pinUrl.toString(), accessToken);

        if (!pinResult.ok) break;

        const pinItems = pinResult.data?.items ?? [];
        const nextPinBookmark = (pinResult.data as { bookmark?: string })?.bookmark ?? null;

        for (const p of pinItems) {
          if (!p?.id) continue;
          const images = p.media?.images;
          const imageUrl =
            images?.["400x300"]?.url ??
            images?.["600x"]?.url ??
            images?.["1200x"]?.url ??
            (images && Object.values(images)[0]?.url) ??
            "";

          if (!imageUrl) continue;

          await PinterestPinModel.findOneAndUpdate(
            { userId, pinId: p.id },
            {
              $set: {
                boardId: p.board_id ?? b.boardId,
                boardName: boardName,
                imageUrl,
                link: p.link,
                title: p.title,
                description: p.description,
                syncedAt: new Date(),
              },
            },
            { upsert: true }
          );
          totalPins++;
        }

        pinBookmark = nextPinBookmark ?? null;
      } while (pinBookmark);
    }

    return NextResponse.json({
      ok: true,
      boardsCount: boardsToSave.length,
      pinsCount: totalPins,
    });
  } catch (err) {
    console.error("[pinterest/sync]", err);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
