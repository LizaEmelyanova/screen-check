// app/page.tsx
"use client";

import { useState } from "react";
import FileInput from "./components/FileInput";
import Info from "./components/Info";
import Button from "./components/Button";
import ImageProcessor from "./components/ImageProcessor";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleReset = () => {
    setSelectedFile(null);
  };

  return (
    <div>
      <div className="form">
        <FileInput
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
        />

        <Info />
      </div>
      <Button title="Check screen" />
      {/* <h2>Open windows:</h2> */}

      {/* ImageProcessor показывается, если файл выбран */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {selectedFile && (
          <ImageProcessor selectedFile={selectedFile} onReset={handleReset} />
        )}
      </div>
      
    </div>
  );
}
