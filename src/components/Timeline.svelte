<script lang="ts">
    import { type NotesData } from "types/notesType";

    interface Props {
        notes: NotesData[];
    }
    let { notes }: Props = $props();

    interface Year {
        months: Month[];
    }
    interface Month {
        name: string;
        days: number;
    }
    const year:Year = {
        months: [
            {name:"January", days:31},
            {name:"February", days:28},
            {name:"March", days:31},
            {name:"April", days:30},
            {name:"May", days:31},
            {name:"June", days:30},
            {name:"July", days:31},
            {name:"August", days:31},
            {name:"September", days:30},
            {name:"October", days:31},
            {name:"November", days:30},
            {name:"December", days:31}
        ]
    }
    let days = 365;

    const calculateMonthRowNumber = (monthNumber:number) => {
        let totalDays = 0;
        for (let i = 0; i < monthNumber; i++){
            const month = year.months[i];
            if( month == undefined || month == null){
                break;
            }
            totalDays = totalDays + month.days;
        }
        return totalDays + 1;
    }

    interface NodePosition {
        column: number;
        rowStart: number;
        rowEnd: number;
    }
    
    const getNodeRowAndColumn = (startDate: Date, endDate: Date): NodePosition => {
        const getDayOfYear = (date: Date): number => {
            const monthIndex = date.getMonth(); // 0-based
            const dayOfMonth = date.getDate();  // 1-based

            let daysBeforeMonth = 0;
            for (let i = 0; i < monthIndex; i++) {
                const month = year.months[i];
                if( month == undefined || month == null){
                    break;
                }
                daysBeforeMonth += month.days;
            }

            return daysBeforeMonth + dayOfMonth;
        };

        const rowStart = getDayOfYear(startDate);
        const rowEnd = getDayOfYear(endDate);

        return {
            column: 3,
            rowStart,
            rowEnd
        };
    };

    let nodes = $derived(
        notes.map(note =>
            getNodeRowAndColumn(note.startDate, note.endDate)
        )
    );
</script>

<div class="days-group">
    {#each year.months as month, index}
    <div class="month-item" 
        style:grid-row={`${calculateMonthRowNumber(index)} / span ${month.days}`}>
        {month.name}
    </div>
    {/each}

    {#each {length: days}, day}
    <div class="day-item" style:grid-row={day+1}>{day + 1}</div>
    {/each}

    {#each nodes as node}
    <div class="note-item"
        style:grid-column={node.column}
        style:grid-row={`${node.rowStart} /  ${node.rowEnd + 1}`}>
        {node.rowStart}, {node.rowEnd}, span: {node.rowEnd + 1 - node.rowStart}
    </div>
    {/each}
    
</div>

<style>
    .days-group{
        display: grid;
        row-gap: 0.25rem;
        column-gap: 0.25rem;
        grid-template-columns: 2rem 1fr 1fr;
    }
    .month-item{
        grid-column: 1;
        background-color: aqua;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        color: black;
        writing-mode: vertical-rl;
        text-orientation: sideways;
        transform: rotate(180deg);
    }
    .day-item{
        grid-column: 2;
        background-color: bisque;
        color: black;
    }
    .note-item{
        background-color: blue;
        color: black;
    }
</style>