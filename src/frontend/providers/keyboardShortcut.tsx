"use client";

import { UseKeyboardShortcutArgs } from "@/interfaces/keyboardShortcut.interface";
import { useEffect } from "react";

export function useKeyboardShortcut({
  key,
  onKeyPressed,
  disabled = false,
}: UseKeyboardShortcutArgs) {
  useEffect(() => {
    if (disabled) return;

    function keyDownHandler(e: KeyboardEvent) {
      const target = e.target;

      if (!(target instanceof HTMLElement)) return;
      if (
        target.tagName.toLowerCase() === "input" ||
        target.tagName.toLowerCase() === "textarea"
      )
        return;
      if (target.isContentEditable) return;

      if (e.key === key) {
        e.preventDefault();
        onKeyPressed();
      }
    }

    window.addEventListener("keydown", keyDownHandler);
    return () => {
      window.removeEventListener("keydown", keyDownHandler);
    };
  }, [key, onKeyPressed, disabled]);
}
