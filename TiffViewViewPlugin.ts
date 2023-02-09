import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, WidgetType } from "@codemirror/view";
import { App } from "obsidian";
import { buildTiffView } from "./TiffViewHTML";
import { MinimalPlugin, ViewPluginBase } from "./ViewPluginBase";

export abstract class TiffViewViewPlugin extends ViewPluginBase<MinimalPlugin> {
    buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
		const syntax = syntaxTree(view.state);
        const app: App = (this.getPlugin() as MinimalPlugin).app
		for (let { from, to } of view.visibleRanges) {
			syntax.iterate({
				from,
				to,
				enter(scannedNode) {
					switch (scannedNode.type.name) {
                        case "inline-code": 
                        case "inline-code_quote_quote-1":                            
                            const content = view.state.doc.sliceString(scannedNode.from, scannedNode.to);
                            if (content.startsWith("!tiff ")) {
                                builder.add(scannedNode.from-1, scannedNode.to + 1, Decoration.widget({ widget: new TiffViewWidget(app, content.slice(6)) }));
                            }
                            break;
					}
				},
			});
		}
		return builder.finish();
    }
}

class TiffViewWidget extends WidgetType {
    constructor(private app: App, private localPath: string) {
        super();
    }

    toDOM(_view: EditorView) {
        return buildTiffView(this.app, this.localPath);
    }
}

