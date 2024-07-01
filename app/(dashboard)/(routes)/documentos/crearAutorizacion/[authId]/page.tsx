"use client";

import React, { useEffect, useState } from "react";
import { CreateDocumentFromTemplate } from "@/components/createDocumentFromTemplate";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyCreateDTO } from "@/types/next-auth";
import LoadingOverlay from "@/components/ui/loadingOverlay";

const api = {
  postPropertie: async (
    propertie: PropertyCreateDTO,
    mlsid: string
  ): Promise<any> => {
    const response = await fetch(`/api/property/${mlsid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(propertie),
    });

    return response.json();
  },
};

const CreateAuthorizationDocumentFromTemplate = ({
  params,
}: {
  params: { authId: string };
}) => {
  const [temporalProperty, setTemporalProperty] =
    useState<any>(undefined);

  useEffect(() => {
    const propertyId = params.authId;
    const createProperty = async () => {
      const newProperty = await api.postPropertie(
        {
          mlsid: propertyId,
          title: "Propiedad temporal",
          address: "Dirección temporal",
          photos: [],
          isTemporalProperty: true,
        },
        propertyId
      );
      setTemporalProperty(newProperty);
    };
    createProperty();
  }, [params.authId]);

  if (!temporalProperty) {
    return <LoadingOverlay />;
  }

  return (
    <div className="m-4">
      <Link href="/documentos">
        <Button size="sm">
          <ArrowLeft />
          Volver a Propiedades
        </Button>
      </Link>
      {temporalProperty.mlsid && (
        <CreateDocumentFromTemplate
          isAuthDocument={true}
          propertyId={temporalProperty.mlsid}
        />
      )}
    </div>
  );
};

export default CreateAuthorizationDocumentFromTemplate;
