"use client";

import React, { useEffect, useState } from "react";
import TextEditor from "@/components/TextEditor";
import { DocumentFromTemplate } from "@/types/next-auth";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash } from "lucide-react";
import PdfGenerator from "../../[propertyId]/documentFromTemplate/_components/pdf-generator";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const api = {
  async getDocument(documentId: string) {
    const response = await fetch(`/api/documents/${documentId}`);
    return response.json();
  },
  async deleteDocument(documentId: string) {
    const response = await fetch(
      `/api/documents/${documentId}`,
      {
        method: "DELETE",
      }
    );
    return response;
  },
};

const AuthorizationDocumentPage = ({
  params,
}: {
  params: { documentId: string };
}) => {
  const documentId = params.documentId;
  const router = useRouter();

  const [documentFromTemplate, setDocumentFromTemplate] =
    useState<DocumentFromTemplate>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.getDocument(documentId).then(document => {
      setDocumentFromTemplate(document);
    });

    setIsLoading(false);
  }, [documentId]);

  const onDelete = async (documentId: string) => {
    setIsLoading(true);
    try {
      await api.deleteDocument(documentId);
      toast.success("Documento eliminado");
      router.push(`/documentos`);
    } catch (error) {
      toast.error("Error al eliminar el documento");
    }
    setIsLoading(false);
  };

  return (
    <div className="m-4">
      <Link href={`/documentos`}>
        <Button size="sm">
          <ArrowLeft />
          Volver a Documentos
        </Button>
      </Link>

      <div className="flex justify-between pr-10">
        <div>
          <h2 className=" text-2xl m-5">
            Documento de Autorización
          </h2>
          <h1 className="font-bold text-2xl m-5">
            {documentFromTemplate?.title || "Sin título"}
          </h1>
        </div>
        <ConfirmModal onConfirm={() => onDelete(documentId)}>
          <Button size="sm" disabled={isLoading}>
            <Trash className="h-4 w-4" />
          </Button>
        </ConfirmModal>
      </div>

      <div>
        <div>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div>
              <div className="flex justify-end mr-7">
                <PdfGenerator
                  content={documentFromTemplate?.content || ""}
                  title={documentFromTemplate?.title}
                />
              </div>
              <TextEditor
                content={documentFromTemplate?.content}
                documentVariables={[]}
                updateDocumentContent={() => {
                  console.log("updateDocumentContent");
                }}
                hideControls={true}
                disableEditing={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorizationDocumentPage;
