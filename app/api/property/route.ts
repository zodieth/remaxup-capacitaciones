import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/isAdminCheck";
import { getServerSessionFunc } from "../auth/_components/getSessionFunction";
import { PropertyCreateDTO } from "@/types/next-auth";

export async function POST(req: Request) {
  // post para un array de propiedades -> Property de shcema.prisma
  try {
    const { userId, role: userRole } =
      await getServerSessionFunc();
    const properties = await req.json();

    if (!userId || !isAdmin(userRole)) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    // get only 5 photos
    const photos = properties
      .map((property: PropertyCreateDTO) =>
        property.photos.slice(0, 4)
      )
      .flat();

    // Recorre las propiedades para upsert
    for (const property of properties) {
      const createdProperty = await db.property.upsert({
        where: { mlsid: property.mlsid }, // Identifica por mlsid
        update: {
          title: property.title,
          address: property.address,
          documents: property.documents,
          photos: JSON.stringify(photos),
          updatedAt: new Date(),
        },
        create: {
          mlsid: property.mlsid,
          title: property.title,
          address: property.address,
          photos: JSON.stringify(photos),
          updatedAt: new Date(),
        },
      });

      const existingProfile = await db.profile.findFirst({
        where: {
          name: "propiedad",
          propertyId: createdProperty.mlsid,
        },
      });

      if (!existingProfile) {
        const createdProfile = await db.profile.create({
          data: {
            name: "propiedad",
            propertyId: createdProperty.mlsid,
          },
        });
      }
    }

    return NextResponse.json(properties);
  } catch (error) {
    console.log("[PROPERTY]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}

export async function GET(req: Request) {
  try {
    const { userId, role: userRole } =
      await getServerSessionFunc();

    if (!userId || !isAdmin(userRole)) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    const properties = await db.property.findMany();

    const propertiesWithPhotos = properties.map(property => {
      return {
        ...property,
        photos: JSON.parse(property.photos),
      };
    });

    return NextResponse.json(propertiesWithPhotos);
  } catch (error) {
    console.log("[PROPERTY]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}
