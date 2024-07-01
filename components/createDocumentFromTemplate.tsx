"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  DocumentTemplate,
  DocumentVariable,
  Profile,
} from "@/types/next-auth";
import { Button } from "@/components/ui/button";
import LoadingOverlay from "@/components/ui/loadingOverlay";
import { EditorBlockComponent } from "./EditorBlockComponent";
import { ProfileCategory } from "@prisma/client";

export type Block = {
  id: number;
  content: string;
  variables: VariableForDocument[];
  profileId: string | null;
  isDuplicable: boolean;
  containsProfile: boolean;
  canBeDeleted: boolean;
  index: number;
  isOriginal: boolean;
};

type VariableForDocument = {
  id: string;
  name: string;
  variable: string;
  value: string;
};

const api = {
  async getDocumentTemplates() {
    const response = await fetch(
      "/api/documents/documentTemplate"
    );
    return response.json();
  },
  async getAuthorizationDocumentTemplates() {
    console.log("getAuthorizationDocumentTemplates");
    const response = await fetch(
      "/api/documents/documentTemplate/authTemplate"
    );
    console.log("response", response);
    return response.json();
  },
  async createDocumentFromTemplate(
    template: DocumentTemplate,
    blocks: Block[],
    propertyId: string | undefined
  ) {
    const response = await fetch("/api/documents/fromTemplate", {
      method: "POST",
      body: JSON.stringify({ template, blocks, propertyId }),
      headers: { "Content-Type": "application/json" },
    });
    return response;
  },
  async getProfiles({ propertyId }: { propertyId: string }) {
    const response = await fetch(`/api/profiles/${propertyId}`);
    return response.json();
  },
  async createProfile({
    name,
    profileCategory,
    propertyId,
  }: {
    name: string;
    profileCategory: ProfileCategory;
    propertyId: string;
  }) {
    const response = await fetch("/api/profiles", {
      method: "POST",
      body: JSON.stringify({
        name,
        profileCategory,
        propertyId,
      }),
      headers: { "Content-Type": "application/json" },
    });
    return response.json();
  },
  async createProfileDocumentVariable({
    profileId,
    documentVariableId,
    value,
  }: {
    profileId: string;
    documentVariableId: string;
    value: string;
  }) {
    const response = await fetch(
      "/api/profileDocumentVariable",
      {
        method: "POST",
        body: JSON.stringify({
          profileId,
          documentVariableId,
          value,
        }),
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  },
};

export const CreateDocumentFromTemplate = ({
  propertyId,
  isAuthDocument = false,
}: {
  propertyId: string;
  isAuthDocument?: boolean;
}) => {
  const router = useRouter();
  const [documentTemplates, setDocumentTemplates] = useState<
    DocumentTemplate[]
  >([]);
  const [selectedDocumentTemplate, setSelectedDocumentTemplate] =
    useState<DocumentTemplate | null>(null);
  const [editorBlocks, setEditorBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    const fetchTemplatesAndProfiles = async () => {
      const templates = isAuthDocument
        ? await api.getAuthorizationDocumentTemplates()
        : await api.getDocumentTemplates();
      setDocumentTemplates(templates);

      const fetchedProfiles = await api.getProfiles({
        propertyId: propertyId || "",
      });
      setProfiles(fetchedProfiles);

      const propiedadProfile = fetchedProfiles.find(
        (p: Profile) => p.name === "propiedad"
      );

      if (propiedadProfile && templates) {
        const initialBlocks =
          templates.length > 0
            ? templates[0].templateBlocks.map(
                (block: Block) => ({
                  ...block,
                  profileId: block.containsProfile
                    ? null
                    : propiedadProfile.id,
                  variables: block.variables.map(variable => ({
                    ...variable,
                    value: block.containsProfile
                      ? ""
                      : propiedadProfile.variables.find(
                          (v: any) => v.id === variable.id
                        )?.value || "",
                  })),
                  isOriginal: true,
                })
              )
            : [];

        setEditorBlocks(initialBlocks);
      }
    };

    if (propertyId) {
      fetchTemplatesAndProfiles();
    }
  }, [isAuthDocument, propertyId]);

  const handleInputChange = (e: any) => {
    const selected =
      documentTemplates.find(
        template => template.id === e.target.value
      ) || null;
    setSelectedDocumentTemplate(selected);

    if (selected) {
      const contentArray = selected.templateBlocks.map(
        (block: any) => {
          if (!block.containsProfile) {
            const propiedadProfile = profiles.find(
              p => p.name === "propiedad"
            );

            return {
              ...block,
              variables: block.variables.map(
                (variable: DocumentVariable) => ({
                  id: variable.id,
                  variable: `{${variable.name}}`,
                  value:
                    propiedadProfile?.variables.find(
                      v => v.documentVariable.id === variable.id
                    )?.value || "",
                })
              ),
              isOriginal: true,
              profileId: null,
            };
          } else {
            return {
              ...block,
              variables: block.variables.map(
                (variable: DocumentVariable) => ({
                  id: variable.id,
                  variable: `{${variable.name}}`,
                  value: "",
                })
              ),
              isOriginal: true,
              profileId: null,
            };
          }
        }
      );
      console.log("contentArray", contentArray);
      setEditorBlocks(contentArray);
    }
  };

  const createProfile = async ({
    newProfileName,
    profileCategory,
  }: {
    newProfileName: string;
    profileCategory: ProfileCategory;
  }) => {
    if (newProfileName.trim() === "") return;
    const profile = await api.createProfile({
      name: newProfileName,
      profileCategory: profileCategory,
      propertyId: propertyId || "",
    });
    if (profile) toast.success("Perfil creado correctamente");
    setProfiles([...profiles, profile]);
    return profile;
  };

  console.log("editorBlocks", editorBlocks);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!selectedDocumentTemplate) {
        throw new Error("No se ha seleccionado una plantilla");
      }

      const propiedadProfile = profiles.find(
        p => p.name === "propiedad"
      );

      const profileDocumentVariablesPromises = editorBlocks.map(
        block => {
          const effectiveProfileId = block.containsProfile
            ? block.profileId
            : propiedadProfile?.id;
          return block.variables.map(variable =>
            api.createProfileDocumentVariable({
              profileId: effectiveProfileId || "",
              documentVariableId: variable.id,
              value: variable.value,
            })
          );
        }
      );

      const profileDocumentVariablesResponse = await Promise.all(
        profileDocumentVariablesPromises.flat()
      );

      const response = await api.createDocumentFromTemplate(
        selectedDocumentTemplate,
        editorBlocks,
        propertyId
      );

      if (response.ok) {
        toast.success("Documento creado correctamente");
        const redirectPath = isAuthDocument
          ? `/documentos`
          : `/documentos/${propertyId}`;
        router.push(redirectPath);
      } else {
        throw new Error(`Error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error al crear el documento:", error);
      toast.error("Error al crear el documento");
    } finally {
      setIsLoading(false);
    }
  };

  const onChangeVariable = (
    blockId: number,
    variableName: string,
    newValue: string
  ) => {
    const updatedBlocks = editorBlocks.map(block =>
      block.id === blockId
        ? {
            ...block,
            variables: block.variables.map(v =>
              v.variable === variableName
                ? { ...v, value: newValue }
                : v
            ),
          }
        : block
    );
    setEditorBlocks(updatedBlocks);
  };

  const updateBlockContent = (
    blockId: number,
    newContent: string
  ) => {
    const updatedBlocks = editorBlocks.map(block =>
      block.id === blockId
        ? { ...block, content: newContent }
        : block
    );
    setEditorBlocks(updatedBlocks);
  };

  const duplicateBlock = (blockId: number) => {
    setEditorBlocks(prev => {
      const blockIndex = prev.findIndex(
        block => block.id === blockId
      );
      if (blockIndex !== -1 && prev[blockIndex].isDuplicable) {
        const newBlock = {
          ...prev[blockIndex],
          id: Date.now(),
          index: prev[blockIndex].index + 1,
          isOriginal: false,
        };

        const updatedBlocks = prev.map((block, index) => {
          if (index > blockIndex) {
            return { ...block, index: block.index + 1 };
          }
          return block;
        });

        return [
          ...updatedBlocks.slice(0, blockIndex + 1),
          newBlock,
          ...updatedBlocks.slice(blockIndex + 1),
        ];
      }
      return prev;
    });
  };

  const removeBlock = (blockId: number) => {
    const updatedBlocks = editorBlocks
      .filter(block => block.id !== blockId)
      .map((block, index) => ({
        ...block,
        index: index + 1,
      }));
    setEditorBlocks(updatedBlocks);
  };

  const handleProfileChange = (
    blockId: number,
    profileId: string | null
  ) => {
    const updatedBlocks = editorBlocks.map(block => {
      if (block.id === blockId) {
        if (profileId === null) {
          const resetVariables = block.variables.map(
            variable => ({
              ...variable,
              value: "",
            })
          );

          return {
            ...block,
            profileId,
            variables: resetVariables,
          };
        } else {
          const selectedProfile = profiles.find(
            profile => profile.id === profileId
          );

          const updatedVariables = block.variables.map(
            variable => {
              const foundVariable =
                selectedProfile?.variables?.find(
                  v => v.documentVariable.id === variable.id
                );

              return {
                ...variable,
                value: foundVariable ? foundVariable.value : "",
              };
            }
          );

          return {
            ...block,
            profileId,
            variables: updatedVariables,
          };
        }
      }
      return block;
    });
    setEditorBlocks(updatedBlocks);
  };

  return (
    <div className="m-4">
      <h1 className="font-bold text-2xl m-4">
        Crear documento desde plantilla
      </h1>
      <div className="flex items-center justify-between mb-4">
        <select
          onChange={handleInputChange}
          className="input border w-1/3 py-2 px-1 rounded-md m-3"
        >
          <option value="">Selecciona una plantilla</option>
          {documentTemplates.map(template => (
            <option key={template.id} value={template.id}>
              {template.title}
            </option>
          ))}
        </select>
      </div>

      {selectedDocumentTemplate && (
        <form
          onSubmit={onSubmit}
          className="flex justify-end mb-4"
        >
          <Button type="submit">Crear Documento</Button>
        </form>
      )}

      {selectedDocumentTemplate &&
        editorBlocks
          .sort((a, b) => a.index - b.index)
          .map(block => (
            <EditorBlockComponent
              key={block.id}
              block={block}
              profiles={profiles}
              onChangeVariable={onChangeVariable}
              updateBlockContent={updateBlockContent}
              duplicateBlock={duplicateBlock}
              removeBlock={removeBlock}
              handleProfileChange={handleProfileChange}
              createProfile={createProfile}
            />
          ))}

      {isLoading && <LoadingOverlay />}
    </div>
  );
};
