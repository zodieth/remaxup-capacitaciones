import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/isAdminCheck";
import { getServerSessionFunc } from "../auth/_components/getSessionFunction";

// create profile
export async function POST(req: Request) {
  try {
    const { userId, role: userRole } =
      await getServerSessionFunc();
    const { name, profileCategory, propertyId } =
      await req.json();

    if (!userId || !isAdmin(userRole)) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    const profile = await db.profile.create({
      data: {
        name,
        category: profileCategory,
        property: {
          connect: {
            mlsid: propertyId,
          },
        },
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.log("[PROFILE]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}
