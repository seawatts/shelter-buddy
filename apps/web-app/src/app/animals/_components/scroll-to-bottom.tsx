"use client";

import { useEffect } from "react";

interface ScrollToBottomProps {
  children: React.ReactNode;
}

export function ScrollToBottom({ children }: ScrollToBottomProps) {
  useEffect(() => {
    window.scrollTo({
      behavior: "instant",
      top: document.documentElement.scrollHeight,
    });
  }, []);

  return children;
}
