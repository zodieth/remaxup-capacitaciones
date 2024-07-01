"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { DocumentVariable } from "@/types/next-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingOverlay from "@/components/ui/loadingOverlay";
import { DocumentToSend } from "../create/page";
import Link from "next/link";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Trash } from "lucide-react";
import { DocumentCategory, TemplateBlock } from "@prisma/client";
import MultiTextEditor, {
  Editor,
} from "@/components/MultiTextEditor";

type DocumentToManage = {
  title: string;
  description?: string;
  templateBlocks: TemplateBlockWithVariables[];
  category: DocumentCategory;
};

export type TemplateBlockWithVariables = TemplateBlock & {
  variablesIds: string[];
};

const api = {
  async getDocumentVariables(): Promise<DocumentVariable[]> {
    const response = await fetch("/api/documentVariable");
    return response.json();
  },
};

const formSchema = z.object({
  title: z.string().min(1, "Ingrese un título"),
  description: z.string().optional(),
});

const DocumentTemplateEditor = ({
  onCreate,
  onEdit,
  onDelete,
  documentTemplateId,
  documentTemplateState,
}: {
  onCreate?: (documentToSend: DocumentToSend) => void;
  onEdit?: (documentToSend: DocumentToSend) => void;
  onDelete?: (documentTemplateId: string) => void;
  documentTemplateId?: string;
  documentTemplateState?: DocumentToSend;
}) => {
  const [documentVariables, setDocumentVariables] = useState<
    DocumentVariable[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const [document, setDocument] = useState<DocumentToManage>(
    () => {
      const sortedBlocks = (
        documentTemplateState?.templateBlocks || []
      ).sort((a, b) => a.index - b.index);
      return {
        title: documentTemplateState?.title || "",
        templateBlocks: sortedBlocks.map(block => ({
          ...block,
          variablesIds: [],
        })),
        description: documentTemplateState?.description || "",
        category: documentTemplateState?.category || "OTROS",
      };
    }
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: documentTemplateState
      ? {
          title: documentTemplateState.title,
          description: documentTemplateState.description,
          category: documentTemplateState.category,
        }
      : {
          title: "",
          description: "",
          category: "OTROS",
        },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  const description = watch("description");
  const title = watch("title");

  useEffect(() => {
    setDocument(prev => ({
      ...prev,
      title: title,
      description: description,
    }));
  }, [title, description]);

  useEffect(() => {
    api.getDocumentVariables().then(variables => {
      setDocumentVariables(variables);
    });
  }, []);

  const onSubmit = async (
    values: z.infer<typeof formSchema>
  ) => {
    setIsLoading(true);
    // Procesar los bloques para extraer las variables
    const updatedBlocks = document.templateBlocks.map(block => {
      const variablesExtractedFromBlock =
        block.content.match(/{([^}]+)}/g);

      const variablesUsedIds = documentVariables
        .filter(variable =>
          variablesExtractedFromBlock?.includes(
            `{${variable.name}}`
          )
        )
        .map(variable => variable.id);

      return {
        ...block,
        variablesIds: variablesUsedIds,
      };
    });

    const documentToSend = {
      ...document,
      templateBlocks: updatedBlocks,
    };

    if (onCreate && !documentTemplateState) {
      onCreate(documentToSend);
    }

    if (onEdit && documentTemplateState) {
      onEdit(documentToSend);
    }

    setIsLoading(false);
  };

  const updateDocumentContent = (editors: Editor[]) => {
    setDocument((prev: any) => {
      const updatedDocument = {
        ...prev,
        templateBlocks: editors.map(editor => ({
          id: editor.id,
          index: editor.index,
          content: editor.content,
          isDuplicable: editor.isDuplicable,
          containsProfile: editor.containsProfile,
          canBeDeleted: editor.canBeDeleted,
          // variablesIds: [],
        })),
      };
      return updatedDocument;
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDocument(prev => ({
      ...prev,
      category: e.target.value as DocumentCategory,
    }));
  };

  return (
    <div className="p-6">
      {isLoading && <LoadingOverlay />}
      <div className="flex justify-between items-center">
        {onCreate ? (
          <h1>Crear Plantilla</h1>
        ) : (
          <h1>Editar Plantilla</h1>
        )}
      </div>
      <div className="mt-10 w-[100%] border border-gray-300 rounded-lg p-6 ">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex justify-between items-center mt-5 mb-5">
              <Link href="/admin/documentTemplates">
                <Button>Volver a Plantillas</Button>
              </Link>

              <div className="flex items-center">
                <Button type="submit" className="m-2">
                  {onCreate
                    ? "Crear plantilla"
                    : "Actualizar plantilla"}
                </Button>
                {!onCreate &&
                  documentTemplateId !== undefined &&
                  onDelete && (
                    <ConfirmModal
                      onConfirm={() =>
                        onDelete(documentTemplateId)
                      }
                    >
                      <Button size="sm" disabled={isLoading}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </ConfirmModal>
                  )}
              </div>
            </div>
            <FormItem>
              <FormLabel>Titulo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Titulo de la plantilla"
                  {...register("title")}
                />
              </FormControl>
              {errors.title && (
                <FormMessage>{errors.title.message}</FormMessage>
              )}
            </FormItem>

            <FormItem className="mt-2">
              <FormLabel>Categoría: </FormLabel>
              <FormControl>
                <select
                  id="category"
                  {...register("category", {
                    onChange: handleInputChange,
                  })}
                  value={document.category}
                  className="input border w-fit py-2 px-1 rounded-md"
                >
                  <option value="OTROS">OTROS</option>
                  <option value="AUTORIZACIONES">
                    AUTORIZACIONES
                  </option>
                  <option value="CONTRATOS">CONTRATOS</option>
                  <option value="INFORMES">INFORMES</option>
                </select>
              </FormControl>
              {errors.description && (
                <FormMessage>
                  {errors.description.message}
                </FormMessage>
              )}
            </FormItem>

            <FormItem className="mt-2">
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Descripción acerca de la plantilla"
                  {...register("description")}
                />
              </FormControl>
              {errors.description && (
                <FormMessage>
                  {errors.description.message}
                </FormMessage>
              )}
            </FormItem>
          </form>
        </Form>

        <MultiTextEditor
          updateDocumentContent={updateDocumentContent}
          initialContent={document.templateBlocks.map(block => ({
            id: block.id,
            index: block.index,
            isDuplicable: block.isDuplicable,
            containsProfile: block.containsProfile,
            canBeDeleted: block.canBeDeleted,
            content: block.content,
          }))}
          documentVariables={documentVariables}
        />
      </div>
    </div>
  );
};

export default DocumentTemplateEditor;
