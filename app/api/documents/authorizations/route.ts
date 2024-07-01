import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/isAdminCheck";
import { getServerSessionFunc } from "../../auth/_components/getSessionFunction";
import { DocumentCategory } from "@prisma/client";

export async function GET(req: Request) {
  const { userId, role } = await getServerSessionFunc();

  if (!userId || !isAdmin(role)) {
    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }
  try {
    const authorizationDocuments = await db.document.findMany({
      where: {
        createdBy: userId,
        category: DocumentCategory.AUTORIZACIONES,
        OR: [
          { propertyId: null },
          {
            propertyId: {
              startsWith: "auth-",
            },
          },
        ],
      },
    });

    return NextResponse.json(authorizationDocuments);
  } catch (error) {
    console.log("[AUTHORIZATION DOCUMENT ]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}
