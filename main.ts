import { PluginSpec, ViewPlugin } from "@codemirror/view";
import { Plugin } from 'obsidian';

import { MinimalPlugin } from "ViewPluginBase";

import { DEFAULT_SETTINGS, TiffViewSettings } from './TiffViewSettings';
import { TiffViewSettingTab } from "./TiffViewSettingTab";
import { TiffViewViewPlugin } from "./TiffViewViewPlugin";
import { createTiffViewPostProcessor } from "./TiffViewMarkdownPostProcessor";
import { DataCache, DataCacheHost } from "DataCache";
import { createTiffViewStateField } from "TiffViewStateField";

export default class TiffViewObsidianPlugin extends Plugin implements MinimalPlugin, DataCacheHost  {
	settingsDirty: boolean;
	settings: TiffViewSettings;
	cache: DataCache;
	
	async onload() {
		await this.loadSettings();
		this.cache = new DataCache(this.settings);
		this.addSettingTab(new TiffViewSettingTab(this.app, this));
		this.registerTiffView();
		this.registerMarkdownPostProcessor(createTiffViewPostProcessor(this.app, this.cache));
	}

	onunload() {
		// no code
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		this.settingsDirty = true;
		await this.saveData(this.settings);
		this.app.workspace.updateOptions();
	}

	private registerTiffView() {
		const commandsSpec: PluginSpec<TiffViewViewPlugin> = {
			decorations: (value: TiffViewViewPlugin) => value.decorations,
		};
		const host: MinimalPlugin = this;
		const tiffView = ViewPlugin.fromClass(class extends TiffViewViewPlugin {
			getPlugin(): MinimalPlugin {
				return host;
			}
		}, commandsSpec);
		this.registerEditorExtension(tiffView);
		this.registerEditorExtension(createTiffViewStateField(this));
	}	
}


