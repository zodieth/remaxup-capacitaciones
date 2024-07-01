import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/isAdminCheck";
import { getServerSessionFunc } from "../../auth/_components/getSessionFunction";

export async function GET(
  req: Request,
  { params }: { params: { mlsid: string } }
) {
  try {
    const { userId, role: userRole } =
      await getServerSessionFunc();
    const { mlsid } = params;

    if (!userId || !isAdmin(userRole)) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    const property = await db.property.findUnique({
      where: { mlsid },
    });

    if (!property) {
      return new NextResponse("Not Found", {
        status: 404,
      });
    }

    const propertyWithPhotos = {
      ...property,
      photos: JSON.parse(property.photos),
    };

    return NextResponse.json(propertyWithPhotos);
  } catch (error) {
    console.log("[PROPERTY]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}

// post para crear una propiedad
export async function POST(
  req: Request,
  { params }: { params: { mlsid: string } }
) {
  try {
    const { userId, role: userRole } =
      await getServerSessionFunc();
    const property = await req.json();

    if (!userId || !isAdmin(userRole)) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    const createdProperty = await db.property.create({
      data: {
        mlsid: params.mlsid,
        title: property.title,
        address: property.address,
        isTemporalProperty: property.isTemporalProperty,
        documents: property.documents,
        photos: JSON.stringify(property.photos),
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

    return NextResponse.json(createdProperty);
  } catch (error) {
    console.log("[PROPERTY]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}
