<script lang="ts">
	import { sendSoundRequest } from '$lib/utils';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	export let currentContestantName: string;
	export let chosenQuestionSet: string[];

	onMount(() => {
		sendSoundRequest('vd_start_ts');
		setTimeout(() => {
			sendSoundRequest('vd_show_package');
		}, 5000);
	});
</script>

<div class="fixed h-full w-full bg-bg-2 bg-cover bg-no-repeat" transition:fade>
	<div
		class="fixed left-0 top-0 flex h-[12vh] w-screen items-center justify-center bg-blue-100 font-number-display text-[10vh] font-bold text-black"
	>
		{currentContestantName}
	</div>
	<div
		class="fixed bottom-[26vh] h-[7vh] w-screen bg-white"
		in:fly={{ delay: 4800, x: -1000 }}
	></div>
	<div class="fixed bottom-[15vh] left-1/2 flex -translate-x-1/2 gap-[10vw]">
		<div class="flex gap-[1vw]" in:fly={{ delay: 5000, y: 300 }}>
			<div class="flex flex-col gap-[1vh]">
				{#each [0, 1, 2] as item}
					<div
						class={`flex h-[9vh] w-[9vh] items-center justify-center rounded-[1vh] ${chosenQuestionSet[item] === '20' ? 'bg-green-500' : 'bg-white'}`}
						style={`border: 0.7vh solid #6EB0ED; filter: drop-shadow(8px 28px 32px #335);`}
					>
						{#if chosenQuestionSet[item] === '20'}
							<svg class="h-[6.5vh]" fill="#fff" viewBox="0 0 448 512"
								><path
									d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
								/></svg
							>
						{/if}
					</div>
				{/each}
			</div>
			<div
				class=" flex h-[29vh] w-[29vh] items-center justify-center rounded-[1vh] bg-gradient-to-tr from-[#093278] to-[#093278] text-[16vh] font-black"
				style={`border: 1vh solid #6EB0ED; filter: drop-shadow(8px 28px 32px #335);`}
			>
				20
			</div>
		</div>
		<div class="flex gap-[1vw]" in:fly={{ delay: 5300, y: 300 }}>
			<div class="flex flex-col gap-[1vh]">
				{#each [0, 1, 2] as item}
					<div
						class={`flex h-[9vh] w-[9vh] items-center justify-center rounded-[1vh] ${chosenQuestionSet[item] === '30' ? 'bg-green-500' : 'bg-white'}`}
						style={`border: 0.7vh solid #6EB0ED; filter: drop-shadow(8px 28px 32px #335);`}
					>
						{#if chosenQuestionSet[item] === '30'}
							<svg class="h-[6.5vh]" fill="#fff" viewBox="0 0 448 512"
								><path
									d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
								/></svg
							>
						{/if}
					</div>
				{/each}
			</div>
			<div
				class=" flex h-[29vh] w-[29vh] items-center justify-center rounded-[1vh] bg-gradient-to-tr from-[#093278] to-[#093278] text-[16vh] font-black"
				style={`border: 1vh solid #6EB0ED; filter: drop-shadow(8px 28px 32px #335);`}
			>
				30
			</div>
		</div>
	</div>
</div>
