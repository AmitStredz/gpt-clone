"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function PopUp({
  showPopup,
  setShowPopup,
}: {
  showPopup: boolean;
  setShowPopup: (showPopup: boolean) => void;
}) {
  const router = useRouter();
  const popupRef = useRef<HTMLDivElement | null>(null);

  // Close popup on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
      }
    }

    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowPopup(false);
      }
    }

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [showPopup, setShowPopup]);

  return (
    <div className="flex max-h-screen w-screen items-center justify-center bg-[#2f2f2f]">
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div
            ref={popupRef}
            className="bg-[#2f2f2f] rounded-2xl shadow-xl w-[400px] max-w-[90%] p-6 text-center"
          >
            <h2 className="text-white text-lg font-semibold mb-2">
              Welcome back
            </h2>
            <p className="text-gray-300 text-sm mb-6">
              Log in or sign up to get smarter responses, upload files and
              images, and more.
            </p>

            {/* Log in button */}
            <button
              className="w-full bg-white text-black font-medium py-2.5 rounded-full mb-3 hover:bg-gray-200 transition"
              onClick={() => {
                setShowPopup(false);
                router.push("/login");
              }}
            >
              Log in
            </button>

            {/* Sign up button */}
            <button
              className="w-full bg-[#2a2b2c] text-white font-medium py-2.5 rounded-full mb-4 hover:bg-[#38393a] transition border border-[#3d3e3f]"
              onClick={() => {
                setShowPopup(false);
                router.push("/sign-up");
              }}
            >
              Sign up for free
            </button>

            {/* Stay logged out link */}
            <button
              className="text-gray-400 text-sm hover:underline"
              onClick={() => setShowPopup(false)}
            >
              Stay logged out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
