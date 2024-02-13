/** @format */
"use client";
import type { PutBlobResult } from "@vercel/blob";
import { useState, useRef, useEffect } from "react";

// Define the type for your file progress tracking
type FileProgress = {
  file: File;
  progress: number;
};
type BlobResult = PutBlobResult;

const AudioUpload = () => {
  const projectNameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const [projectName, setProjectName] = useState("");
  const [username, setUsername] = useState("");
  const inputFilesRef = useRef<HTMLInputElement>(null);
  // const [blobs, setBlobs] = useState<PutBlobResult[] | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileProgress, setFileProgress] = useState<FileProgress[]>([]);
  const [blobs, setBlobs] = useState<BlobResult[] | null>(null);

  useEffect(() => {
    if (selectedFiles.length > 0 && inputFilesRef.current) {
      inputFilesRef.current.value = "";
    }
  }, [blobs, selectedFiles.length]);

  useEffect(() => {
    // Reset blobs when projectName or username changes
    setBlobs(null);
  }, [projectName, username]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // if (event.target.files && event.target.files.length > 0) {
    //   // Explicitly typing the conversion to File[]
    //   const filesArray: File[] = Array.from(event.target.files) as File[];
    //   setSelectedFiles(filesArray);
    // } else {
    //   // If no files are selected (e.g., the user cancelled the file dialog), clear the selection
    //   setSelectedFiles([]);
    // }
    if (event.target.files && event.target.files.length > 0) {
      // Convert the FileList to an array
      const newFilesArray: File[] = Array.from(event.target.files);

      // Append new files to the existing list
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFilesArray]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(
      selectedFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  const uploadFile = (file: File, index: number) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        // Directly setting progress here; consider smoothing this out as described
        setFileProgress((prevProgress) =>
          prevProgress.map((fp, idx) =>
            idx === index ? { ...fp, progress: Math.min(progress, 100) } : fp
          )
        );
      }
    };

    xhr.upload.onloadstart = () => {
      setFileProgress((prevProgress) => [
        ...prevProgress,
        { file, progress: 0 },
      ]);
    };

    xhr.upload.onloadend = () => {
      setFileProgress((prevProgress) =>
        prevProgress.map((fp, idx) =>
          idx === index ? { ...fp, progress: 100 } : fp
        )
      );
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response: BlobResult = JSON.parse(xhr.responseText);
        setBlobs((prevBlobs) => {
          const newBlobs = prevBlobs ? [...prevBlobs, response] : [response];
          // Reset fileProgress here after successful upload
          setFileProgress([]);
          return newBlobs;
        });
      } else {
        console.error("Error uploading file:", xhr.statusText);
      }
    };

    xhr.open(
      "POST",
      `/api/file/${projectName}/upload?filename=${username}-${projectName}-${file.name}`
    );
    xhr.send(formData);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setSelectedFiles([]);
    setFileProgress([]);

    if (selectedFiles) {
      const files = selectedFiles;
      for (let i = 0; i < files.length; i++) {
        uploadFile(files[i], i);
      }
    }
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
        <label htmlFor="username" style={{ display: "block" }}>
          username
        </label>
        <input
          autoComplete="true"
          id="username"
          name="username"
          ref={usernameRef}
          type="text"
          placeholder="Username"
          required
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
        <label htmlFor="projectName" style={{ display: "block" }}>
          Project Name
        </label>
        <input
          autoComplete="true"
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
          required={selectedFiles.length === 0}
          multiple
          accept="audio/*"
          onChange={handleFileChange}
        />
        <button type="submit">Upload</button>
      </form>
      {blobs &&
        blobs.map((blob, index) => (
          <div key={blob.url}>
            <a href={blob.url}>Track {index + 1}</a>
          </div>
        ))}
      <div>
        {fileProgress.map((fp, index) => (
          <div key={index}>
            <p>{fp.file.name}</p>
            <progress value={fp.progress} max="100">
              {fp.progress}%
            </progress>
          </div>
        ))}
      </div>
      <div>{renderFilePreviews()}</div>
    </>
  );
};

export default AudioUpload;
