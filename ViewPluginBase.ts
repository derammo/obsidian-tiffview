import { Decoration, DecorationSet, EditorView, PluginValue, ViewUpdate } from "@codemirror/view";
import { App, editorLivePreviewField } from "obsidian";

export interface MinimalPlugin {
	settingsDirty: boolean;
    app: App;
}

export abstract class ViewPluginBase<T extends MinimalPlugin> implements PluginValue {
    decorations: DecorationSet;

    constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
        if (!update.state.field(editorLivePreviewField)) {
            // live preview only, not rendered in strict source code view
            this.decorations = Decoration.none;
            return;
        }

        if (update.docChanged || update.viewportChanged || this.decorations === Decoration.none || this.getPlugin().settingsDirty) {
            this.decorations = this.buildDecorations(update.view);
            this.getPlugin().settingsDirty = false;
        }
    }

    destroy() { }

    abstract getPlugin(): T;

    abstract buildDecorations(view: EditorView): DecorationSet;
}
