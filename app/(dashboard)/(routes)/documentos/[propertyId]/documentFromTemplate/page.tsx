import React from "react";
import { CreateDocumentFromTemplate } from "@/components/createDocumentFromTemplate";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CreateDocumentFromTemplatePage = ({
  params,
}: {
  params: { propertyId: string };
}) => {
  const propertyId = params.propertyId;

  return (
    <div className="m-4">
      <Link href={`/documentos/${propertyId}`}>
        <Button size="sm">
          <ArrowLeft />
          Volver a propiedad
        </Button>
      </Link>
      <CreateDocumentFromTemplate propertyId={propertyId} />
    </div>
  );
};
export default CreateDocumentFromTemplatePage;
