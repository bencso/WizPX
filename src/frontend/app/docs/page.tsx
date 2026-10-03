"use client";

import { LeftSide } from "@/components/sidebar/leftside";
import {
  Accordion,
  Alert,
  Badge,
  Box,
  Card,
  Code,
  Flex,
  Heading,
  HStack,
  Icon,
  Kbd,
  List,
  SimpleGrid,
  Span,
  Stack,
  Steps,
  Table,
  Tabs,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  LuBookOpen,
  LuCheck,
  LuCircleHelp,
  LuDownload,
  LuKeyboard,
  LuLayoutDashboard,
  LuList,
  LuRocket,
  LuVenetianMask,
} from "react-icons/lu";
import {
  exportOptions,
  faq,
  layoutParts,
  maskSteps,
  menuGuides,
  mouseActions,
  shortcuts,
  uploadSteps,
} from "./guideContent";

const tabs = [
  { value: "start", label: "Első lépések", icon: <LuRocket /> },
  { value: "layout", label: "Felület", icon: <LuLayoutDashboard /> },
  { value: "menu", label: "Menüpontok", icon: <LuList /> },
  { value: "mask", label: "Maszkolás", icon: <LuVenetianMask /> },
  { value: "shortcuts", label: "Billentyűk és egér", icon: <LuKeyboard /> },
  { value: "export", label: "Exportálás", icon: <LuDownload /> },
  { value: "faq", label: "Gyakori kérdések", icon: <LuCircleHelp /> },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack gap={4} py={4}>
      <Heading size="lg">{title}</Heading>
      {children}
    </Stack>
  );
}

function StepList({ items }: { items: { title: string; description: string }[] }) {
  return (
    <Steps.Root variant={"subtle"} orientation="vertical"  count={items.length} linear={false} defaultStep={-1}>
      <Steps.List>
        {items.map((step, index) => (
          <Steps.Item key={step.title} index={index} title={step.title}>
            <Steps.Indicator>
              <Steps.Status complete={<LuCheck />} incomplete={<Steps.Number />} current={<Steps.Number />} />
            </Steps.Indicator>
            <Box pb={4}>
              <Steps.Title>{step.title}</Steps.Title>
              <Text color="fg.muted" fontSize="sm" mt={1}>
                {step.description}
              </Text>
            </Box>
            <Steps.Separator />
          </Steps.Item>
        ))}
      </Steps.List>
    </Steps.Root>
  );
}

export default function DocsPage() {
  const isMd = useBreakpointValue(
    { base: false, sm: false, md: false, lg: true, xl: true },
    { fallback: "md" },
  );

  return (
    <Flex h="100vh" direction={isMd ? "row" : "column"} w="full">
      <LeftSide />
      <Box flex={1} minH={0} overflowY="auto" bg="bg.muted/30">
        <Box maxW="1100px" mx="auto" p={{ base: 4, md: 8 }}>
          <HStack gap={3} mb={2}>
            <Icon size="xl" color="teal.fg">
              <LuBookOpen />
            </Icon>
            <Heading size="3xl">WizPX útmutató</Heading>
          </HStack>
          <Text color="fg.muted" mb={6}>
            Minden, amit a szerkesztő használatához tudni kell: a felület részei, a menüpontok,
            a billentyűparancsok és az exportálás.
          </Text>

          <Tabs.Root defaultValue="start" colorPalette="teal" variant="subtle" lazyMount>
            <Tabs.List flexWrap="wrap" rounded="l3" p={1} bg="bg.subtle">
              {tabs.map((tab) => (
                <Tabs.Trigger key={tab.value} value={tab.value} rounded="l2">
                  {tab.icon}
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <Tabs.Content value="start">
              <Section title="Első lépések">
                <StepList items={uploadSteps} />
                <Alert.Root status="info" variant="subtle">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>A munkamenet a böngészőben él</Alert.Title>
                    <Alert.Description>
                      A szerkesztések nincsenek elmentve. Az oldal frissítése vagy az Újrakezdés
                      törli őket, ezért előtte exportáld az elkészült képeket.
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              </Section>
            </Tabs.Content>

            <Tabs.Content value="layout">
              <Section title="A felület részei">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  {layoutParts.map((part) => (
                    <Card.Root key={part.name} variant="outline">
                      <Card.Header>
                        <Card.Title>{part.name}</Card.Title>
                      </Card.Header>
                      <Card.Body>
                        <Text color="fg.muted" fontSize="sm">
                          {part.description}
                        </Text>
                      </Card.Body>
                    </Card.Root>
                  ))}
                </SimpleGrid>
              </Section>
            </Tabs.Content>

            <Tabs.Content value="menu">
              <Section title="Menüpontok">
                <Text color="fg.muted">
                  A szerkesztő jobb oldali menüjének funkciói. Kattints egy sorra a részletekért.
                </Text>
                <Accordion.Root collapsible multiple variant="enclosed">
                  {menuGuides.map((menu) => (
                    <Accordion.Item key={menu.name} value={menu.name}>
                      <Accordion.ItemTrigger>
                        <Icon color="teal.fg">{menu.icon}</Icon>
                        <Box flex="1">
                          <Text fontWeight="semibold">{menu.name}</Text>
                          <Text color="fg.muted" fontSize="sm">
                            {menu.summary}
                          </Text>
                        </Box>
                        <Accordion.ItemIndicator />
                      </Accordion.ItemTrigger>
                      <Accordion.ItemContent>
                        <Accordion.ItemBody>
                          <List.Root gap={2} ps={5} fontSize="sm">
                            {menu.details.map((detail) => (
                              <List.Item key={detail}>{detail}</List.Item>
                            ))}
                          </List.Root>
                        </Accordion.ItemBody>
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
              </Section>
            </Tabs.Content>

            <Tabs.Content value="mask">
              <Section title="Maszkolás részletesen">
                <Text color="fg.muted">
                  A maszkolás lehetővé teszi, hogy egy szűrő csak a kép egy részére hasson. A
                  szerkesztés rétegekre épül: minden réteghez saját szűrők és saját maszk tartozik.
                </Text>
                <StepList items={maskSteps} />
                <Alert.Root status="warning" variant="subtle">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>A 0. réteg (Kép) nem rajzolható</Alert.Title>
                    <Alert.Description>
                      A 0. réteg a teljes képre ható alapréteg. Maszkot csak az új rétegeken lehet
                      rajzolni.
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
                <Table.Root size="sm" variant="outline" rounded="l2">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Beállítás</Table.ColumnHeader>
                      <Table.ColumnHeader>Hatás</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell>
                        <Badge colorPalette="teal">Draw</Badge>
                      </Table.Cell>
                      <Table.Cell>A rajzolt terület bekerül a maszkba, itt érvényesül a réteg szűrője.</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>
                        <Badge colorPalette="red">Erase</Badge>
                      </Table.Cell>
                      <Table.Cell>A rajzolt terület kikerül a maszkból.</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>Ecset mérete</Table.Cell>
                      <Table.Cell>Az ecset sugara a képernyőn.</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>Ecset átmente</Table.Cell>
                      <Table.Cell>Az ecset szélének puhasága: kisebb érték élesebb, nagyobb érték lágyabb átmenetet ad.</Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table.Root>
              </Section>
            </Tabs.Content>

            <Tabs.Content value="shortcuts">
              <Section title="Billentyűparancsok">
                <Table.Root size="sm" variant="outline" rounded="l2">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Billentyű</Table.ColumnHeader>
                      <Table.ColumnHeader>Művelet</Table.ColumnHeader>
                      <Table.ColumnHeader>Hol működik</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {shortcuts.map((shortcut) => (
                      <Table.Row key={shortcut.keys.join("+")}>
                        <Table.Cell>
                          <HStack gap={1}>
                            {shortcut.keys.map((key, index) => (
                              <Span key={key}>
                                {index > 0 && <Span mx={1}>+</Span>}
                                <Kbd>{key}</Kbd>
                              </Span>
                            ))}
                          </HStack>
                        </Table.Cell>
                        <Table.Cell>{shortcut.description}</Table.Cell>
                        <Table.Cell color="fg.muted">{shortcut.where}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Section>
              <Section title="Egér">
                <Table.Root size="sm" variant="outline" rounded="l2">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Művelet</Table.ColumnHeader>
                      <Table.ColumnHeader>Hatás</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {mouseActions.map((item) => (
                      <Table.Row key={item.action}>
                        <Table.Cell fontWeight="medium">{item.action}</Table.Cell>
                        <Table.Cell>{item.description}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Section>
            </Tabs.Content>

            <Tabs.Content value="export">
              <Section title="Exportálás">
                <Text color="fg.muted">
                  Az <Code>Exportálás</Code> gomb a jobb oldali menü alján található. A kép
                  előállítása a szerveren történik a beállított szűrőkkel, LUT-tal, maszkokkal,
                  szövegekkel, overlay képpel és kerettel.
                </Text>
                <Table.Root size="sm" variant="outline" rounded="l2">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Beállítás</Table.ColumnHeader>
                      <Table.ColumnHeader>Leírás</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {exportOptions.map((option) => (
                      <Table.Row key={option.name}>
                        <Table.Cell fontWeight="medium">{option.name}</Table.Cell>
                        <Table.Cell>{option.description}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Section>
            </Tabs.Content>

            <Tabs.Content value="faq">
              <Section title="Gyakori kérdések">
                <Accordion.Root collapsible variant="enclosed">
                  {faq.map((item) => (
                    <Accordion.Item key={item.question} value={item.question}>
                      <Accordion.ItemTrigger>
                        <Span flex="1" fontWeight="medium">
                          {item.question}
                        </Span>
                        <Accordion.ItemIndicator />
                      </Accordion.ItemTrigger>
                      <Accordion.ItemContent>
                        <Accordion.ItemBody>
                          <Text fontSize="sm" color="fg.muted">
                            {item.answer}
                          </Text>
                        </Accordion.ItemBody>
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
              </Section>
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      </Box>
    </Flex>
  );
}
