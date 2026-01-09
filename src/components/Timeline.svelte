<script lang="ts">
	// import { TFile } from "obsidian";

    // interface Props {
    //     files: TFile[]
    // }

//   let {
//     startCount
//   }: Props = $props();

//   let count = $derived(startCount);

//   export function increment() {
//     count += 1;
//   }
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
        row: number;
    }
    const getNodeRowAndColumn = (startDate:Date, endDate:Date):NodePosition => {
        // console.log(startDate);
        // console.log(endDate);
        return {column: 1, row: 1}
    }
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

    <!-- Nodes that span columns and rows -->
</div>

<style>
    .days-group{
        display: grid;
        row-gap: 0.25rem;
    }
    .month-item{
        grid-column: 1;
        background-color: aqua;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        color: black;
    }
    .day-item{
        grid-column: 2;
        background-color: bisque;
        color: black;
    }
</style>