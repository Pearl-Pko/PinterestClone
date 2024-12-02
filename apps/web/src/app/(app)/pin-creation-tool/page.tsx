"use client";
import "reflect-metadata";
import React, { FormEventHandler, useEffect, useState } from "react";
import { OpenSideNavIcon, ResetPinIcon } from "@web/public";
import CreatePost from "./CreatePost";
import SideNav from "./SideNav";

export default function page() {
  // console.log("submitted", submittedAt)
  const [selectedPostId, setSelectedPostId] = useState("");
  const [batchOperation, setBatchOperation] = useState(false);

  return (
    <div className="flex justify-center items-start h-full">
      <SideNav
        onSelectPost={(postId) => setSelectedPostId(postId)}
        selectedPostId={selectedPostId}
        onBatchOperation={setBatchOperation}
      />
      <CreatePost
        selectedPostId={selectedPostId}
        onPublish={() => setSelectedPostId("")}
        batchOperation={batchOperation}
      />
    </div>
  );
}
