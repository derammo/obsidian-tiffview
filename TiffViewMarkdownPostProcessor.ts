import { App, MarkdownPostProcessor, MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";
import { buildTiffView } from "./TiffViewHTML";

export function createTiffViewPostProcessor(app: App): MarkdownPostProcessor {
    return (element: HTMLElement, context: MarkdownPostProcessorContext): Promise<any> | void => {
        const codeblocks = element.querySelectorAll("code");

        for (let index = 0; index < codeblocks.length; index++) {
            const codeblock = codeblocks.item(index);
            const text = codeblock.innerText.trim();
            if (text.startsWith("!tiff ")) {
                context.addChild(new TiffViewMarkdownRenderer(app, codeblock, text.slice(6)));
            }
        }
    }
}

export class TiffViewMarkdownRenderer extends MarkdownRenderChild {
    constructor(private app: App, containerEl: HTMLElement, private path: string) {
        super(containerEl);
    }

    onload() {
        this.containerEl.replaceWith(buildTiffView(this.app, this.path));
    }
}
