"use client";

import React, { useState, useEffect } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";
import { Pencil } from "lucide-react";

import {
  Form,
  FormControl,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { DeleteConfirmationDialog } from "./deleteConfirmationDialog";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const api = {
  fetchCategories: async (): Promise<Category[]> => {
    const response = await fetch("/api/category");
    if (!response.ok) {
      toast.error("Error al cargar las categorías");
      throw new Error("Error al cargar las categorías");
    }
    return response.json();
  },
  createCategory: async (
    categoryName: string
  ): Promise<Category> => {
    const response = await fetch("/api/category", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: categoryName }),
    });
    if (!response.ok) {
      toast.error("Error al crear la categoría");
      throw new Error("Error al crear la categoría");
    }
    return response.json();
  },
  updateCategory: async (
    id: string,
    newName: string
  ): Promise<void> => {
    const response = await fetch("/api/category", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newName, id: id }),
    });
    if (!response.ok) {
      toast.error("Error al actualizar la categoría");
      throw new Error("Error al actualizar la categoría");
    }
  },
  deleteCategory: async (id: string): Promise<void> => {
    const response = await fetch("/api/category", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });
    if (!response.ok) {
      toast.error("Error al eliminar la categoría");
      throw new Error("Error al eliminar la categoría");
    }
  },
};

const formSchema = z.object({
  name: z.string().min(1, "Ingrese un nombre de categoría"),
});

interface FormValues {
  name: string;
}

type Category = {
  id: string;
  name: string;
};

interface ApiCategories extends Array<Category> {}

const CategoriesABM = () => {
  const [editingIndex, setEditingIndex] = useState<
    number | null
  >(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryToDelete, setCategoryToDelete] = useState<
    number | null
  >(null);
  // const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ["categories"],
    queryFn: api.fetchCategories,
  });

  const onSubmit: SubmitHandler<FormValues> = async data => {
    if (editingIndex === null) {
      const newCategory = await api.createCategory(data.name);
      setCategories(prevCategories => [
        ...prevCategories,
        newCategory,
      ]);
      toast.success("Categoría creada");
    } else {
      const categoryId = categories[editingIndex].id;
      await api.updateCategory(categoryId, data.name);
      const updatedCategories = categories.map(
        (category, index) =>
          index === editingIndex
            ? { ...category, name: data.name }
            : category
      );
      setCategories(updatedCategories);
      setEditingIndex(null);
      toast.success("Categoría actualizada");
    }
    reset({ name: "" });
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    reset({ name: categories[index].name });
  };

  const handleDelete = async (index: number) => {
    const categoryId = categories[index].id;
    await api.deleteCategory(categoryId);
    setCategories(prevCategories =>
      prevCategories.filter((_, i) => i !== index)
    );
  };

  const onCancelEdit = () => {
    setEditingIndex(null);
    reset({ name: "" });
  };

  const onDelete = async () => {
    try {
      // setIsLoading(true);

      if (categoryToDelete !== null) {
        await handleDelete(categoryToDelete);
      }

      toast.success("Categoría eliminada");
    } catch {
      toast.error("Algo no funcionó correctamente");
    } finally {
      // setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-[75%] border border-gray-300 rounded-lg p-6 md:w-1/2">
      <h1 className="font-bold text-xl">Categorías</h1>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormItem>
            <FormLabel>Nombre de la categoría</FormLabel>
            <FormControl>
              <Input
                placeholder="Nombre de la categoría"
                {...register("name")}
              />
            </FormControl>
            {errors.name && (
              <FormMessage>{errors.name.message}</FormMessage>
            )}
          </FormItem>
          <Button type="submit" className="mt-4 mr-3">
            {editingIndex === null
              ? "Crear Categoría"
              : "Actualizar Categoría"}
          </Button>
          {editingIndex !== null && (
            <Button onClick={() => onCancelEdit()}>
              Cancelar
            </Button>
          )}
        </form>
      </Form>
      {isLoading ? (
        Array.from({ length: 6 }).map((_, index) => (
          <Skeleton className="h-[3rem] w-[20rem]" key={index} />
        ))
      ) : isSuccess ? (
        <ul className="mt-4">
          {data?.map((category: Category, index: number) => (
            <li
              key={category.id}
              className={`flex justify-between items-center p-1 rounded mt-1 ${
                index === editingIndex
                  ? "bg-blue-100"
                  : "bg-gray-100"
              }`}
            >
              <div className="mx-2 text-sm">{category.name}</div>
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
                    onClick={() => setCategoryToDelete(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </ConfirmModal>
              </div>
            </li>
          ))}
        </ul>
      ) : data?.length === 0 ? (
        <p>No se encontraron categorías</p>
      ) : (
        ""
      )}
    </div>
  );
};

export default CategoriesABM;
