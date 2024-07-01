"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
// import { DocumentVariable } from "@prisma/client";
import LoadingSpinner from "./ui/loadingSpinner";
import { DocumentVariable } from "@/types/next-auth";

const TextEditor = ({
  documentVariables,
  updateDocumentContent,
  content,
  hideControls,
  disableEditing,
}: {
  documentVariables: {
    name: string;
    variable: string;
    value: string;
  }[];
  updateDocumentContent: (html: string) => void;
  content?: string;
  hideControls?: boolean;
  disableEditing?: boolean;
}) => {
  // state used for adding variables to the editor
  const [selectedVariable, setSelectedVariable] = useState(
    documentVariables[0]?.value
  );

  useEffect(() => {
    setSelectedVariable(documentVariables[0]?.value);
  }, [documentVariables]);

  console.log(documentVariables);

  const documentContent =
    content ||
    "<p>Comienze a escribir su documento aqui...</p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p>";

  // ---------- EDITOR SETUP ----------

  const editor = useEditor({
    extensions: [StarterKit],
    content: documentContent,
    editable: disableEditing ? false : true,

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();

      console.log(html);
      updateDocumentContent(html);
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  // Comprueba si el estado actual es negrita o cursiva y aplica clases condicionales
  const boldIsActive = editor?.isActive("bold");
  const italicIsActive = editor?.isActive("italic");

  const insertVariable = () => {
    editor.chain().focus().insertContent(selectedVariable).run();
  };

  // ---------- END EDITOR SETUP ----------

  return (
    <div className="w-[100%]">
      <div className="mt-10 w-[100%] border border-gray-300 rounded-lg p-3">
        {!hideControls && (
          <div className="flex justify-between items-center">
            <div>
              <Button
                onClick={() =>
                  editor.chain().focus().toggleBold().run()
                }
                // className={`${editor.isActive("italic") ? "is-active" : ""} m-2`}
                className={`m-2 ${boldIsActive ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
              >
                Negrita
              </Button>
              <Button
                onClick={() =>
                  editor.chain().focus().toggleItalic().run()
                }
                className={`m-2 ${italicIsActive ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
              >
                Cursiva
              </Button>
            </div>
            <div className="flex justify-between items-center w-1/2">
              {documentVariables.length > 0 && (
                <select
                  value={selectedVariable}
                  onChange={e =>
                    setSelectedVariable(e.target.value)
                  }
                  className="border border-gray-300 rounded p-1 w-1/2"
                >
                  {documentVariables.map(variable => (
                    <option
                      key={variable.variable}
                      value={variable.value}
                    >
                      {variable.name}
                    </option>
                  ))}
                </select>
              )}
              <Button onClick={insertVariable} className="m-2">
                Insertar Variable
              </Button>
            </div>
          </div>
        )}
        <EditorContent
          className="mt-10 border border-gray-300 rounded-lg"
          editor={editor}
        />
      </div>
    </div>
  );
};

export default TextEditor;
