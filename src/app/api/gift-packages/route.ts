import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_GIFT_PACKAGES, GiftPackage } from "@/lib/giftPackages";
import { isSessionAuthenticated } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get("all") === "true";

    // Read from settings table key 'gift_packages'
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "gift_packages")
      .maybeSingle();

    let packages: GiftPackage[] = DEFAULT_GIFT_PACKAGES;

    if (data?.value) {
      try {
        const parsed = JSON.parse(data.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          packages = parsed;
        }
      } catch (err) {
        console.error("Error parsing gift_packages from settings:", err);
      }
    } else {
      // Initialize with defaults in background
      try {
        await supabase
          .from("settings")
          .upsert({ key: "gift_packages", value: JSON.stringify(DEFAULT_GIFT_PACKAGES) });
      } catch {}
    }

    // If client request, filter for only active packages
    if (!showAll) {
      packages = packages.filter((pkg) => pkg.is_active);
    }

    return NextResponse.json({ success: true, packages });
  } catch (error) {
    console.error("[Gift Packages GET Error]", error);
    return NextResponse.json({ success: true, packages: DEFAULT_GIFT_PACKAGES });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAuth = await isSessionAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { packages } = body;

    if (!Array.isArray(packages)) {
      return NextResponse.json({ error: "Invalid packages array" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("settings")
      .upsert({ key: "gift_packages", value: JSON.stringify(packages) }, { onConflict: "key" });

    if (error) {
      console.error("[Gift Packages Save DB Error]", error);
      return NextResponse.json({ error: "Failed to save packages to database" }, { status: 500 });
    }

    return NextResponse.json({ success: true, packages });
  } catch (error) {
    console.error("[Gift Packages POST Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
