import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const secret = searchParams.get("secret");
    const url = searchParams.get("url") || "/";
    const status = searchParams.get("status");

    if (secret !== process.env.PREVIEW_SECRET || !url) {
        return new Response("Unauthorized or missing target URL", { status: 401 });
    }

    const draft = await draftMode();

    if (status === "draft") {
        draft.enable();
    } else {
        draft.disable();
    }

    return NextResponse.redirect(new URL(url, request.url), 307);
}
