"use client";

import { ChangeEvent, useRef, useState } from "react";

const FileInput = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleClean = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  return (
    <div className="file-input">
      <input
        ref={fileInputRef}
        type="file"
        id="file-upload"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {selectedFile ? (
        <div className="selected-file">
            {selectedFile.name}
            <img src="/close.svg" alt="close" onClick={handleClean} />
        </div>
      ) : (
        <>
          <label htmlFor="file-upload">Choose file</label>
          <p>or drag it into window</p>
        </>
      )}
    </div>
  );
};

export default FileInput;
