import { apiUrl } from "@/helper/api";
import { Box, IconButton, Input, Text } from "@chakra-ui/react";
import { useState } from "react";
import { LuUpload } from "react-icons/lu";

export default function PresetBlock() {
  const [presetValue, setPresetValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function usePreset() {
    const body = {
      preset_id: presetValue,
    };
    const formData = new FormData();

    formData.append("body", JSON.stringify(body));

    await fetch(apiUrl("/preset/load"), {
      method: "POST",
      body: formData,
    })
      .catch(() => null)
      .then(async (e) => {
        if (e && e.ok) {
          const res = (await e.json()) ?? null;
          console.log(res);
        }
      })
      .finally(() => setLoading(false));
  }

  return (
    <Box w={"full"} maxW={"300px"} minW={0}>
      <Input
        placeholder="Preset ID"
        value={presetValue}
        onChange={(e) => setPresetValue(e.target.value)}
        variant="outline"
      />
      <IconButton
        mt={"3"}
        w={"full"}
        variant={"surface"}
        colorPalette={"teal"}
        disabled={loading}
        onClick={() => {
          setLoading(true);
          usePreset();
        }}
      >
        <LuUpload /> <Text>Alkalmazás</Text>
      </IconButton>
    </Box>
  );
}
