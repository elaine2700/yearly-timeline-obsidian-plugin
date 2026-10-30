import { App, TFile, type FrontMatterCache } from "obsidian";
import type { NotesData } from "types/notesType";
import { DEFAULT_SETTINGS } from "../settings";

async function getNotesData(
    app: App,
    dateFormat: string = DEFAULT_SETTINGS.dateFormat
): Promise<NotesData[]> {
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
            startDate = normalizeDate(fm.startDate, dateFormat);
            if (!fm.endDate) {
                status = "in-progress";
                endDate = new Date();
            } else {
                status = "done";
                endDate = normalizeDate(fm.endDate, dateFormat);
            }
        } catch (err) {
            console.warn(
                `[Timeline Plugin] Skipping note "${extractedNote.basename}":`,
                err
            );
            continue;
        }

        validNotes.push({
            name: (fm.name && typeof fm.name === 'string') ? fm.name : extractedNote.basename,
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

const normalizeDate = (
    value: unknown,
    dateFormat: string = DEFAULT_SETTINGS.dateFormat
): Date => {
    if (value instanceof Date) {
        return value;
    }

    if (typeof value !== "string") {
        throw new Error(`Invalid date type: ${typeof value}`);
    }

    const tokens: ("yyyy" | "mm" | "dd")[] = [];
    const regexStr = dateFormat
        .toLowerCase()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/yyyy|mm|dd/g, (token) => {
            tokens.push(token as "yyyy" | "mm" | "dd");
            return token === "yyyy" ? "(\\d{4})" : "(\\d{2})";
        });

    const match = value.trim().match(new RegExp(`^${regexStr}$`));
    if (!match || tokens.length !== 3) {
        throw new Error(`Invalid date format: ${value} (expected ${dateFormat})`);
    }

    const parts: Record<"yyyy" | "mm" | "dd", number> = {
        yyyy: 0,
        mm: 0,
        dd: 0,
    };
    tokens.forEach((token, index) => {
        parts[token] = Number(match[index + 1]);
    });

    const day = parts.dd;
    const month = parts.mm - 1; // JS Date months are 0-based
    const year = parts.yyyy;

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

