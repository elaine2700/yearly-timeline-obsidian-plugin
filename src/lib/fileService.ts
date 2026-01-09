import { App, TFile, type FrontMatterCache } from "obsidian";
import type { NotesData } from "types/notesType";

async function getNotesData(app:App): Promise<NotesData[]>{
    const files = app.vault.getMarkdownFiles();
    let validNotes:NotesData[] = [];
    for (const file of files) {
        const extractedNote = await getNoteData(app, file);
        const fm = extractedNote.frontmatter as FrontMatterCache | undefined;

        // Must have frontmatter and startDate
        if (!fm || !fm.startDate) {
            continue;
        }
        const startDate = fm.startDate;
        const endDate = fm.endDate ?? startDate;

        validNotes.push({
            name: extractedNote.basename,
            startDate,
            endDate,
        });
    }
    return validNotes;
}

interface FileData {
    path:string;
    basename: string;
    frontmatter?: FrontMatterCache;
    content: string;
}

async function getNoteData(app:App, file: TFile): Promise<FileData> {
  const content = await app.vault.read(file);
  const cache = app.metadataCache.getFileCache(file);

  return {
    path: file.path,
    basename: file.basename,
    frontmatter: cache?.frontmatter ?? {},
    content
  };
}

export {getNotesData};

