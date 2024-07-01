"use client";

import LoadingOverlay from "@/components/ui/loadingOverlay";
import DocumentTemplateEditor from "../_components/DocumentTemplateEditor";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DocumentToSend } from "../create/page";
import { DocumentVariable } from "@prisma/client";

const api = {
  async getDocumentTemplate(documentTemplateId: string) {
    const response = await fetch(
      `/api/documents/documentTemplate/${documentTemplateId}`
    );
    return response.json();
  },
  async editDocumentTemplate(
    documentTemplateId: string,
    documentToSend: DocumentToSend
  ) {
    const response = await fetch(
      `/api/documents/documentTemplate/${documentTemplateId}`,
      {
        method: "PUT",
        body: JSON.stringify(documentToSend),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  },
  async deleteDocumentTemplate(documentTemplateId: string) {
    const response = await fetch(
      `/api/documents/documentTemplate/${documentTemplateId}`,
      {
        method: "DELETE",
      }
    );
    return response;
  },
};

const EditDocumentTemplatePage = ({
  params,
}: {
  params: { documentTemplateId: string };
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [document, setDocument] = useState<DocumentToSend>();

  useEffect(() => {
    api
      .getDocumentTemplate(params.documentTemplateId)
      .then(document => {
        let documentToSend: DocumentToSend = {
          title: document.title,
          description: document.description,
          templateBlocks: document.templateBlocks,
          category: document.category,
        };
        setDocument(documentToSend);
      });
  }, [params.documentTemplateId]);

  const onEdit = async (documentToSend: DocumentToSend) => {
    setIsLoading(true);
    try {
      const res = await api.editDocumentTemplate(
        params.documentTemplateId,
        documentToSend
      );

      if (res.ok) {
        await res.json();
        toast.success("Plantilla editada con éxito");
        // console.log("Data received:", data);
        router.push("/admin/documentTemplates");
      } else {
        toast.error("Error al editar la plantilla");
        console.error("Error status:", res.status);
      }
      setIsLoading(false);
    } catch (error) {
      toast.error("Error al editar la plantilla");
      console.error(
        "Error submitting document template:",
        error
      );
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await api.deleteDocumentTemplate(
        params.documentTemplateId
      );
      toast.success("Plantilla eliminada");
      router.push("/admin/documentTemplates");
    } catch {
      toast.error("Error al eliminar la plantilla");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      {isLoading && <LoadingOverlay />}
      {document && (
        <DocumentTemplateEditor
          onEdit={onEdit}
          documentTemplateState={document}
          documentTemplateId={params.documentTemplateId}
          onDelete={onDelete}
        />
      )}
    </>
  );
};

export default EditDocumentTemplatePage;
