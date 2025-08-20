"use client";
import { ChatGPTInterface } from "@/components/chatgpt-interface";
import PopUp from "@/components/pop-up";
import { useState } from "react";
import { SignedOut } from "@clerk/nextjs";

export default function Home() {
  const [showPopup, setShowPopup] = useState(true);

  return (
    <>
      <ChatGPTInterface />
      <SignedOut>
        <PopUp showPopup={showPopup} setShowPopup={setShowPopup} />
      </SignedOut>
    </>
  );
}
