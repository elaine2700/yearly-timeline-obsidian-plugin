<script lang="ts">
	// TODO: (Optional) On settings set a folder path, where only notes inside will be included
	// TODO: Publish
	import { type NotesData } from "types/notesType";

	interface Props {
		notes: NotesData[];
		onNoteClick?: (path: string) => void;
	}
	let { notes, onNoteClick }: Props = $props();

	let currentYear = $state(new Date().getFullYear());

	const availableYears = Array.from(
		{ length: 11 },
		(_, i) => currentYear - i,
	);

	interface Year {
		months: Month[];
	}
	interface Month {
		name: string;
		days: number;
	}

	const isLeapYear = (year: number) => {
		return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	};

	const year: Year = $derived({
		months: [
			{ name: "January", days: 31 },
			{ name: "February", days: isLeapYear(currentYear) ? 29 : 28 },
			{ name: "March", days: 31 },
			{ name: "April", days: 30 },
			{ name: "May", days: 31 },
			{ name: "June", days: 30 },
			{ name: "July", days: 31 },
			{ name: "August", days: 31 },
			{ name: "September", days: 30 },
			{ name: "October", days: 31 },
			{ name: "November", days: 30 },
			{ name: "December", days: 31 },
		],
	});

	const calculateMonthRowNumber = (monthNumber: number) => {
		let totalDays = 0;
		for (let i = 0; i < monthNumber; i++) {
			const month = year.months[i];
			if (month == undefined || month == null) {
				break;
			}
			totalDays = totalDays + month.days;
		}
		return totalDays + 1;
	};

	interface NodePosition {
		column: number;
		rowStart: number;
		rowEnd: number;
	}

	const getDayOfYear = (date: Date): number => {
		const monthIndex = date.getMonth(); // 0-based
		const dayOfMonth = date.getDate(); // 1-based

		let daysBeforeMonth = 0;
		for (let i = 0; i < monthIndex; i++) {
			const month = year.months[i];
			if (month == undefined || month == null) {
				break;
			}
			daysBeforeMonth += month.days;
		}
		return daysBeforeMonth + dayOfMonth;
	};

	let timelineData = $derived.by(() => {
		const filteredNotes = notes.filter(
			(note) => note.startDate.getFullYear() === currentYear,
		);

		const sortedNotes = filteredNotes
			.map((note) => ({
				...note,
				rowStart: getDayOfYear(note.startDate),
				rowEnd: getDayOfYear(note.endDate),
			}))
			.sort((a, b) => a.rowStart - b.rowStart);

		const lastOccupiedRowPerColumn: { [key: number]: number } = {
			3: 0,
			4: 0,
			5: 0,
			6: 0,
			7: 0,
		};

		let maxColumnUsed = 3;

		const processedNodes = sortedNotes.map((note) => {
			let assignedColumn = 3;
			for (let col = 3; col <= 7; col++) {
				const lastRow = lastOccupiedRowPerColumn[col] ?? 0;
				if (note.rowStart > lastRow) {
					assignedColumn = col;
					break;
				}
				assignedColumn = col;
			}
			lastOccupiedRowPerColumn[assignedColumn] = note.rowEnd;
			if (assignedColumn > maxColumnUsed) maxColumnUsed = assignedColumn;

			return {
				...note,
				column: assignedColumn,
				color: getCategoryColor(note.category),
			};
		});

		return { nodes: processedNodes, maxColumnUsed };
	});

	let nodes = $derived(timelineData.nodes);
	let maxColumnUsed = $derived(timelineData.maxColumnUsed);

	// 12 Modern vibrant colors for categories
	const palette = [
		"#3b82f6", // Blue
		"#10b981", // Green
		"#ef4444", // Red
		"#f59e0b", // Amber
		"#8b5cf6", // Violet
		"#ec4899", // Pink
		"#06b6d4", // Cyan
		"#f97316", // Orange
		"#14b8a6", // Teal
		"#6366f1", // Indigo
		"#d946ef", // Fuchsia
		"#84cc16", // Lime
	];

	// Map categories to colors in order of appearance
	const categoryColorMap = $derived.by(() => {
		const map: Record<string, string> = {
			default: "var(--interactive-accent)",
		};

		// Sort all notes by start date to assign colors chronologically
		const chronNotes = [...notes].sort(
			(a, b) => a.startDate.getTime() - b.startDate.getTime(),
		);

		let nextColorIndex = 0;
		chronNotes.forEach((note) => {
			if (note.category) {
				const normalized = note.category.toLowerCase();
				if (!map[normalized]) {
					map[normalized] = palette[nextColorIndex % palette.length]!;
					nextColorIndex++;
				}
			}
		});

		return map;
	});

	const getCategoryColor = (category?: string) => {
		if (!category) return categoryColorMap.default;
		const normalized = category.toLowerCase();
		return categoryColorMap[normalized] ?? categoryColorMap.default;
	};

	let showLegend = $state(false);
	const activeCategories = $derived.by(() => {
		// Return categories in the order they appear in the color map (discovery order)
		return Object.keys(categoryColorMap).filter((cat) => cat !== "default");
	});
</script>

<div class="timeline-container">
	<div class="timeline-header">
		<div class="header-left">
			<button
				class="legend-btn"
				onclick={() => (showLegend = !showLegend)}
				title="Categories Legend"
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><rect x="3" y="3" width="7" height="7"></rect><rect
						x="14"
						y="3"
						width="7"
						height="7"
					></rect><rect x="14" y="14" width="7" height="7"
					></rect><rect x="3" y="14" width="7" height="7"></rect></svg
				>
			</button>
			{#if showLegend}
				<div class="legend-popover">
					<h3>Categories</h3>
					<div class="legend-items">
						{#each activeCategories as cat}
							<div class="legend-item">
								<span
									class="color-dot"
									style:background-color={getCategoryColor(
										cat,
									)}
								></span>
								<span class="category-name">{cat}</span>
							</div>
						{:else}
							<p>No categories found</p>
						{/each}
						<div class="legend-item">
							<span
								class="color-dot"
								style:background-color={categoryColorMap.default}
							></span>
							<span class="category-name">Default</span>
						</div>
					</div>
				</div>
			{/if}
		</div>
		<h1 class="year-title">Yearly View</h1>
		<select class="year-selector" bind:value={currentYear}>
			{#each availableYears as yearOption}
				<option value={yearOption}>{yearOption}</option>
			{/each}
		</select>
	</div>
	<div
		class="days-group"
		style:grid-template-columns={`2rem 2rem ${Array(maxColumnUsed - 2)
			.fill("2rem")
			.join(" ")}`}
	>
		<!-- Months -->
		{#each year.months as month, index}
			<div
				class="month-item"
				style:grid-row={`${calculateMonthRowNumber(index)} / span ${month.days}`}
			>
				{month.name}
			</div>
		{/each}

		<!-- Days -->
		{#each year.months as month, monthIndex}
			{#each { length: month.days }, day}
				<div
					class="day-item"
					class:accent={day === 0}
					style:grid-row={calculateMonthRowNumber(monthIndex) + day}
				>
					{day + 1}
				</div>
			{/each}
		{/each}

		<!-- Notes -->
		{#each nodes as node}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="note-item"
				style:grid-column={node.column}
				style:grid-row={`${node.rowStart} /  ${node.rowEnd + 1}`}
				style:background-color={node.color}
				style:filter={node.status === "in-progress"
					? "saturate(0.5)"
					: "saturate(1)"}
				title={`${node.name}${node.category ? ` (${node.category})` : ""}`}
				onclick={() => onNoteClick?.(node.path)}
			></div>
		{/each}
	</div>
</div>

<style>
	.timeline-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 0.5rem;
	}
	.year-title {
		margin: 0;
	}
	.year-selector {
		background-color: var(--background-secondary);
		color: var(--text-normal);
		border: 1px solid var(--background-modifier-border);
		border-radius: 0.25rem;
		padding: 0.25rem 0.5rem;
		font-size: 1rem;
		cursor: pointer;
	}
	.year-selector:focus {
		outline: none;
		border-color: var(--interactive-accent);
	}
	.days-group {
		width: max-content;
		margin-left: auto;
		margin-right: auto;
		display: grid;
		row-gap: 0.25rem;
		column-gap: 0.25rem;
		--main-color: var(--background-secondary-alt);
		--accent-color: var(--interactive-accent);
		--accent-hover-color: var(--interactive-accent-hover);
	}
	.month-item {
		grid-column: 1;
		/* border-left: 2px solid var(--text-faint); */
		/* border-right: 1px solid var(--text-faint); */
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-faint);
		writing-mode: vertical-rl;
		text-orientation: sideways;
		transform: rotate(180deg);
	}
	.day-item {
		grid-column: 2;
		background-color: var(--main-color);
		color: var(--text-muted);
		text-align: center;
		border-radius: 0.25rem;
	}
	.day-item.accent {
		background-color: var(--text-selection);
	}

	.note-item {
		border-radius: 0.25rem;
		background-color: var(--accent-color);
		color: var(--text-muted);
		transition: transform 0.1s ease;
	}
	.note-item:hover {
		filter: brightness(1.1);
		transform: scaleX(1.1);
		cursor: pointer;
	}

	.header-left {
		position: absolute;
		left: 1rem;
		display: flex;
		align-items: center;
	}

	.legend-btn {
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
	}

	.legend-btn:hover {
		background-color: var(--background-modifier-hover);
		color: var(--text-normal);
	}

	.legend-popover {
		position: absolute;
		top: 100%;
		left: 0;
		background-color: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 8px;
		padding: 0.75rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		z-index: 100;
		min-width: 150px;
		margin-top: 0.5rem;
	}

	.legend-popover h3 {
		margin: 0 0 0.5rem 0;
		font-size: 0.9rem;
		color: var(--text-faint);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.legend-items {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.color-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
	}

	.category-name {
		font-size: 0.85rem;
		color: var(--text-normal);
		text-transform: capitalize;
	}
</style>
