/** @format */

"use client";
import { useParams } from "next/navigation";
import { ListBlobResultBlob } from "@vercel/blob";
import { useCallback, useEffect, useState } from "react";
type BlobResult = ListBlobResultBlob;

const SingleProjectPage = () => {
  const params = useParams<{ projectName: string; username: string }>();
  const { projectName, username } = params;
  const [projectBlobs, setProjectBlobs] = useState<BlobResult[] | null>(null);

  const fetchBlobs = useCallback(async () => {
    const response = await fetch("/api/fetchBlobs");

    if (response.ok) {
      const blobs = await response.json();
      const filteredBlobs = blobs.filter(
        (b: BlobResult) =>
          b.pathname.split("-")[0] === username &&
          b.pathname.split("-")[1] === projectName
      );

      if (filteredBlobs.length > 0) {
        // Update state with blobs that match the current username
        setProjectBlobs(filteredBlobs);
        console.log(filteredBlobs);
      } else {
        console.log(`No projects were found for '${username}'`);
      }
    } else {
      console.log("Failed to fetch data.");
    }
  }, [username, projectName]);

  useEffect(() => {
    fetchBlobs();
  }, [fetchBlobs]);

  return (
    <>
      <h1>{projectName}</h1>
      <div className="Audio Player">
        {projectBlobs?.map((blob, index) => (
          <div key={index} className="audio-player">
            <audio controls src={blob.url}>
              Your browser does not support the audio element.
            </audio>
          </div>
        ))}
      </div>
    </>
  );
};

export default SingleProjectPage;
