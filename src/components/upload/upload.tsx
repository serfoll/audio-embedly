/** @format */
"use client";
import type { PutBlobResult } from "@vercel/blob";
import { useState, useRef, useEffect } from "react";
import { upload } from "@vercel/blob/client"; // Define the type for your file progress tracking
import Link from "next/link";

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileProgress, setFileProgress] = useState<FileProgress[]>([]);
  const [blobs, setBlobs] = useState<BlobResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [projectCreated, setProjectCreated] = useState(false);

  useEffect(() => {
    // Reset blobs when projectName or username changes
    setBlobs(null);
  }, [projectName, username]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      // Convert the FileList to an array
      const newFilesArray: File[] = Array.from(event.target.files);

      // Append new files to the existing list
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFilesArray]);
    }
  };

  const uploadFile = async (file: File) => {
    setIsLoading(true);
    setProjectCreated(false);
    const pathname = `${username}-${projectName}-${file.name}`;
    const newBlob = await upload(pathname, file, {
      access: "public",
      handleUploadUrl: `/api/file/${projectName}/upload?filename=${pathname}`,
    });
    setIsLoading(false);
    setProjectCreated(true);
    return newBlob;
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setSelectedFiles([]);
    setFileProgress([]);
    const blobs = [];
    // Check if inputFilesRef.current is not null and it has files
    if (
      inputFilesRef.current &&
      inputFilesRef.current.files &&
      inputFilesRef.current.files.length > 0
    ) {
      const files = inputFilesRef.current.files;
      for (let i = 0; i < files.length; i++) {
        const blob = await uploadFile(files[i]);
        blobs.push(blob);
      }
      inputFilesRef.current.value = "";
    }
    setBlobs(blobs);
  };

  const renderFilePreviews = () => {
    return selectedFiles.map((file, index) => (
      <div key={index}>{file.name}</div>
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
      {isLoading && <h3>uploading files ...</h3>}
      {/* {blobs &&
        blobs.map((blob, index) => (
          <div key={blob.url}>
            <a href={blob.url}>Track {index + 1}</a>
          </div>
        ))} */}
      {projectCreated && (
        <Link href={`/projects/${username}/${projectName}`}>{projectName}</Link>
      )}
      {/* <div>
        {fileProgress.map((fp, index) => (
          <div key={index}>
            <p>{fp.file.name}</p>
            <progress value={fp.progress} max="100">
              {fp.progress}%
            </progress>
          </div>
        ))}
      </div> */}
      <div>{renderFilePreviews()}</div>
    </>
  );
};

export default AudioUpload;
