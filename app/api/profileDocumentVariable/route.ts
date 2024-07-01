import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/isAdminCheck";
import { getServerSessionFunc } from "../auth/_components/getSessionFunction";

// create profile Document Variable
export async function POST(req: Request) {
  try {
    const { userId, role: userRole } =
      await getServerSessionFunc();
    const { profileId, documentVariableId, value } =
      await req.json();

    if (!userId || !isAdmin(userRole)) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    const profileDocumentVariable =
      await db.profileDocumentVariable.upsert({
        where: {
          profileId_documentVariableId: {
            profileId: profileId,
            documentVariableId: documentVariableId,
          },
        },
        update: {
          value: value,
        },
        create: {
          profileId: profileId,
          documentVariableId: documentVariableId,
          value: value,
        },
      });

    return NextResponse.json(profileDocumentVariable);
  } catch (error) {
    console.log("[PROFILE DOCUMENT VARIABLE UPSERT]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}
