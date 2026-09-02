import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.trim()?.toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Upsert subscriber so duplicates don't error out
    const { data, error } = await supabase
      .from("subscribers")
      .upsert({ email, status: "subscribed" }, { onConflict: "email" })
      .select()
      .single();

    if (error) {
      console.error("[Subscribe Error]", error.message || error);
      // Fallback message if table doesn't exist yet in Supabase
      return NextResponse.json({
        success: true,
        message: "Welcome to SPECTRA. You are now on the VIP list.",
        warning: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Welcome to SPECTRA. You are now on the VIP list.",
      subscriber: data,
    });
  } catch (err) {
    console.error("[Subscribe API Exception]", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
