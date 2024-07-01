/* eslint-disable jsx-a11y/alt-text */
"use client";

import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";
import { convert } from "html-to-text";
import { Button } from "@/components/ui/button";

const styles = StyleSheet.create({
  section: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    paddingTop: 135,
    paddingBottom: 150,
    paddingHorizontal: 15,
  },
  text: {
    margin: 12,
    fontSize: 11,
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 15,
  },
  imageHeader: {
    position: "absolute",
    top: 30,
    left: 0,
    right: 0,
    textAlign: "center",
  },
  imageFooter: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
  },
});

// Componente para generar el enlace de descarga
const PdfGenerator = ({
  content,
  title,
}: {
  content: string;
  title?: string;
}) => {
  const options = {
    wordwrap: 130,
    // ...
  };
  // const html = "<div>Hello World</div>";
  const text = convert(content, options);

  return (
    <Button>
      <PDFDownloadLink
        document={
          <Document>
            <Page size="A4" style={styles.section}>
              <Image
                fixed
                style={styles.imageHeader}
                src="https://res.cloudinary.com/dea89zeui/image/upload/v1712927677/1_gtn9pp.jpg"
              />
              {/* <View> */}
              <Text style={styles.text}>{text}</Text>
              {/* </View> */}
              <Image
                style={styles.imageFooter}
                fixed
                src="https://res.cloudinary.com/dea89zeui/image/upload/v1712927677/2_f8vmhi.jpg"
              />
            </Page>
          </Document>
        }
        fileName={`${title}.pdf` || "documento.pdf"} // Nombre del archivo PDF descargable
      >
        {({ blob, url, loading, error }) =>
          loading ? "Cargando documento..." : "Descargar PDF"
        }
      </PDFDownloadLink>
    </Button>
  );
};

export default PdfGenerator;
