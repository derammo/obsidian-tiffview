import { syntaxTree } from "@codemirror/language";
import { EditorState, Extension, RangeSetBuilder, StateField, Transaction } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { SyntaxNode, SyntaxNodeRef } from "@lezer/common";
import { DataCacheHost } from "DataCache";
import { editorLivePreviewField } from "obsidian";
import { TiffViewWidget } from "TiffViewViewPlugin";
import { MinimalPlugin } from "ViewPluginBase";

export function createTiffViewStateField(host: MinimalPlugin): StateField<DecorationSet> {
    return StateField.define<DecorationSet>({
        create(state): DecorationSet {
            if (state.doc.length < 1) {
                // document is empty, no need to scan it (this happens every time on initialization)
                return Decoration.none;
            }
            if (!state.field(editorLivePreviewField)) {
                // source mode
                return Decoration.none;
            }
            const builder = new RangeSetBuilder<Decoration>();
            walkTree(host, builder, state);
            return builder.finish();
        },

        update(oldState: DecorationSet, transaction: Transaction): DecorationSet {
            if (!transaction.state.field(editorLivePreviewField)) {
                // source mode
                return Decoration.none;
            }
            const builder = new RangeSetBuilder<Decoration>();
            if (!transaction.docChanged) {
                // document not changed and we have already scannned it initially
                return oldState;
            }
            walkTree(host, builder, transaction.state);
            return builder.finish();
        },

        provide(field: StateField<DecorationSet>): Extension {
            return EditorView.decorations.from(field);
        },
    });
}

function walkTree(host: MinimalPlugin, builder: RangeSetBuilder<Decoration>, state: EditorState) {
    let imageStart: SyntaxNode | null = null;
    let altText: SyntaxNode | null = null;
    syntaxTree(state).iterate({
        enter(scannedNode) {
            let extraTrailer: number = 0;
            traceNode(state, scannedNode);
            switch (scannedNode.type.name) {
                case "formatting_formatting-image_image_image-marker":
                case "formatting-embed_formatting-link_formatting-link-start":
                    imageStart = scannedNode.node;
                    break;
                case "image_image-alt-text_link":
                    altText = scannedNode.node;
                    break;
                case "hmd-embed_hmd-internal-link":
                    extraTrailer = 1;
                    // fall through
                case "string_url":
                    if (imageStart === null) {
                        break;
                    };
                    console.log(`replacing ${imageStart.from}..${scannedNode.to + 1 + extraTrailer} with TiffViewWidget`);
                    const localPath = state.doc.sliceString(scannedNode.from, scannedNode.to);

                    // precise replace not working: all sorts of stuff from failed embed showing up, also only shows up when editing the
                    // tag, because the core apparently modifies the tree when touching it
                    builder.add(imageStart.from, scannedNode.to + 1 + extraTrailer, Decoration.replace({ widget: new TiffViewWidget(app, (host as DataCacheHost).cache, localPath) }));

                    // for testing, just insert
                    // builder.add(scannedNode.to + 1 + extraTrailer, scannedNode.to + 1 + extraTrailer, Decoration.widget({ widget: new TiffViewWidget(app, (host as DataCacheHost).cache, localPath) }));

                    // for testing, try to just erase the original
                    // builder.add(imageStart.from, scannedNode.to + 2 + extraTrailer, Decoration.replace({ }));
                    break;
                default:
                    if (!scannedNode.type.name.startsWith("formatting_")) {
                        // reset
                        imageStart = null;
                        altText = null;
                    }
            }
        },
    });
}

function traceNode(state: EditorState, scannedNode: SyntaxNodeRef | null) {
    if (scannedNode === null) {
        console.log(`TIFF_VIEW null`);
        return;
    }
    console.log(`TIFF_VIEW ${scannedNode!.type?.name} at [${scannedNode!.from}, ${scannedNode!.to}] '${state.doc.sliceString(scannedNode!.from, scannedNode!.to)}'`);
}      
