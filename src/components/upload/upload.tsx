/** @format */
"use client";
import type { PutBlobResult } from "@vercel/blob";
import { useState, useRef, useEffect } from "react";

const AudioUpload = () => {
  const projectNameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const [projectName, setProjectName] = useState("");
  const [username, setUsername] = useState("");
  const inputFilesRef = useRef<HTMLInputElement>(null);
  const [blobs, setBlobs] = useState<PutBlobResult[] | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    console.log(blobs);
  }, [blobs]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      // Explicitly typing the conversion to File[]
      const filesArray: File[] = Array.from(event.target.files) as File[];
      setSelectedFiles(filesArray);
    } else {
      // If no files are selected (e.g., the user cancelled the file dialog), clear the selection
      setSelectedFiles([]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(
      selectedFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const resultBlobs = [];
    if (!inputFilesRef.current?.files) {
      throw new Error("No file selected");
    }

    const files = inputFilesRef.current.files;

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      const file = files[i];
      formData.append("file", file);
      const response = await fetch(
        `/api/file/${projectName}/upload?filename=${username}-${projectName}-${file.name}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const newBlob = (await response.json()) as PutBlobResult;
      resultBlobs.push(newBlob);
    }
    setBlobs(resultBlobs);

    //clean up
    setProjectName("");
    if (inputFilesRef.current) {
      inputFilesRef.current.value = "";
    }
    setSelectedFiles([]);
  };

  const renderFilePreviews = () => {
    return selectedFiles.map((file, index) => (
      <div key={index}>
        {file.name}
        <button type="button" onClick={() => removeFile(index)}>
          Remove
        </button>
      </div>
    ));
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="projectName" style={{ display: "block" }}>
          username
        </label>
        <input
          id="projectName"
          name="project-name"
          ref={usernameRef}
          type="text"
          placeholder="Project Name"
          required
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
        <label htmlFor="projectName" style={{ display: "block" }}>
          Project Name
        </label>
        <input
          id="projectName"
          name="project-name"
          ref={projectNameRef}
          type="text"
          placeholder="Project Name"
          required
          onChange={(e) => setProjectName(e.target.value)}
          value={projectName}
        />
        <label htmlFor="upload" style={{ display: "block" }}>
          Files to upload
        </label>
        <input
          id="upload"
          name="file"
          ref={inputFilesRef}
          type="file"
          required
          multiple
          accept="audio/*"
          onChange={handleFileChange}
        />
        <button type="submit">Upload</button>
      </form>
      <div>{renderFilePreviews()}</div>
      {blobs &&
        blobs.map((blob, index) => (
          <div key={blob.url}>
            <a href={blob.url}>Track {index}</a>
          </div>
        ))}
    </>
  );
};

export default AudioUpload;
