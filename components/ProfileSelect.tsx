import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewProfileModal } from "./modals/NewProfileModal";
import { Button } from "./ui/button";
import { useRef } from "react";
import { ProfileCategory } from "@prisma/client";

export function ProfileSelect({
  profiles,
  handleProfileChange,
  blockId,
  createProfile,
  selectedProfileId,
  setSelectedProfileId,
}: {
  profiles: {
    id: string;
    name: string;
    category: ProfileCategory;
  }[];
  handleProfileChange: (
    blockId: number,
    profileId: string
  ) => void;
  blockId: number;
  createProfile: {
    (profile: {
      newProfileName: string;
      profileCategory: ProfileCategory;
    }): Promise<void>;
  };
  selectedProfileId: string;
  setSelectedProfileId: (profileId: string) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const handleSelectChange = (value: string) => {
    console.log("value", value);
    if (value === "newProfile") {
      // Abrir modal para crear perfil
      triggerRef.current && triggerRef.current.click();
    } else {
      setSelectedProfileId(value);
      handleProfileChange(blockId, value);
    }
  };

  const handleProfileCreation = ({
    newProfileName,
    profileCategory,
  }: {
    newProfileName: string;
    profileCategory: ProfileCategory;
  }) => {
    createProfile({
      newProfileName,
      profileCategory,
    });
  };

  const groupedProfiles: {
    [key: string]: {
      id: string;
      name: string;
      category: ProfileCategory;
    }[];
  } = profiles.reduce(
    (acc, profile) => {
      if (acc[profile.category]) {
        acc[profile.category].push(profile);
      } else {
        acc[profile.category] = [profile];
      }
      return acc;
    },
    {} as {
      [key: string]: {
        id: string;
        name: string;
        category: ProfileCategory;
      }[];
    }
  );

  return (
    <>
      <Select
        value={selectedProfileId}
        onValueChange={handleSelectChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecciona un perfil" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(groupedProfiles).map(category => (
            <SelectGroup key={category}>
              <SelectLabel>{category}</SelectLabel>
              {groupedProfiles[category].map(profile => {
                // No mostrar el perfil 'propiedad'
                if (profile.name.toLowerCase() === "propiedad")
                  return null;
                return (
                  <SelectItem
                    key={profile.id}
                    value={profile.id}
                  >
                    {profile.name}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          ))}
          <SelectItem
            value="newProfile"
            className="text-blue-500 bg-gray-100"
          >
            Crear nuevo perfil...
          </SelectItem>
        </SelectContent>
      </Select>
      <NewProfileModal
        trigger={
          <Button ref={triggerRef} style={{ display: "none" }}>
            Crear perfil
          </Button>
        }
        onCreate={profile => {
          handleProfileCreation({
            newProfileName: profile.newProfileName,
            profileCategory: profile.profileCategory,
          });
        }}
      />
    </>
  );
}
