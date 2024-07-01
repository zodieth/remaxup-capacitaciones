import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/isAdminCheck";
import { getServerSessionFunc } from "../../../auth/_components/getSessionFunction";
import { DocumentCategory } from "@prisma/client";

// to get all document templates of category "AUTORIZACIONES"
// when creating a new document, the user can choose a template from this list
export async function GET(req: Request) {
  const { userId, role } = await getServerSessionFunc();

  if (!userId || !isAdmin(role)) {
    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }
  try {
    const documentTemplatesAuthorizations =
      await db.documentTemplate.findMany({
        where: {
          category: DocumentCategory.AUTORIZACIONES,
        },
        include: {
          templateBlocks: {
            include: {
              variables: true, // Incluye las variables de documento asociadas a cada bloque de plantilla
            },
          },
        },
      });

    return NextResponse.json(documentTemplatesAuthorizations);
  } catch (error) {
    console.log("[DOCUMENT TEMPLATE AUTHorizations]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}
