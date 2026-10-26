import { minMaxValidation } from "@/helper/errorHelper";
import { useWorkSession } from "@/providers/sessionprovider";
import { useSessionStore } from "@/stores/sessionData";
import {
  Box,
  Button,
  ColorPicker,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  NumberInput,
  parseColor,
  Portal,
  RadioCard,
  ScrollArea,
  Tabs,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaPinterest } from "react-icons/fa";
import { LuFacebook, LuInstagram, LuUpload, LuX } from "react-icons/lu";
import { shallow } from "zustand/shallow";

export default function PresetBlock() {
  const {
    setExpandMode,
    setExpandBackground,
    setExpandSize,
    setCropSave,
    setCropBox,
  } = useSessionStore();
  const {
    appRef,
    spriteRef,
    textureRef,
    workPlaceRef,
    selectedImg,
    imageScale,
    canvasRef,
    selectedScale,
  } = useWorkSession();

  const [presetValue, setPresetValue] = useState<string>("");

  return (
    <Box w={"full"} maxW={"300px"} minW={0}>
      <Input
        placeholder="Preset ID"
        value={presetValue}
        onChange={(e) => setPresetValue(e.target.value)}
        variant="outline"
      />
      <IconButton variant={"ghost"} onClick={() => {}}>
        <LuUpload /> <Text>Alkalmazás</Text>
      </IconButton>
    </Box>
  );
}
