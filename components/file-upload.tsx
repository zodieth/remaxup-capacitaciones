"use client";

import { useState } from "react";
import { Button } from "./ui/button";

export function FileUpload({
  endpoint,
  onChange,
  courseId,
}: {
  endpoint?: string;
  onChange: ({ url, name }: { url: string; name?: string }) => void;
  courseId?: string;
}) {
  const [files, setFiles] = useState<File[]>([]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) return;

    try {
      const data = new FormData();
      files.forEach((file, index) => {
        data.append("files", file);
        data.append("endpoint", endpoint || "");
        data.append("courseId", courseId || "");
      });

      console.log("Files", files);

      const res = await fetch("/api/fileUpload/multipleFile", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        const filesResponse = await res.json();

        const filesArray = filesResponse.files;

        if (Array.isArray(filesArray)) {
          filesArray.forEach((file) => {
            onChange(file);
            console.log("File", file);
          });
        } else {
          console.error("La respuesta no es un array", filesArray);
        }
      } else {
        throw new Error(await res.text());
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="file"
          id="fileInput"
          name="files"
          multiple
          className="hidden"
          onChange={(e) =>
            setFiles(e.target.files ? Array.from(e.target.files) : [])
          }
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Seleccionar archivos
        </label>
        <Button
          type="submit"
          className={`ml-5 mt-4 py-2 px-4 font-bold rounded ${
            files.length === 0 && "bg-gray-500 text-gray-100 cursor-not-allowed"
          }`}
          disabled={files.length === 0}
        >
          Subir archivos
        </Button>
      </form>
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Archivos seleccionados:</h3>
        <ul>
          {files.map((file, index) => (
            <li
              key={index}
              className="flex items-center p-2 bg-sky-100 border-sky-200 border text-sky-700 rounded-md mt-2"
            >
              <p className="text-xs line-clamp-1">{file.name}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
