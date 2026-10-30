import { App, ItemView, TFile, WorkspaceLeaf } from 'obsidian';
import Timeline from '../components/Timeline.svelte'
import { mount, unmount } from 'svelte';
import { getNotesData } from 'lib/fileService';
import { DEFAULT_SETTINGS } from '../settings';

export const VIEW_TYPE_TIMELINE = 'timeline-view';

export class TimelineView extends ItemView {
  // A variable to hold on to the Counter instance mounted in this ItemView.
  counter: ReturnType<typeof Timeline> | undefined;
  dateFormat: string;

  constructor(leaf: WorkspaceLeaf, app: App, dateFormat: string = DEFAULT_SETTINGS.dateFormat) {
    super(leaf);
    this.dateFormat = dateFormat;
  }

  getViewType() {
    return VIEW_TYPE_TIMELINE;
  }

  getDisplayText() {
    return 'Timeline view';
  }

  async onOpen() {
    await this.renderTimeline();

    this.registerEvent(
      this.app.metadataCache.on('changed', () => {
        void this.renderTimeline();
      })
    );
  }

  async renderTimeline() {
    const files = await getNotesData(this.app, this.dateFormat);

    if (this.counter) {
      await unmount(this.counter);
    }

    this.contentEl.empty();

    this.counter = mount(Timeline, {
      target: this.contentEl,
      props: {
        notes: files,
        onNoteClick: (path: string) => {
          const file = this.app.vault.getAbstractFileByPath(path);
          if (file instanceof TFile) {
            void this.app.workspace.getLeaf().openFile(file);
          }
        }
      }
    });
  }

  async onClose() {
    if (this.counter) {
      await unmount(this.counter);
    }
  }
}