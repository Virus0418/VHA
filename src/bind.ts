import { formatQuantity } from "./format";

export function openMoreInfo(host: HTMLElement, entityId: string) {
  if (!entityId) return;
  host.dispatchEvent(
    new CustomEvent("hass-more-info", {
      bubbles: true,
      composed: true,
      detail: { entityId },
    }),
  );
}

export function bindInfo(root: ParentNode, open: (entityId: string) => void) {
  root.querySelectorAll<HTMLElement>("[data-info]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.stopPropagation();
      open(el.dataset.info || "");
    });
  });
}

export function percentLabel(fraction: number): string {
  return formatQuantity(Math.round(Math.min(1, Math.max(0, fraction)) * 100), "%");
}

export function bindHorizontalSlider(
  slider: HTMLElement,
  options: {
    labelFor: (fraction: number) => string;
    commit: (fraction: number) => void;
    setDragging: (value: boolean) => void;
  },
) {
  if (slider.dataset.disabled === "true") return;
  const track = slider.querySelector<HTMLElement>(".htrack");
  if (!track) return;
  let dragging = false;
  const read = (clientX: number) => {
    const rect = track.getBoundingClientRect();
    const travel = Math.max(1, rect.width - 16);
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left - 8) / travel));
    slider.style.setProperty("--p", String(fraction));
    const label = slider.querySelector(".hpct");
    if (label) label.textContent = options.labelFor(fraction);
    slider.setAttribute("aria-valuenow", String(Math.round(fraction * 100)));
    return fraction;
  };
  slider.addEventListener("pointerdown", (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    dragging = true;
    options.setDragging(true);
    slider.setPointerCapture(ev.pointerId);
    read(ev.clientX);
  });
  slider.addEventListener("pointermove", (ev) => {
    if (!dragging) return;
    ev.stopPropagation();
    read(ev.clientX);
  });
  const finish = (ev: PointerEvent) => {
    if (!dragging) return;
    ev.stopPropagation();
    dragging = false;
    options.setDragging(false);
    options.commit(read(ev.clientX));
  };
  slider.addEventListener("pointerup", finish);
  slider.addEventListener("pointercancel", () => {
    if (!dragging) return;
    dragging = false;
    options.setDragging(false);
  });
  slider.addEventListener("keydown", (ev) => {
    if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
    ev.preventDefault();
    ev.stopPropagation();
    const current = Number(slider.style.getPropertyValue("--p") || "0");
    const next = Math.min(1, Math.max(0, current + (ev.key === "ArrowRight" ? 0.05 : -0.05)));
    slider.style.setProperty("--p", String(next));
    const label = slider.querySelector(".hpct");
    if (label) label.textContent = options.labelFor(next);
    options.commit(next);
  });
}
