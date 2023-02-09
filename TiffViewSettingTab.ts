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

		new Setting(containerEl)
			.setName("Cache Size (MB)")
			.setDesc("The size of the cache in megabytes. The default is 200 MB.")
			.addSlider((slider) =>
				slider
					.setLimits(0, 2000, 10)
					.setValue(this.plugin.settings.cacheMegaBytes)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.cacheMegaBytes = value;
						await this.plugin.saveSettings();
					}));
	}
}
