<script lang="ts">
	import { type NotesData } from "types/notesType";

	interface Props {
		notes: NotesData[];
		onNoteClick?: (path: string) => void;
	}
	let { notes, onNoteClick }: Props = $props();

	interface Year {
		months: Month[];
	}
	interface Month {
		name: string;
		days: number;
	}
	const year: Year = {
		months: [
			{ name: "January", days: 31 },
			{ name: "February", days: 28 },
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
	};

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
		const sortedNotes = notes
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
			};
		});

		return { nodes: processedNodes, maxColumnUsed };
	});

	let nodes = $derived(timelineData.nodes);
	let maxColumnUsed = $derived(timelineData.maxColumnUsed);
</script>

<div>
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
				title={node.name}
				onclick={() => onNoteClick?.(node.path)}
			></div>
		{/each}
	</div>
</div>

<style>
	.days-group {
		width: max-content;
		margin-left: auto;
		margin-right: auto;
		display: grid;
		row-gap: 0.25rem;
		column-gap: 0.25rem;
		--main-color: #2d2c32;
		--light-color: #d3dad9;
		--secondary-color: #6c6c7a;
		--accent-color: #234c6a;
		--accent-hover-color: #1e3c55;
	}
	.month-item {
		grid-column: 1;
		border-bottom: 1px solid var(--main-color);
		border-top: 1px solid var(--main-color);
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--secondary-color);
		writing-mode: vertical-rl;
		text-orientation: sideways;
		transform: rotate(180deg);
	}
	.day-item {
		grid-column: 2;
		background-color: var(--main-color);
		color: var(--secondary-color);
		text-align: center;
		border-radius: 0.25rem;
	}
	.note-item {
		border-radius: 0.25rem;
		background-color: var(--accent-color);
		color: var(--light-color);
	}
	.note-item:hover {
		background-color: var(--accent-hover-color);
		cursor: pointer;
	}
</style>
