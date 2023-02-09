import { App, PluginSettingTab, Setting } from 'obsidian';
import TiffViewObsidianPlugin from "./main";

export class TiffViewSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: TiffViewObsidianPlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for TIFF View Plugin' });

		// TODO: add settings
	}
}
