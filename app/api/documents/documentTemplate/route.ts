// create new DocumentTemplate

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/isAdminCheck";
import { getServerSessionFunc } from "../../auth/_components/getSessionFunction";

export async function POST(req: Request) {
  try {
    const { userId, role } = await getServerSessionFunc();
    const { title, description, category, templateBlocks } =
      await req.json();

    if (!userId || !isAdmin(role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Crear la plantilla de documento principal sin bloques
    const documentTemplate = await db.documentTemplate.create({
      data: {
        title,
        description,
        category,
      },
    });

    // Crear los bloques de plantilla y asociar las variables correspondientes
    for (const block of templateBlocks) {
      const {
        content,
        variablesIds,
        index,
        isDuplicable,
        containsProfile,
        canBeDeleted,
      } = block;

      await db.templateBlock.create({
        data: {
          content,
          index,
          isDuplicable,
          containsProfile,
          canBeDeleted,
          documentTemplateId: documentTemplate.id,
          variables: {
            connect:
              variablesIds.length > 0
                ? variablesIds.map((id: string) => ({ id }))
                : [],
          },
        },
      });
    }

    return NextResponse.json({
      documentTemplate,
      templateBlocks,
    });
  } catch (error) {
    console.log("[DOCUMENT TEMPLATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const documentTemplates = await db.documentTemplate.findMany(
      {
        include: {
          templateBlocks: {
            include: {
              variables: true, // Incluye las variables de documento asociadas a cada bloque de plantilla
            },
          },
        },
      }
    );

    return NextResponse.json(documentTemplates);
  } catch (error) {
    console.log("[DOCUMENT TEMPLATE]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}
