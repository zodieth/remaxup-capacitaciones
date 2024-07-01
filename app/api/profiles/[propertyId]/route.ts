import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/isAdminCheck";
import { getServerSessionFunc } from "../../auth/_components/getSessionFunction";

// get de profiles por propertyId
export async function GET(
  req: Request,
  { params }: { params: { propertyId: string } }
) {
  try {
    const { userId, role } = await getServerSessionFunc();

    if (!userId || !isAdmin(role)) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    const profiles = await db.profile.findMany({
      where: {
        propertyId: params.propertyId as string,
      },
      include: {
        variables: {
          include: {
            documentVariable: true,
          },
        },
      },
    });

    return NextResponse.json(profiles);
  } catch (error) {
    console.log("[PROFILES]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}
