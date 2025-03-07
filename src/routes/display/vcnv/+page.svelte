<script lang="ts">
	import { fly, fade, scale, slide } from 'svelte/transition';
	import logo from '$lib/image/4t.png';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import type { RecordModel } from 'pocketbase';
	import { onDestroy, onMount } from 'svelte';
	import ScreenIntro from '$lib/components/display/ScreenIntro.svelte';
	import ScreenRule from '$lib/components/display/ScreenRule.svelte';
	import ScreenStart from '$lib/components/display/ScreenStart.svelte';
	import ScreenQuestionVcnv from '$lib/components/display/ScreenQuestionVCNV.svelte';
	import ScreenEnd from '$lib/components/display/ScreenEnd.svelte';

	let questionSet: RecordModel;
	let obstacle: string = '';
	let imageLink: string = pb.baseUrl + '/api/files/vcnv/4T-QUES-VCNV-BK/';
	let rows: { keyword: string; question: string }[] = [];
	let centerQuestion: string = '';
	let scr_slide: string = '';
	let ques: number = 1;
	let start: boolean = false;
	let displayed: {
		obstacle: boolean;
		rowsState: Array<string>;
		image: Array<boolean>;
	} = {
		obstacle: false,
		rowsState: ['', '', '', ''],
		image: [false, false, false, false, false]
	};
	let contestants: RecordModel[] = [];
	let time: number = 0;
	let displayQuestion: boolean = false;

	// let unsub: (() => void)[] = [];
	onMount(async () => {
		const userListRecord = await pb.collection('users').getFullList();
		contestants = userListRecord;

		const displayStatus = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');
		screen = displayStatus.screen;
		scr_slide = displayStatus.slide;
		ques = displayStatus.ques;

		const displayStatusVcnv = await pb.collection('display_status_vcnv').getOne('4T-DISPLAYSTATE');
		start = displayStatusVcnv.start;
		displayed = {
			obstacle: displayStatusVcnv.obstacle,
			rowsState: [
				displayStatusVcnv[1],
				displayStatusVcnv[2],
				displayStatusVcnv[3],
				displayStatusVcnv[4]
			],
			image: [
				displayStatusVcnv['h1'],
				displayStatusVcnv['h2'],
				displayStatusVcnv['h3'],
				displayStatusVcnv['h4'],
				displayStatusVcnv['hcenter']
			]
		};

		const data = await pb.collection('vcnv').getOne('4T-QUES-VCNV-BK');
		questionSet = data.question;
		obstacle = questionSet.obstacle ?? '';
		imageLink += data.image;
		rows = questionSet.rows ?? [];
		centerQuestion = questionSet.center_ques;

		// unsub = [
		await pb.collection('display_status').subscribe('*', ({ action, record }) => {
			if (action === 'update') {
				if (record.screen !== 'vcnv') goto('/display/' + record.screen);
				else {
					if (scr_slide !== record.slide) scr_slide = record.slide;
					if (ques !== record.ques) ques = record.ques;
					displayQuestion = record.displayQuestion;
					if (record.timer !== -1 && scr_slide === 'main_vcnv') timer();
				}
			}
		});
		await pb
			.collection('display_status_vcnv')
			.subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
				if (action === 'update') {
					if (start !== record.start) start = record.start;
					displayed = {
						obstacle: record.obstacle,
						rowsState: [record[1], record[2], record[3], record[4]],
						image: [record['h1'], record['h2'], record['h3'], record['h4'], record['hcenter']]
					};
				}
			});
		await pb.collection('users').subscribe('*', ({ action, record }) => {
			if (action === 'update') {
				contestants = contestants.map((currentValue) =>
					currentValue.id === record.id ? record : currentValue
				);
				contestants.sort((a, b) => (a.ring > b.ring ? -1 : 1));
			}
		});
		// ];
	});
	onDestroy(() => {
		pb.collection('display_status').unsubscribe('*');
		pb.collection('display_status_vcnv').unsubscribe('4T-DISPLAYSTATE');
		pb.collection('users').unsubscribe('*');
	});

	async function timer() {
		let countdown: any = setInterval(() => {
			time += 0.01;
			if (time >= 15) {
				clearInterval(countdown);
				countdown = null;
				time = 15;
			}
		}, 10);
	}

	function getRowBackgroundColor(state: string) {
		if (state === 'selected' || state === 'correct') return 'a5a5bf';
		if (state === 'wrong') return 'aaa';
		return '2445c2';
	}
</script>

{#if scr_slide === 'start'}
	<ScreenStart screen="vcnv" />
{:else if scr_slide === 'rule'}
	<ScreenRule screen="vcnv" />
{:else if scr_slide === 'intro'}
	<ScreenIntro screen="vcnv" />
{:else if scr_slide === 'main_vcnv'}
	<div class="fixed h-full w-full bg-bg-2 bg-cover bg-no-repeat">
		<div class="relative -left-[5vw] -top-[3vh] h-full w-full">
			<div in:fade>
				<img
					class="absolute left-1/2 top-1/2 h-[95vh] w-[90vw] -translate-x-1/2 -translate-y-1/2"
					style={`filter: drop-shadow(8px 28px 32px #335);`}
					src="/src/lib/image/bg2.svg"
					alt=""
				/>
			</div>
			{#if start}
				<div
					class="absolute left-2/3 top-[10vh] w-[75vw] -translate-x-3/4 bg-white text-center text-[8vh] font-bold text-black"
					style="clip-path: polygon(98% 0, 100% 50%, 98% 99%, 2% 100%, 0 53%, 2% 0);"
					in:scale={{ duration: 900 }}
				>
					{#if displayed.obstacle}
						<h1 in:scale>CNV: {obstacle.toUpperCase()}</h1>
					{:else}
						<h1>CHƯỚNG NGẠI VẬT CÓ {obstacle.replaceAll(' ', '').length} KÍ TỰ</h1>
					{/if}
				</div>
				<div
					class="absolute left-1/2 top-2/3 flex -translate-x-[55%] -translate-y-3/4 flex-col gap-[4vh]"
					in:fade={{ duration: 1000 }}
				>
					{#each rows as row, i}
						<div class="relative">
							<div class="flex justify-center gap-[0.5vh]">
								<div
									class="absolute right-[-7vw] flex h-[10vh] w-[10vh] items-center justify-center rounded-[2.5vh] border-[7px] border-[#083b7b] bg-gradient-to-t from-[#0a357c] to-[#395693] text-[6vh] font-bold"
								>
									{i + 1}
								</div>
								{#each row.keyword.toUpperCase() as character}
									<div
										class="flex size-[10vh] items-center justify-center rounded-full border-[0.7vh] text-[8vh] font-bold text-blue-950"
										style={`
												// background: rgb(255,255,255);
												background: radial-gradient(circle at 45% 40%, #bbcfe8, #${getRowBackgroundColor(displayed.rowsState[i])});
												box-shadow: 0.6vh 0.65vh 1px rgba(100, 100, 100, 0.6), inset 0.5vh 0.5vh 5px rgba(0, 0, 0, 0.6);
												filter: brightness(${displayed.rowsState[i] === 'wrong' ? '0.65' : '1.1'});
												`}
									>
										{displayed?.rowsState[i] === 'correct' ? character : ''}
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
		<div
			class="fixed bottom-[14.4vh] right-[3.5vw] h-[75vh] w-[6vw] bg-white outline-8"
			style={`filter: drop-shadow(8px 28px 32px #335); border: 1vh solid #88badf;`}
			in:fade
		>
			<div
				class="absolute bottom-0 w-full bg-red-700"
				style={`height: ${(time / 15) * 100}%;`}
			></div>
		</div>
		<div class="fixed bottom-[2.5vh] left-[2.5vw] flex gap-[2vw] text-[5vh] font-bold">
			{#each contestants as contestant, i (i)}
				{#if contestant.ring > 0}
					<div
						class="flex items-center justify-center gap-[1vw] rounded-[1vh] border-[0.7vh] bg-gradient-to-tr from-[#0F247D] to-[#26164D] px-[1vw]"
						in:fly={{ x: 100 }}
					>
						<svg class="h-[5vh] animate-wiggle" fill="#fff" viewBox="0 0 448 512">
							<path
								d="M224 0c-17.7 0-32 14.3-32 32l0 19.2C119 66 64 130.6 64 208l0 18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416l384 0c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8l0-18.8c0-77.4-55-142-128-156.8L256 32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"
							/>
						</svg>
						{contestant.name}
					</div>
				{/if}
			{/each}
		</div>
	</div>
{:else if scr_slide === 'image_vcnv'}
	<div class="h-full w-full text-[20vh] font-bold">
		<img class="fixed left-1/2 h-screen -translate-x-1/2" src={imageLink} alt="" />
		{#if !displayed.image[0]}
			<div
				class="fixed left-0 h-[50vh] w-[50vw] border-8 bg-gradient-to-tr from-[#0F247D] to-[#26164D]"
				style={`clip-path: polygon(0 0, 100% 0, 100% 55%, 55% 55%, 55% 100%, 0 100%);`}
			>
				<h1 class="absolute left-[11vw] top-[5vh]">1</h1>
			</div>
		{/if}
		{#if !displayed.image[1]}
			<div
				class="fixed right-0 h-[50vh] w-[50vw] border-8 bg-gradient-to-tr from-[#0F247D] to-[#26164D]"
				style={`clip-path: polygon(0 0, 100% 0, 100% 100%, 45% 100%, 45% 55%, 0 55%);`}
			>
				<h1 class="absolute right-[11vw] top-[5vh]">2</h1>
			</div>
		{/if}
		{#if !displayed.image[2]}
			<div
				class="fixed bottom-0 left-0 h-[50vh] w-[50vw] border-8 bg-gradient-to-tr from-[#0F247D] to-[#26164D]"
				style={`clip-path: polygon(55% 0, 55% 45%, 100% 45%, 100% 100%, 0 100%, 0 0);`}
			>
				<h1 class="absolute bottom-[7vh] left-[11vw]">3</h1>
			</div>
		{/if}
		{#if !displayed.image[3]}
			<div
				class="fixed bottom-0 right-0 h-[50vh] w-[50vw] border-8 bg-gradient-to-tr from-[#0F247D] to-[#26164D]"
				style={`clip-path: polygon(45% 45%, 45% 0, 100% 0, 100% 100%, 0 100%, 0 45%);`}
			>
				<h1 class="absolute bottom-[7vh] right-[11vw]">4</h1>
			</div>
		{/if}

		{#if !displayed.image[4]}
			<div
				class="fixed left-1/2 top-1/2 h-[45vh] w-[45vw] -translate-x-1/2 -translate-y-1/2 border-[16px] bg-gradient-to-tr from-[#0F247D] to-[#26164D]"
			></div>
		{/if}
	</div>
{:else if scr_slide === 'ques'}
	<ScreenQuestionVcnv
		questionNumber={ques}
		question={ques < 5 ? rows[ques - 1]?.question : centerQuestion}
		{displayQuestion}
		{contestants}
	/>
{:else if scr_slide === 'end'}
	<ScreenEnd />
{/if}
