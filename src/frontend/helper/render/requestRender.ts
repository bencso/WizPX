import { Application } from "pixi.js";

const pending = new WeakSet<Application>();

export function requestRender(app: Application | null | undefined) {
  if (!app || pending.has(app)) return;

  pending.add(app);

  requestAnimationFrame(() => {
    pending.delete(app);

    if (app.renderer && app.stage) app.renderer.render(app.stage);
  });
}
