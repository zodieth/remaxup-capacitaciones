"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ProfileCategory } from "@prisma/client";
import toast from "react-hot-toast";

interface NewProfileModalProps {
  trigger: React.ReactNode;
  onCreate: {
    (profile: {
      newProfileName: string;
      profileCategory: ProfileCategory;
    }): void;
  };
}

export const NewProfileModal = ({
  trigger,
  onCreate,
}: NewProfileModalProps) => {
  const [newProfileName, setNewProfileName] = useState("");
  const [categorySelected, setCategorySelected] =
    useState<ProfileCategory>();

  const handleCreateProfile = () => {
    if (!newProfileName || !categorySelected) {
      toast.error("Debes completar todos los campos");
      return;
    }

    onCreate({
      newProfileName,
      profileCategory: categorySelected,
    });
    setNewProfileName("");
    setCategorySelected(undefined);
  };

  const handleCategoryChange = (category: ProfileCategory) => {
    setCategorySelected(category);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Crear nuevo perfil</AlertDialogTitle>
        </AlertDialogHeader>

        <Input
          type="text"
          placeholder="Nombre del perfil"
          value={newProfileName}
          onChange={(e: any) =>
            setNewProfileName(e.target.value)
          }
          className="w-full"
        />

        <Select
          value={categorySelected}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Profiles</SelectLabel>

              <SelectItem value={ProfileCategory.COMPRADOR}>
                {ProfileCategory.COMPRADOR}
              </SelectItem>

              <SelectItem value={ProfileCategory.VENDEDOR}>
                {ProfileCategory.VENDEDOR}
              </SelectItem>

              <SelectItem value={ProfileCategory.LOCADOR}>
                {ProfileCategory.LOCADOR}
              </SelectItem>

              <SelectItem value={ProfileCategory.LOCATARIO}>
                {ProfileCategory.LOCATARIO}
              </SelectItem>

              <SelectItem value={ProfileCategory.OTRO}>
                {ProfileCategory.OTRO}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleCreateProfile}>
            Crear Perfil
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
