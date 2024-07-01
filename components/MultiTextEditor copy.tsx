import React, { useEffect, useState } from "react";
import TextEditor from "./TextEditor";
import { DocumentVariable } from "@/types/next-auth";

const MultiTextEditor = ({
  documentVariables,
  updateDocumentContent,
  initialContent,
}: {
  documentVariables: DocumentVariable[];
  updateDocumentContent: (
    editors: { id: number; content: string }[]
  ) => void;
  initialContent: { id: number; content: string }[];
}) => {
  const [editors, setEditors] = useState<
    { id: number; content: string }[]
  >([]);

  useEffect(() => {
    const initializeEditors = () => {
      try {
        if (Array.isArray(initialContent)) {
          setEditors(initialContent);
        } else {
          // Si el contenido no es un array, establecemos un valor por defecto
          setEditors([
            { id: 1, content: "<p>Editor inicial</p>" },
          ]);
        }
      } catch (error) {
        // En caso de error en el parseo, establecemos un valor por defecto
        setEditors([
          { id: 1, content: "<p>Editor inicial</p>" },
        ]);
        console.error("Error parsing initial content:", error);
      }
    };
    initializeEditors();
  }, [initialContent]); // Re-inicializar cuando el contenido inicial cambie

  const updateMultiDocumentContent = ({
    id,
    html,
  }: {
    id: number;
    html: string;
  }) => {
    const updatedEditors = editors.map(editor =>
      editor.id === id ? { ...editor, content: html } : editor
    );
    setEditors(updatedEditors);
    console.log(
      "Updated Editors Array: ",
      JSON.stringify(updatedEditors)
    );
    updateDocumentContent(updatedEditors);
  };

  const addEditor = () => {
    const newId = editors.length + 1;
    setEditors([
      ...editors,
      { id: newId, content: "<p>Nuevo Editor</p>" },
    ]);
  };

  const removeEditor = (id: number) => {
    const updatedEditors = editors.filter(
      editor => editor.id !== id
    );
    setEditors(updatedEditors);
    updateDocumentContent(updatedEditors); // Actualizar el contenido después de eliminar un editor
  };

  return (
    <div>
      <button onClick={addEditor}>Agregar Editor</button>
      {editors.map(editor => (
        <div key={editor.id}>
          <TextEditor
            documentVariables={documentVariables}
            updateDocumentContent={html =>
              updateMultiDocumentContent({ id: editor.id, html })
            }
            content={editor.content}
            hideControls={false}
            disableEditing={false}
          />
          <button onClick={() => removeEditor(editor.id)}>
            Eliminar Editor
          </button>
        </div>
      ))}
    </div>
  );
};

export default MultiTextEditor;
