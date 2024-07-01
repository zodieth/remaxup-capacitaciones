import { useEffect, useState } from "react";
import { ProfileSelect } from "./ProfileSelect";
import TextEditor from "./TextEditor";
import { Block } from "./createDocumentFromTemplate";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Profile, ProfileCategory } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export const EditorBlockComponent = ({
  block,
  profiles,
  onChangeVariable,
  updateBlockContent,
  duplicateBlock,
  removeBlock,
  handleProfileChange,
  createProfile,
}: {
  block: Block;
  profiles: {
    id: string;
    category: ProfileCategory;
    name: string;
  }[];
  onChangeVariable: (
    blockId: number,
    variable: string,
    value: string
  ) => void;
  updateBlockContent: (blockId: number, content: string) => void;
  duplicateBlock: (blockId: number) => void;
  removeBlock: (blockId: number) => void;
  handleProfileChange: (
    blockId: number,
    profileId: string
  ) => void;
  createProfile: {
    (profile: {
      newProfileName: string;
      profileCategory: ProfileCategory;
    }): Promise<Profile>;
  };
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [categorySelected, setCategorySelected] =
    useState<ProfileCategory>();

  useEffect(() => {
    const selectedProfile = profiles.find(
      profile => profile.id === selectedProfileId
    );
    if (selectedProfile) {
      setCategorySelected(selectedProfile.category);
    } else {
      setCategorySelected(undefined);
    }
  }, [selectedProfileId, profiles]);

  const handleCreateProfile = async ({
    newProfileName,
    profileCategory,
  }: {
    newProfileName: string;
    profileCategory: ProfileCategory;
  }) => {
    const newProfile = await createProfile({
      newProfileName,
      profileCategory,
    });
    setSelectedProfileId(newProfile.id);
    handleProfileChange(block.id, newProfile.id);
  };

  return (
    <div
      key={block.id}
      className="p-4 border mt-4 flex rounded-md"
    >
      <div className="w-1/4 pr-4">
        {block.containsProfile && (
          <>
            <label>Perfil:</label>
            <ProfileSelect
              selectedProfileId={selectedProfileId}
              setSelectedProfileId={setSelectedProfileId}
              blockId={block.id}
              profiles={profiles}
              handleProfileChange={handleProfileChange}
              createProfile={handleCreateProfile}
            />

            {selectedProfileId && (
              <div className="mt-4">
                <label>Categoria del perfil:</label>
                <Select value={categorySelected} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Profiles</SelectLabel>

                      <SelectItem
                        value={ProfileCategory.COMPRADOR}
                      >
                        {ProfileCategory.COMPRADOR}
                      </SelectItem>

                      <SelectItem
                        value={ProfileCategory.VENDEDOR}
                      >
                        {ProfileCategory.VENDEDOR}
                      </SelectItem>

                      <SelectItem
                        value={ProfileCategory.LOCADOR}
                      >
                        {ProfileCategory.LOCADOR}
                      </SelectItem>

                      <SelectItem
                        value={ProfileCategory.LOCATARIO}
                      >
                        {ProfileCategory.LOCATARIO}
                      </SelectItem>

                      <SelectItem value={ProfileCategory.OTRO}>
                        {ProfileCategory.OTRO}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}

        {block.variables.map((variable, varIndex) => (
          <div key={varIndex} className="mt-2">
            <label>{variable.variable}</label>
            <Input
              type="text"
              value={variable.value}
              onChange={(e: any) =>
                onChangeVariable(
                  block.id,
                  variable.variable,
                  e.target.value
                )
              }
            />
          </div>
        ))}
      </div>
      <div className="w-3/4 flex flex-col">
        <TextEditor
          content={block.content}
          documentVariables={block.variables}
          updateDocumentContent={newContent =>
            updateBlockContent(block.id, newContent)
          }
          hideControls={true}
          disableEditing={true}
        />
        <div className="flex flex-row gap-2 mt-2 ml-2">
          {block.isDuplicable && (
            <Button
              onClick={() => duplicateBlock(block.id)}
              className="mb-5"
            >
              Duplicar
            </Button>
          )}
          {(!block.isOriginal || block.canBeDeleted) && (
            <Button
              variant="secondary"
              onClick={() => removeBlock(block.id)}
            >
              Eliminar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
