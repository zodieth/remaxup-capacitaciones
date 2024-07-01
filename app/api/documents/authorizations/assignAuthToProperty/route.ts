import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/isAdminCheck";
import { getServerSessionFunc } from "@/app/api/auth/_components/getSessionFunction";

export async function POST(req: Request) {
  try {
    const { userId, role } = await getServerSessionFunc();
    const { authId, propertyId } = await req.json();

    if (!userId || !isAdmin(role)) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    // Comments para saber que hace cada paso
    await db.$transaction(async prisma => {
      // Buscar el documento por authId y obtener el oldPropertyId
      const documentToUpdate = await prisma.document.findUnique({
        where: { id: authId },
        select: { propertyId: true }, // Solo necesitamos el oldPropertyId
      });

      if (!documentToUpdate?.propertyId) {
        throw new Error("Document not found");
      }

      const oldPropertyId = documentToUpdate.propertyId;

      // Actualizar el document para apuntar al newPropertyId
      await prisma.document.update({
        where: { id: authId },
        data: { propertyId: propertyId },
      });

      // Buscar y eliminar el perfil llamado "propiedad" asociado al newPropertyId
      await prisma.profile.deleteMany({
        where: {
          propertyId: propertyId,
          name: "propiedad",
        },
      });

      // Actualizar todos los perfiles que tenían oldPropertyId para que ahora apunten a newPropertyId
      await prisma.profile.updateMany({
        where: { propertyId: oldPropertyId },
        data: { propertyId: propertyId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AUTH ASSIGN TO PROPERTY]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}
