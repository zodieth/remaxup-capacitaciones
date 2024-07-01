// app/api/documents/fromTemplate/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/isAdminCheck";
import { getServerSessionFunc } from "../../auth/_components/getSessionFunction";

export async function POST(req: Request) {
  const { userId, role } = await getServerSessionFunc();

  if (!userId || !isAdmin(role)) {
    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }

  const { template, blocks, propertyId } = await req.json();

  function replaceVariablesInContent(
    content: string,
    variables: { variable: string; value: string }[]
  ): string {
    let updatedContent = content;

    variables.forEach(({ variable, value }) => {
      const variableRegex = new RegExp(
        escapeRegExp(variable),
        "g"
      );
      updatedContent = updatedContent.replace(
        variableRegex,
        value
      );
    });

    return updatedContent;
  }

  function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Concatenar el contenido de todos los bloques
  const finalContent = blocks.reduce(
    (
      acc: string,
      block: {
        content: string;
        variables: { variable: string; value: string }[];
      }
    ) => {
      const contentWithVariablesReplaced =
        replaceVariablesInContent(
          block.content,
          block.variables
        );
      return acc + contentWithVariablesReplaced;
    },
    ""
  );

  console.log("finalContent", finalContent);

  const document = await db.document.create({
    data: {
      title: template.title,
      content: finalContent,
      description: template.description,
      category: template.category,
      propertyId: propertyId,
      createdBy: userId,
    },
  });

  return NextResponse.json({ document });
}
