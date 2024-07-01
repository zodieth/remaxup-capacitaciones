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
import { Document } from "@prisma/client";

interface AssignAuthorizationModalProps {
  trigger: React.ReactNode;
  onCreate: (authId: string) => void;
  authDocuments: Document[];
}

export const AssignAuthorizationModal = ({
  trigger,
  onCreate,
  authDocuments,
}: AssignAuthorizationModalProps) => {
  const [authorizationSelected, setAuthorizationSelected] =
    useState<Document | undefined>(undefined);
  const [authorizationSelectedId, setAuthorizationSelectedId] =
    useState<string | undefined>(undefined);

  const handleSelectAuthorization = () => {
    if (!authorizationSelected) {
      toast.error("Debes seleccionar una autorización");
      return;
    }

    console.log(
      "authorizationSelected: ",
      authorizationSelected
    );

    onCreate(
      authorizationSelectedId || authorizationSelected.id
    );
    setAuthorizationSelected(undefined);
  };

  const handleAuthorizationChange = (
    authorizationId: string
  ) => {
    console.log("authorizationId: ", authorizationId);
    setAuthorizationSelectedId(authorizationId);
    const auth = authDocuments.find(
      auth => auth.id === authorizationId
    );
    setAuthorizationSelected(auth);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Vincular autorización
          </AlertDialogTitle>
        </AlertDialogHeader>

        <Select
          value={authorizationSelectedId}
          onValueChange={handleAuthorizationChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una autorizacion" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Autorizaciones</SelectLabel>

              {authDocuments.map(auth => (
                <SelectItem key={auth.id} value={auth.id}>
                  {auth.title} - {auth.documentName}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleSelectAuthorization}>
            Seleccionar autorización
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
