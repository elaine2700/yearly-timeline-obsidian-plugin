import { Plugin, WorkspaceLeaf } from 'obsidian';
import { TimelineView, VIEW_TYPE_TIMELINE } from './views/timeline_view';
import { DEFAULT_SETTINGS, SampleSettingTab } from './settings';
import type { MyPluginSettings } from './settings';

export default class TimelinePlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    await this.loadSettings();
    this.registerTimelineView();

    this.addRibbonIcon('square-chart-gantt', 'Activate view', () => {
      this.activateView();
    });

    this.addSettingTab(new SampleSettingTab(this.app, this));
  }

  async onunload() {
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async activateView() {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_TIMELINE);

    if (leaves.length > 0) {
      // A leaf with our view already exists, use that
      leaf = leaves[0] ?? null;
    } else {
      // Our view could not be found in the workspace, create a new leaf
      // in the right sidebar for it
      const rightLeaf = workspace.getRightLeaf(false);
      if (rightLeaf) {
        leaf = rightLeaf;
        await leaf.setViewState({ type: VIEW_TYPE_TIMELINE, active: true });
      }
    }

    // "Reveal" the leaf in case it is in a collapsed sidebar
    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }


  private registerTimelineView() {
    this.registerView(
      VIEW_TYPE_TIMELINE,
      (leaf) => new TimelineView(leaf, this.app)
    );
  }
}