// components/FileInput.tsx
"use client";

import { ChangeEvent, useRef, useState, DragEvent } from "react";

interface FileInputProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

const FileInput = ({ onFileSelect, selectedFile }: FileInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  };

  const handleClean = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        onFileSelect(file);
      } else {
        alert("Пожалуйста, загрузите файл изображения");
      }
    }
  };

  return (
    <div
      className="file-input"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        id="file-upload"
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept="image/*"
      />

      {selectedFile ? (
        <div className="selected-file">
          {selectedFile.name}
          <img src="/close.svg" alt="close" onClick={handleClean} />
        </div>
      ) : (
        <>
          <label
            htmlFor="file-upload"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              fileInputRef.current?.click();
            }}
          >
            Choose file
          </label>
          <p>or drag it into window</p>
        </>
      )}
    </div>
  );
};

export default FileInput;
