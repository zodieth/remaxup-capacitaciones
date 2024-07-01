"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useForm, SubmitHandler } from "react-hook-form";
import { Pencil, Trash } from "lucide-react";
import {
  Form,
  FormControl,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingSpinner from "@/components/ui/loadingSpinner";

const api = {
  async fetchDocumentVariables(): Promise<DocumentVariable[]> {
    const response = await fetch("/api/documentVariable");
    if (!response.ok) {
      toast.error("Error al cargar las variables");
      throw new Error("Error al cargar las variables");
    }
    return response.json();
  },
  async createDocumentVariable(
    data: Omit<
      DocumentVariable,
      "id" | "createdAt" | "updatedAt"
    >
  ): Promise<DocumentVariable> {
    const response = await fetch("/api/documentVariable", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      toast.error("Error al crear la variable");
      throw new Error("Error al crear la variable");
    }
    return response.json();
  },
  async updateDocumentVariable(
    id: string,
    data: Omit<
      DocumentVariable,
      "id" | "createdAt" | "updatedAt"
    >
  ): Promise<void> {
    const response = await fetch(`/api/documentVariable/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      toast.error("Error al actualizar la variable");
      throw new Error("Error al actualizar la variable");
    }
  },
  async deleteDocumentVariable(id: string): Promise<void> {
    const response = await fetch(`/api/documentVariable/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error("Error al eliminar la variable");
      throw new Error("Error al eliminar la variable");
    }
  },
};
const formSchema = z.object({
  name: z.string().min(1, "Ingrese un nombre"),
  value: z.string().min(1),
  description: z.string().optional(),
  // referenceTo: z.string().optional(),
});

interface FormValues {
  name: string;
  value: string;
  description?: string;
  referenceTo?: string;
}

interface DocumentVariable {
  id: string;
  name: string;
  value: string;
  description?: string;
  referenceTo?: string;
}

const DocumentVariablesABM = () => {
  const [documentVariables, setDocumentVariables] = useState<
    DocumentVariable[]
  >([]);
  const [editingIndex, setEditingIndex] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [variableToDelete, setVariableToDelete] = useState<
    number | null
  >(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      value: "",
      description: "",
      // referenceTo: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    setValue,
  } = form;

  const name = watch("name");

  // when "name" is modified, update value in form for: {name}
  useEffect(() => {
    setValue("value", `{${name}}`);
  }, [name, setValue]);

  useEffect(() => {
    const fetchVariables = async () => {
      try {
        const variables = await api.fetchDocumentVariables();
        setDocumentVariables(variables);
      } catch (error) {
        console.error(error);
      }
    };
    fetchVariables();
  }, []);

  const onSubmit: SubmitHandler<FormValues> = async data => {
    setIsLoading(true);
    try {
      if (editingIndex === null) {
        const newVariable =
          await api.createDocumentVariable(data);
        setDocumentVariables(prev => [...prev, newVariable]);
        toast.success("Variable creada con éxito");
      } else {
        const variableId = documentVariables[editingIndex].id;
        await api.updateDocumentVariable(variableId, data);
        const updatedVariables = documentVariables.map(
          (variable, index) =>
            index === editingIndex
              ? { ...variable, ...data }
              : variable
        );
        setDocumentVariables(updatedVariables);
        setEditingIndex(null);
        toast.success("Variable actualizada con éxito");
      }
      reset({
        name: "",
        value: "",
        description: "",
        // referenceTo: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar la variable");
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (index: number) => {
    const variable = documentVariables[index];
    setEditingIndex(index);
    reset(variable);
  };

  const onCancelEdit = () => {
    setEditingIndex(null);
    reset({
      name: "",
      value: "",
      description: "",
      // referenceTo: "",
    });
  };

  const handleDelete = async (index: number) => {
    const variableId = documentVariables[index].id;
    await api.deleteDocumentVariable(variableId);
    setDocumentVariables(prev =>
      prev.filter((_, i) => i !== index)
    );
  };

  const onDelete = async () => {
    setIsLoading(true);
    try {
      if (variableToDelete !== null) {
        await handleDelete(variableToDelete);
        setVariableToDelete(null);
        toast.success("Variable eliminada con éxito");
      }
    } catch {
      toast.error("Error al eliminar la variable");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-10 space-y-4 w-[75%] border border-gray-300 rounded-lg p-6 md:w-1/2">
      <h1 className="text-lg font-semibold mb-4">
        Administración de Variables de Documento
      </h1>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input {...register("name")} />
            </FormControl>
            {errors.name && (
              <FormMessage>{errors.name.message}</FormMessage>
            )}
          </FormItem>
          <FormItem>
            <FormLabel>Valor</FormLabel>
            <FormControl>
              <Input {...register("value")} disabled />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Descripción (opcional)</FormLabel>
            <FormControl>
              <Textarea {...register("description")} />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Referencia (opcional)</FormLabel>
            <FormControl>
              <Input {...register("referenceTo")} />
            </FormControl>
          </FormItem>
          <Button type="submit" className="mt-4 mr-3">
            {editingIndex === null
              ? "Crear Variable"
              : "Actualizar Variable"}
          </Button>
          {editingIndex !== null && (
            <Button onClick={() => onCancelEdit()}>
              Cancelar
            </Button>
          )}
        </form>
      </Form>
      {documentVariables.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <ul className="mt-4">
          {documentVariables.map((variable, index) => (
            <li
              key={variable.id}
              className={`flex justify-between items-center p-1 rounded mt-1 ${index === editingIndex ? "bg-blue-100" : "bg-gray-100"}`}
            >
              <div className="mx-2 text-sm">
                {" "}
                {variable.name}: {variable.value}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => startEditing(index)}
                  className="text-sm"
                >
                  <Pencil className="h-4 w-4 " />
                </Button>
                <ConfirmModal onConfirm={onDelete}>
                  <Button
                    size="sm"
                    disabled={isLoading}
                    onClick={() => setVariableToDelete(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </ConfirmModal>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DocumentVariablesABM;
