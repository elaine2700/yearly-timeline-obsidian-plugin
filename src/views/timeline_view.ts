import { App, ItemView, Vault, WorkspaceLeaf } from 'obsidian';
import Timeline from '../components/Timeline.svelte'
import { mount, unmount } from 'svelte';
import { getNotesData } from 'lib/fileService';

export const VIEW_TYPE_TIMELINE = 'timeline-view';

export class TimelineView extends ItemView {
  // A variable to hold on to the Counter instance mounted in this ItemView.
  counter: ReturnType<typeof Timeline> | undefined;

  constructor(leaf: WorkspaceLeaf, app:App) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_TIMELINE;
  }

  getDisplayText() {
    return 'Timeline view';
  }

  async onOpen() {
    const files = await getNotesData(this.app)
    // Attach the Svelte component to the ItemViews content element and provide the needed props.
    this.counter = mount(Timeline, {
      target: this.contentEl,
      props: {
        notes: files
      }
    });

    // Since the component instance is typed, the exported `increment` method is known to TypeScript.
    //this.counter.increment();
  }

  async onClose() {
    if (this.counter) {
      // Remove the Counter from the ItemView.
      unmount(this.counter);
    }
  }
}