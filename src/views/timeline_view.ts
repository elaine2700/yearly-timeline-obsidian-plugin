import { ItemView, WorkspaceLeaf } from 'obsidian';

export const VIEW_TYPE_TIMELINE = 'timeline-view';

export class TimelineView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_TIMELINE;
  }

  getDisplayText() {
    return 'Timeline view';
  }

  async onOpen() {
    const timelineContainer = this.contentEl;
    timelineContainer.empty();
    timelineContainer.createEl('h4', { text: 'Timeline view', cls: 'timelineContainer' });
    const timeline = timelineContainer.createDiv({ text: 'timelineContainer', cls: 'timeline' });
  }

  async onClose() {
    // Nothing to clean up.
  }
}