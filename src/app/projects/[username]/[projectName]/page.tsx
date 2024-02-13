/** @format */

"use client";
import { useParams } from "next/navigation";
import { ListBlobResultBlob } from "@vercel/blob";
import { useCallback, useEffect, useState } from "react";
import React from "react";

type BlobResult = ListBlobResultBlob;

const SingleProjectPage = () => {
  const params = useParams<{ projectName: string; username: string }>();
  const { projectName, username } = params;
  const [projectBlobs, setProjectBlobs] = useState<BlobResult[] | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [embedCode, setEmbedCode] = useState<string>("");
  const [codeGenerated, setCodeGenerated] = useState<boolean>(false);

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

  const playAudio = (audioElement: HTMLAudioElement) => {
    // Pause the currently playing audio if there is one
    if (currentAudio && currentAudio !== audioElement) {
      currentAudio.pause();
    }
    // Play the new audio
    audioElement.play();
    // Update the currently playing audio
    setCurrentAudio(audioElement);
  };

  const generateEmbedCode = () => {
    setCodeGenerated(false);
    if (projectBlobs && projectBlobs.length > 0) {
      // Initialize the embed code with an empty string
      let code = "";

      // Generate a custom audio player for each blob
      projectBlobs.forEach((blob) => {
        // Each audio file gets its own <div> container and <audio> tag
        code += `<div class="custom-audio-player">`;
        code += `<audio controls>`;
        code += `<source src="${blob.url}" type="audio/mpeg">`;
        code += `Your browser does not support the audio tag.</audio>`;
        code += `</div>`;
      });

      // Set the generated code into the embedCode state
      setEmbedCode(code);
      setCodeGenerated(true);
    } else {
      setCodeGenerated(false);
      console.log("No audio files available to generate embed code.");
    }
  };

  useEffect(() => {
    fetchBlobs();
  }, [fetchBlobs]);

  return (
    <>
      <h1>{projectName}</h1>
      <div className="Audio Player">
        {projectBlobs?.map((blob, index) => (
          <div key={index} className="audio-player">
            <audio
              controls
              onPlay={(e) => playAudio(e.currentTarget)}
              src={blob.url} // Example path, adjust based on your setup
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        ))}
      </div>
      <div>
        <button type="submit" onClick={generateEmbedCode}>
          Generate Embed Code
        </button>
        {codeGenerated && (
          <div>
            <label htmlFor="embedcode" style={{ display: "block" }}>
              Copy and paste this code to embed the audio player:
            </label>
            <textarea
              id="embedCode"
              name="emebedCode"
              value={embedCode}
              readOnly
              rows={3}
              placeholder="none"
              style={{ width: "100%" }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default SingleProjectPage;
