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
import { ConfirmModal } from "@/components/modals/confirm-modal";
import LoadingSpinner from "@/components/ui/loadingSpinner";

const api = {
  fetchUsefulLinks: async (): Promise<UsefulLink[]> => {
    const response = await fetch("/api/usefulLink");
    if (!response.ok) {
      toast.error("Error al cargar los links");
      throw new Error("Error al cargar los links");
    }
    return response.json();
  },
  createUsefulLink: async (
    title: string,
    url: string,
    description: string
  ): Promise<UsefulLink> => {
    const response = await fetch("/api/usefulLink", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        url: url,
        description: description,
      }),
    });
    if (!response.ok) {
      toast.error("Error al crear el link");
      throw new Error("Error al crear el link");
    }
    return response.json();
  },
  updateUsefulLink: async (
    id: string,
    newTitle: string,
    newUrl: string,
    newDescription: string
  ): Promise<void> => {
    const response = await fetch("/api/usefulLink", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newTitle,
        url: newUrl,
        description: newDescription,
        id: id,
      }),
    });
    if (!response.ok) {
      toast.error("Error al actualizar el link");
      throw new Error("Error al actualizar el link");
    }
  },
  deleteUsefulLink: async (id: string): Promise<void> => {
    const response = await fetch("/api/usefulLink", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });
    if (!response.ok) {
      toast.error("Error al eliminar el link");
      throw new Error("Error al eliminar el link");
    }
  },
};

const formSchema = z.object({
  title: z.string().min(1, "Ingrese un título"),
  url: z.string().url("Ingrese una URL válida"),
  description: z.string().optional(),
});

interface FormValues {
  title: string;
  url: string;
  description: string;
}

type UsefulLink = {
  id: string;
  title: string;
  url: string;
  description: string;
};

const UsefulLinksABM = () => {
  const [usefulLinks, setUsefulLinks] = useState<UsefulLink[]>(
    []
  );
  const [editingIndex, setEditingIndex] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<
    number | null
  >(null);

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
      title: "",
      url: "",
      description: "",
    },
  });

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const fetchedLinks = await api.fetchUsefulLinks();
        setUsefulLinks(fetchedLinks);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLinks();
  }, []);

  const onSubmit: SubmitHandler<FormValues> = async data => {
    if (editingIndex === null) {
      const newLink = await api.createUsefulLink(
        data.title,
        data.url,
        data.description
      );
      setUsefulLinks(prevLinks => [...prevLinks, newLink]);
      toast.success("Link creado");
    } else {
      const linkId = usefulLinks[editingIndex].id;
      await api.updateUsefulLink(
        linkId,
        data.title,
        data.url,
        data.description
      );
      const updatedLinks = usefulLinks.map((link, index) =>
        index === editingIndex
          ? {
              ...link,
              title: data.title,
              url: data.url,
              description: data.description,
            }
          : link
      );
      setUsefulLinks(updatedLinks);
      setEditingIndex(null);
      toast.success("Link actualizado");
    }
    reset({ title: "", url: "", description: "" });
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    reset({
      title: usefulLinks[index].title,
      url: usefulLinks[index].url,
      description: usefulLinks[index].description,
    });
  };

  const onCancelEdit = () => {
    setEditingIndex(null);
    reset({ title: "", url: "", description: "" });
  };

  const handleDelete = async (index: number) => {
    const linkId = usefulLinks[index].id;
    await api.deleteUsefulLink(linkId);
    setUsefulLinks(prevLinks =>
      prevLinks.filter((_, i) => i !== index)
    );
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);

      if (linkToDelete !== null) {
        await handleDelete(linkToDelete);
      }
      toast.success("Link eliminado");
    } catch {
      toast.error("Error al eliminar el link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-10 space-y-4 w-[75%] border border-gray-300 rounded-lg p-6 md:w-1/2">
      <h1 className="font-bold text-xl">Links</h1>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormItem>
            <FormLabel>Titulo</FormLabel>
            <FormControl>
              <Input
                placeholder="Titulo"
                {...register("title")}
              />
            </FormControl>
            {errors.title && (
              <FormMessage>{errors.title.message}</FormMessage>
            )}
          </FormItem>
          <FormItem>
            <FormLabel>URL</FormLabel>
            <FormControl>
              <Input placeholder="URL" {...register("url")} />
            </FormControl>
            {errors.url && (
              <FormMessage>{errors.url.message}</FormMessage>
            )}
          </FormItem>
          <FormItem>
            <FormLabel>Descripción</FormLabel>
            <FormControl>
              <Input
                placeholder="Descripción"
                {...register("description")}
              />
            </FormControl>
            {errors.description && (
              <FormMessage>
                {errors.description.message}
              </FormMessage>
            )}
          </FormItem>
          <Button type="submit" className="mt-4 mr-3">
            {editingIndex === null
              ? "Crear Link"
              : "Actualizar Link"}
          </Button>
          {editingIndex !== null && (
            <Button onClick={() => onCancelEdit()}>
              Cancelar
            </Button>
          )}
        </form>
      </Form>
      {usefulLinks.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <ul className="mt-4">
          {usefulLinks.map((usefulLink, index) => (
            <li
              key={usefulLink.id}
              className={`flex justify-between items-center p-1 rounded mt-1 ${
                index === editingIndex
                  ? "bg-blue-100"
                  : "bg-gray-100"
              }`}
            >
              <div className="mx-2 text-sm">
                {" "}
                {usefulLink.title}
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
                    onClick={() => setLinkToDelete(index)}
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

export default UsefulLinksABM;
