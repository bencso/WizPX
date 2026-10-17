import { UPLOAD_ACCEPTED_FILES } from "@/interfaces/upload.interface";
import { useFileUpload } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";

export const uploadCopyrightImage = (
  saveCopyrightImage: (id: number, blob: ArrayBuffer, mimeType?: string) => void,
  selectedImg: number,
) => {
  return useFileUpload({
    maxFiles: 1,
    accept: UPLOAD_ACCEPTED_FILES.join(","),
    onFileReject(details) {
      if (details.files.length > 0) {
        toaster.create({
          title: "Hiba történt feltöltés közben!",
          description: `Maximum 1 fájlt tölthetsz fel.`,
          type: "error",
        });
      }
      return (details.files = []);
    },
    onFileAccept(details) {
      if (details.files.length > 0) {
        const file = details.files[0];

        // az eredeti MIME típus megőrzése (PNG átlátszósága, JPG stb.)
        file
          .arrayBuffer()
          .then((buffer) => saveCopyrightImage(selectedImg, buffer, file.type));
      }
    },
  });
};
