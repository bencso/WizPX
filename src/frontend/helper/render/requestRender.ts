import { Application } from "pixi.js";

const pending = new WeakSet<Application>();

// A Pixi ticker le van állítva (performance), ezért a stage-et explicit kell kirenderelni.
// Egy képkockán belül több kérés is csak egy renderelést eredményez.
export function requestRender(app: Application | null | undefined) {
  if (!app || pending.has(app)) return;

  pending.add(app);

  requestAnimationFrame(() => {
    pending.delete(app);

    // a stage lehet, hogy közben megsemmisült (képváltás, unmount)
    if (app.renderer && app.stage) app.renderer.render(app.stage);
  });
}
