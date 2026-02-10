import { App, TFile, type FrontMatterCache } from "obsidian";
import type { NotesData } from "types/notesType";

async function getNotesData(app: App): Promise<NotesData[]> {
    const files = app.vault.getMarkdownFiles();
    let validNotes: NotesData[] = [];
    for (const file of files) {
        const extractedNote = await getNoteData(app, file);
        const fm = extractedNote.frontmatter;

        // Must have frontmatter and startDate
        if (!fm || !fm.startDate) {
            continue;
        }

        // Rules to get status:
        // no startDate -> todo (Skipped, since we only process notes with startDate at line 12)
        // startDate, no endDate -> in-progress, display endDate as today
        // startDate, endDate -> done

        let status: "todo" | "in-progress" | "done" = "done";
        let startDate: Date;
        let endDate: Date;

        try {
            startDate = normalizeDate(fm.startDate);
            if (!fm.endDate) {
                status = "in-progress";
                endDate = new Date();
            } else {
                status = "done";
                endDate = normalizeDate(fm.endDate);
            }
        } catch (err) {
            console.warn(
                `[Timeline Plugin] Skipping note "${extractedNote.basename}":`,
                err
            );
            continue;
        }

        validNotes.push({
            name: extractedNote.basename,
            path: extractedNote.path,
            startDate,
            endDate,
            category: typeof fm.category === 'string' ? fm.category : undefined,
            status,
        });
    }
    return validNotes;
}

interface FileData {
    path: string;
    basename: string;
    frontmatter?: FrontMatterCache;
    content: string;
}

async function getNoteData(app: App, file: TFile): Promise<FileData> {
    const content = await app.vault.read(file);
    const cache = app.metadataCache.getFileCache(file);

    return {
        path: file.path,
        basename: file.basename,
        frontmatter: cache?.frontmatter ?? {},
        content
    };
}

const normalizeDate = (value: unknown): Date => {
    if (value instanceof Date) {
        return value;
    }

    if (typeof value !== "string") {
        throw new Error(`Invalid date type: ${typeof value}`);
    }

    // Expected format: dd/MM/YYYY
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) {
        throw new Error(`Invalid date format: ${value}`);
    }

    const [, dd, mm, yyyy] = match;

    const day = Number(dd);
    const month = Number(mm) - 1; // JS Date months are 0-based
    const year = Number(yyyy);

    const date = new Date(year, month, day);

    // Validate that the date did not overflow (e.g. 31/02/2024)
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month ||
        date.getDate() !== day
    ) {
        throw new Error(`Invalid calendar date: ${value}`);
    }

    return date;
};


export { getNotesData };

