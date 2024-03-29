import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getServerSessionFunc } from "@/app/api/auth/_components/getSessionFunction";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = await getServerSessionFunc();

    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    // Removimos la validación de que el usuario sea el dueño del curso
    // const ownCourse = await db.course.findUnique({
    //   where: {
    //     id: params.courseId,
    //     // userId,
    //   },
    // });

    // if (!ownCourse) {
    //   return new NextResponse("Unauthorized", {
    //     status: 401,
    //   });
    // }

    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
    });

    if (
      !chapter ||
      !chapter.title ||
      !chapter.description ||
      !chapter.videoUrl
    ) {
      return new NextResponse("Missing required fields", {
        status: 400,
      });
    }

    const publishedChapter = await db.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
      data: {
        isPublished: true,
      },
    });

    return NextResponse.json(publishedChapter);
  } catch (error) {
    console.log("[CHAPTER_PUBLISH]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}
