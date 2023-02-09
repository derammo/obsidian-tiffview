import { App, TFile } from "obsidian";
import { DataCache } from "./DataCache";

// don't have matching symbols for this
// REVISIT: the npm version of this that we are using is ancient, should consider using directly from repo
const UTIF = require("utif");

export function buildTiffView(app: App, cache: DataCache, localPath: string): HTMLElement {
    const container = document.createElement("span");
    container.classList.add("tiff-view-container");
    const image = document.createElement("img");
    image.classList.add("tiff-view");
    const localFile = app.vault.getAbstractFileByPath(localPath);

    if (localFile === null) {
        // TODO add some error display to container 
        return container;
    }
    if (!(localFile instanceof TFile)) {
        // TODO add some error display to container 
        return container;
    }
    if (cache.has(localPath)) {
        image.src = cache.get(localPath)!;
        container.appendChild(image);
        return container;
    }

    // TODO: make this load in background (async) and then update the view when the image is available
    app.vault.readBinary(localFile)
    .then(decodeImage)
    .then(convertToRGBA8)
    .then(renderOnCanvas)
    .then((rendered: HTMLCanvasElement) => {
        image.src = rendered.toDataURL();
        cache.set(localPath, image.src);
        container.appendChild(image);
        // TODO modifying the DOM after we have returned it is probably not allowed we will need to async load and then notify view to refresh later, debounce
    });
    return container;
}

function decodeImage(raw: ArrayBuffer): any {
    // NOTE: this code is lifted from UTIF._imgLoaded, which is why it is in this style
    const ifds = UTIF.decode(raw);
    let vsns = ifds;
    let ma = 0;
    let page = vsns[0];
    if (ifds[0].subIFD) {
        vsns = vsns.concat(ifds[0].subIFD);
    }
    for (let i = 0; i < vsns.length; i++) {
        const img = vsns[i];
        if (img["t258"] == null || img["t258"].length < 3) {
            continue;
        }
        var ar = img["t256"] * img["t257"];
        if (ar > ma) {
            ma = ar;
            page = img;
        }
    }
    UTIF.decodeImage(raw, page, ifds);
    return page;
}

function convertToRGBA8(page: any): { page: any, rgba: Uint8Array } {
    return { page: page, rgba: UTIF.toRGBA8(page) };
}

function renderOnCanvas(converted: { page: any, rgba: Uint8Array }): HTMLCanvasElement {
    // NOTE: this code is lifted from UTIF._imgLoaded, which is why it is in this style
    const canvas = document.createElement("canvas");
    canvas.width = converted.page.width;
    canvas.height = converted.page.height;
    const canvas2D = canvas.getContext("2d");
    const imageData = canvas2D!.createImageData(converted.page.width, converted.page.height);
    for (var i = 0; i < converted.rgba.length; i++) {
        // Uint8Array into Uint8ClampedArray
        imageData.data[i] = converted.rgba[i];
    }
    canvas2D!.putImageData(imageData, 0, 0);
    return canvas;
}
