import { App, PluginSettingTab, Setting } from "obsidian";
import MyPlugin from "./main";

export const DATE_FORMAT = 'yyyy-mm-dd';

export interface TimelineSettings {
	mySetting: string;
	dateFormat: string;
}

export const DEFAULT_SETTINGS: TimelineSettings = {
	mySetting: 'default',
	dateFormat: DATE_FORMAT
}

export class TimelineSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Settings #1')
			.setDesc('Coming soon...')
			.addText(text => text
				.setPlaceholder('Coming soon...')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
