import {
  Application,
  Container,
  FillGradient,
  Filter,
  Graphics,
  Renderer,
  RenderTexture,
  Sprite,
  Texture,
  TextureSource,
} from "pixi.js";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { CustomImage } from "@/interfaces/interface";
import { Points } from "@/interfaces/mask.interface";
import { applyFilters } from "./applyFilters";

interface createMaskProps {
  appRef: RefObject<Application<Renderer> | null>;
  isDrawing: boolean;
  setIsDrawing: Dispatch<SetStateAction<boolean>>;
  lastY: RefObject<number | null>;
  lastX: RefObject<number | null>;
  brushSize: number;
  temporarySpriteRef: RefObject<Sprite>;
  selectedImg: number;
  maskErase: boolean;
  brushRef: RefObject<Graphics | null>;
  maskTextureRef: RefObject<RenderTexture | null>;
  sharpness: number;
  selectedLayer: number | null;
  scale: number;
  spriteRef: RefObject<Sprite | null>;
  webglFilterRef: RefObject<Filter | null>;
  textureRef: RefObject<Texture<TextureSource<any>> | null>;
  image: CustomImage | undefined;
  renderSpriteRef: RefObject<Sprite | null>;
  appIsReady: boolean;
}

// Két stamp közti távolság a kefe sugarához képest (0.25 = az átmérő 12.5%-a)
const STAMP_SPACING = 0.25;
// A drága stage render maximális gyakorisága rajzolás közben
const PREVIEW_INTERVAL_MS = 120;

export const useMask = (props: createMaskProps) => {
  const appRef = props.appRef;
  const temporarySpriteRef = props.temporarySpriteRef;
  const image = props.image;

  const maskErase = props.maskErase;
  const renderTexture = props.maskTextureRef.current;
  const sharpness = props.sharpness ?? 0;
  const selectedLayer = props.selectedLayer ?? null;
  const scale = props.scale ?? 1;
  const brushSize = props.brushSize;
  const appIsReady = props.appIsReady;
  const renderSpriteRef = props.renderSpriteRef;

  const renderTextures = image?.renderTextures;
  const layer = renderTextures?.find((rt) => rt.id === selectedLayer);

  // Minden ref stabil a renderek között, így nem vesznek el a sorban álló pontok
  const pendingRef = useRef<Points[]>([]);
  const reqAnimFramId = useRef<null | number>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPreview = useRef(0);
  // setIsDrawing aszinkron, ezért a pointer eseményekhez szinkron jelző kell
  const drawingRef = useRef(false);
  const batchContainerRef = useRef<Container | null>(null);
  const spritePoolRef = useRef<Sprite[]>([]);
  const emptyContainerRef = useRef<Container | null>(null);

  const gradient = useMemo(
    () =>
      new FillGradient({
        type: "radial",
        center: { x: 0.5, y: 0.5 },
        innerRadius: 0,
        outerCenter: { x: 0.5, y: 0.5 },
        outerRadius: 0.5,
        colorStops: [
          { offset: 0, color: "rgba(255,255,255,1)" },
          { offset: sharpness, color: "#fff" },
          { offset: 1, color: "rgba(255,255,255,0)" },
        ],
        textureSpace: "local",
      }),
    [sharpness],
  );

  const brushTexture = useMemo(() => {
    if (!appRef.current) return undefined;

    const graph = new Graphics();
    graph.circle(0, 0, 100);
    graph.fill(gradient);
    const texture = appRef.current.renderer.generateTexture(graph);
    graph.destroy();

    return texture;
  }, [gradient, appIsReady]);

  const latestRef = useRef({
    selectedLayer,
    brushSize,
    maskErase,
    scale,
    image,
    layer,
    gradient,
    renderTexture,
    renderTextures,
    renderSpriteRef,
    isDrawing: props.isDrawing,
    temporarySpriteRef,
    brushTexture,
  });

  latestRef.current = {
    selectedLayer,
    brushSize,
    maskErase,
    scale,
    image,
    layer,
    gradient,
    renderTexture,
    renderTextures,
    renderSpriteRef,
    isDrawing: props.isDrawing,
    temporarySpriteRef,
    brushTexture,
  };

  //TODO: Még annyit lehetne hogy a kép ne teljese res-be legyen és a performance egész jó lehet

  // Az alapréteg (0) a globális szűrőké, arra nem lehet maszkot rajzolni
  function canDraw() {
    const layer = latestRef.current.selectedLayer;
    return layer !== null && layer !== 0;
  }

  // Stage koordináta -> kép koordináta leképezés a megjelenített fő sprite alapján
  // (skála + a sprite bal felső sarka a stage-en)
  function getMapping() {
    const sprite = props.spriteRef.current;

    if (!sprite || sprite.scale.x === 0)
      return { scale: latestRef.current.scale, offsetX: 0, offsetY: 0 };

    const scale = Math.abs(sprite.scale.x);

    return {
      scale,
      offsetX: sprite.x - sprite.width * sprite.anchor.x,
      offsetY: sprite.y - sprite.height * sprite.anchor.y,
    };
  }

  // A drága stage render legfeljebb PREVIEW_INTERVAL_MS-onként fut, a végén mindig lefut még egyszer
  function schedulePreview() {
    if (previewTimer.current !== null) return;

    const wait = Math.max(
      0,
      PREVIEW_INTERVAL_MS - (performance.now() - lastPreview.current),
    );

    previewTimer.current = setTimeout(() => {
      previewTimer.current = null;
      lastPreview.current = performance.now();

      if (appRef.current) appRef.current.renderer.render(appRef.current.stage);
    }, wait);
  }

  function cancelScheduled() {
    if (reqAnimFramId.current !== null) {
      cancelAnimationFrame(reqAnimFramId.current);
      reqAnimFramId.current = null;
    }

    if (previewTimer.current !== null) {
      clearTimeout(previewTimer.current);
      previewTimer.current = null;
    }
  }

  // A sorban álló pontokat egyetlen render hívással rajzolja a temporary textúrára
  function flushPending() {
    reqAnimFramId.current = null;

    const current = latestRef.current;
    const queue = pendingRef.current;

    if (queue.length === 0) return;

    if (!current.brushTexture || !appRef.current) {
      queue.length = 0;
      return;
    }

    if (!batchContainerRef.current) batchContainerRef.current = new Container();

    const container = batchContainerRef.current;
    const pool = spritePoolRef.current;
    const { scale, offsetX, offsetY } = getMapping();
    const brushScale = current.brushSize / scale / 100;

    // az előnézet sprite a kép méretű textúrát a megjelenített képre illeszti
    const preview = current.temporarySpriteRef.current;
    preview.scale.set(scale);
    preview.position.set(offsetX, offsetY);
    const blendMode = current.maskErase ? "erase" : "normal";

    for (let i = 0; i < queue.length; i++) {
      let sprite = pool[i];

      if (!sprite) {
        sprite = new Sprite();
        // a kefe közepe legyen az egér alatt
        sprite.anchor.set(0.5);
        pool[i] = sprite;
      }

      sprite.texture = current.brushTexture;
      sprite.position.set(
        (queue[i].x - offsetX) / scale,
        (queue[i].y - offsetY) / scale,
      );
      sprite.scale.set(brushScale);
      sprite.blendMode = blendMode;

      if (sprite.parent !== container) container.addChild(sprite);
    }

    // a removeChildren hibát dob, ha a tartomány üres
    if (container.children.length > queue.length)
      container.removeChildren(queue.length);
    queue.length = 0;

    appRef.current.renderer.render({
      container,
      target: current.temporarySpriteRef.current.texture,
      clear: false,
    });

    schedulePreview();
  }

  function requestFlush() {
    if (reqAnimFramId.current === null)
      reqAnimFramId.current = requestAnimationFrame(flushPending);
  }

  // A pontokat a kefe méretéhez igazított távolságonként rakja le, a köztes szakaszt interpolálja,
  // így a sűrű egér események nem generálnak felesleges stamp-eket, a gyors húzás pedig nem lyukas
  function addStroke(x: number, y: number) {
    const current = latestRef.current;
    const queue = pendingRef.current;
    const spacing = Math.max(1, current.brushSize * STAMP_SPACING);

    const lastX = props.lastX.current;
    const lastY = props.lastY.current;

    if (lastX === null || lastY === null) {
      queue.push({ x, y });
      props.lastX.current = x;
      props.lastY.current = y;
      return;
    }

    const dx = x - lastX;
    const dy = y - lastY;
    const dist = Math.hypot(dx, dy);

    if (dist < spacing) return;

    const steps = Math.floor(dist / spacing);
    const stepX = (dx / dist) * spacing;
    const stepY = (dy / dist) * spacing;

    for (let i = 1; i <= steps; i++)
      queue.push({ x: lastX + stepX * i, y: lastY + stepY * i });

    props.lastX.current = lastX + stepX * steps;
    props.lastY.current = lastY + stepY * steps;
  }

  const onPointerMove = (e: any) => {
    const localPos = e.global;

    if (!localPos || !drawingRef.current) return;
    if (!canDraw()) return;

    addStroke(localPos.x, localPos.y);

    if (pendingRef.current.length > 0) requestFlush();
  };

  const onPointerUp = () => {
    const current = latestRef.current;

    if (!drawingRef.current) return;

    drawingRef.current = false;
    props.setIsDrawing(false);
    props.lastX.current = null;
    props.lastY.current = null;

    cancelScheduled();
    flushPending();
    cancelScheduled();

    if (
      current.selectedLayer === null ||
      !current.renderTextures ||
      current.renderTextures.length <= 0 ||
      !appRef.current
    )
      return;

    const maskTex = current.renderTextures[current.selectedLayer]?.maskTexture;

    if (!maskTex) return;

    appRef.current?.renderer.render({
      container: current.temporarySpriteRef.current,
      target: maskTex,
      clear: false,
    });

    if (!emptyContainerRef.current) emptyContainerRef.current = new Container();

    appRef.current.renderer.render({
      container: emptyContainerRef.current,
      target: current.temporarySpriteRef.current.texture,
      clear: true,
    });

    applyFilters({
      renderSpriteRef: current.renderSpriteRef,
      spriteRef: props.spriteRef,
      startIndex: current.selectedLayer,
      image: current.image,
      appRef,
      textureRef: props.textureRef,
    });

    appRef.current?.renderer.render(appRef.current.stage);
  };

  const onPointerDown = (e: any) => {
    const localPos = e.global;

    if (!localPos) return;

    const current = latestRef.current;

    if (!canDraw()) return;

    drawingRef.current = true;
    props.setIsDrawing(true);

    props.lastX.current = null;
    props.lastY.current = null;

    if (current.layer?.filter && current.layer.maskTexture)
      current.layer.filter.resources.layer_mask =
        current.layer.maskTexture.source;

    addStroke(localPos.x, localPos.y);
    requestFlush();
  };

  useEffect(() => {
    const stage = appRef.current?.stage;
    if (!stage) return;

    stage.on("pointermove", onPointerMove);
    stage.on("pointerup", onPointerUp);
    stage.on("pointerupoutside", onPointerUp);
    stage.on("pointerdown", onPointerDown);

    return () => {
      stage.off("pointermove", onPointerMove);
      stage.off("pointerup", onPointerUp);
      stage.off("pointerupoutside", onPointerUp);
      stage.off("pointerdown", onPointerDown);

      cancelScheduled();
      pendingRef.current.length = 0;
    };
  }, [appIsReady]);
};
