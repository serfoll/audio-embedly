/** @format */
"use client";
import { ListBlobResultBlob } from "@vercel/blob";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type BlobResult = ListBlobResultBlob;

const ProjectsPage = () => {
  const [userBlobs, setBlobs] = useState<BlobResult[] | null>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const [userProjects, setUserProjects] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const fetchBlobs = async () => {
    const response = await fetch("/api/fetchBlobs");

    if (response.ok) {
      const blobs = await response.json();
      const filteredBlobs = blobs.filter(
        (b: BlobResult) => b.pathname.split("-")[0] === username
      );
      const projects = filteredBlobs
        .map((fb: BlobResult) => fb.pathname.split("-")[1])
        .reduce(
          (uniqueProjects: any, name: string) => {
            // Add the name if it's not the last one added
            if (uniqueProjects.last !== name) {
              uniqueProjects.result.push(name);
              uniqueProjects.last = name; // Update the last added name
            }
            return uniqueProjects;
          },
          { last: null, result: [] }
        ).result; // Initial accumulator with no last name and an empty result array // Extract the result array containing unique names

      if (filteredBlobs.length > 0) {
        setUserProjects(projects);
        // Update state with blobs that match the current username
        setBlobs(filteredBlobs);
        setErrorMessage("");
      } else {
        setErrorMessage(`No projects where found for '${username}'`);
      }
    } else {
      setErrorMessage("Failed to fetch data.");
    }
  };

  // useEffect(() => {
  //   if (blobsResult) console.log("blobs: ", blobsResult);
  // }, [blobsResult]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await fetchBlobs();
  };

  return (
    <>
      {userProjects.length < 1 ? (
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username: </label>
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
          <button type="submit">Login</button>
        </form>
      ) : (
        userProjects.map((project) => (
          <div key={project}>
            <Link href={`/projects/${username}/${project}`}>{project}</Link>
          </div>
        ))
      )}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </>
  );
};

export default ProjectsPage;
