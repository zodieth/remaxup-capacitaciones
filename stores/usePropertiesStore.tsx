import { create } from "zustand";
import { useEffect } from "react"; // Importa useEffect
import { PropertydApi } from "@/types/next-auth";
import { Property } from "@prisma/client";

interface PropertiesState {
  propiedades: Property[];
  setPropiedades: (propiedades: Property[]) => void;
  getPropiedadById: (id: string) => Property | undefined;
}

const usePropertiesStore = create<PropertiesState>(
  (set, get) => ({
    propiedades: [],
    setPropiedades: propiedades => {
      set({ propiedades });
      // Verifica si está en el cliente antes de acceder a localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "propiedades",
          JSON.stringify(propiedades)
        );
      }
    },
    getPropiedadById: id =>
      get().propiedades.find(p => p.mlsid === id),
  })
);

// Función para inicializar la tienda con propiedades guardadas, ahora como un hook para usar en componentes
export const useInitializeStore = () => {
  useEffect(() => {
    const savedPropiedades =
      typeof window !== "undefined"
        ? localStorage.getItem("propiedades")
        : null;
    if (savedPropiedades) {
      usePropertiesStore
        .getState()
        .setPropiedades(JSON.parse(savedPropiedades));
    }
  }, []); // Se ejecuta solo una vez al montar el componente
};

export default usePropertiesStore;
