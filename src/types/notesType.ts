interface NotesData {
    name: string;
    path: string;
    startDate: Date,
    endDate: Date,
    category?: string,
    status: 'todo' | 'in-progress' | 'done'
}

export { type NotesData };
