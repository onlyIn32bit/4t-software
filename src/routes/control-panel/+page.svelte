<script lang="ts">
	import AuthCheck from '$lib/components/AuthCheck.svelte';
	import {
		getCurrentTime,
		getScreenStats,
		createLogMessage,
		download,
		dictionary,
		timerSettings,
		playSound,
		numberOfQues
	} from '$lib/utils';
	import { pb, user } from '$lib/pocketBase';
	import { onMount, onDestroy } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { Toaster, toast } from 'svelte-sonner';

	let contestants: any[] = [];
	let logs: any[] = [];
	let messageContent: string = '';

	type DisplayObject = {
		screen: string;
		slide: string;
		question: number;
		numberOfQues: number;
	};

	let current: DisplayObject = {
		screen: '',
		slide: '',
		question: -1,
		numberOfQues: -1
	};

	let selected: DisplayObject = {
		screen: '',
		slide: '',
		question: -1,
		numberOfQues: -1
	};
	$: selected.numberOfQues = numberOfQues.get(selected.screen) ?? 0;
	$: current.numberOfQues = numberOfQues.get(current.screen) ?? 0;

	let selectedScore: number[] = [0, 0, 0, 0];

	let prevScreen: string;

	let elapsed: number = 0;

	let menu: string = 'main';

	let game: string;

	let selectionSlideList = ['start', 'rule', 'ques', 'end'];
	$: if (selected.screen === 'kd') {
		selectionSlideList = [
			'start',
			'rule',
			'main_kd',
			'ques',
			'ques_ts1',
			'ques_ts2',
			'ques_ts3',
			'ques_ts4',
			'end'
		];
	} else if (selected.screen === 'vcnv') {
		selectionSlideList = ['start', 'rule', 'main_vcnv', 'ques', 'end'];
	} else if (selected.screen === 'vd') {
		selectionSlideList = [
			'start',
			'rule',
			'main_vd',
			'ques_ts1',
			'ques_ts2',
			'ques_ts3',
			'ques_ts4',
			'end'
		];
	} else {
		selectionSlideList = ['start', 'rule', 'ques', 'end'];
	}

	let contestant_info = [
		{ name: undefined, class: undefined },
		{ name: undefined, class: undefined },
		{ name: undefined, class: undefined },
		{ name: undefined, class: undefined }
	];
	// あなたはゲイ
	let unsub: (() => void)[] = [];
	// chay khi component duoc load
	onMount(async () => {
		// fetch data
		const userListRecord = await pb.collection('users').getFullList();
		const logsRecord = await pb.collection('logs').getFullList();

		const displayStatusRecord = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');
		const settingsRecord = await pb.collection('settings').getOne('4t-settings-all');

		contestants = userListRecord;
		logs = logsRecord;
		current = {
			screen: displayStatusRecord.screen,
			slide: displayStatusRecord.slide,
			question: displayStatusRecord.ques,
			numberOfQues: -1
		};
		selected = { ...current };
		game = settingsRecord.field.game;

		// riel time database setup
		unsub[0] = await pb.collection('users').subscribe('*', ({ action, record }) => {
			// console.log(record);
			if (action === 'update') {
				contestants = contestants.map((currentValue) =>
					currentValue.id === record.id ? record : currentValue
				);
				// if (record.ring > 0) playSound('bell_vd');
			}
		});
		unsub[1] = await pb.collection('logs').subscribe('*', ({ action, record }) => {
			if (action === 'create') logs = [...logs, record];
			else if (action === 'delete')
				logs = logs.filter((currentValue) => currentValue.id !== record.id);
		});
		unsub[2] = await pb
			.collection('display_status')
			.subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
				if (action === 'update') {
					current.screen = record.screen;
					current.slide = record.slide;
					current.question = record.ques;
				}
			});
	});
	// chay khi component bi pha huy
	onDestroy(() => {
		// unsubscibe from riel time db
		unsub.forEach((currentValue) => {
			currentValue?.();
		});
	});

	async function startTimer(duration: number) {
		// contestants.forEach(async (currentValue) => {
		// 	await pb.collection('users').update(currentValue.id, { answer: null, time: -1 });
		// });
		await pb.collection('display_status').update('4T-DISPLAYSTATE', {
			timer: duration
		});
		let last_time = window.performance.now();
		let frame;
		createLogMessage('system', 'TIMER', 'Bắt đầu đếm thời gian: ' + duration + 'ms');
		(async function update() {
			frame = requestAnimationFrame(update);

			const time = window.performance.now();
			elapsed += Math.min(time - last_time, duration - elapsed);
			last_time = time;
			if (elapsed >= duration) {
				cancelAnimationFrame(frame);
				createLogMessage('system', 'TIMER', 'Đã hết thời gian');
				contestants.forEach(async (currentValue) => {
					if (currentValue.time == -1) {
						await pb.collection('users').update(currentValue.id, { time: -2 });
					}
				});
				await pb.collection('display_status').update('4T-DISPLAYSTATE', {
					timer: -1
				});
				elapsed = 0;
			}
		})();
		elapsed = 0;
	}
	async function createMessage() {
		if (/\w/.test(messageContent)) {
			createLogMessage($user?.name, 'MESSAGE', messageContent);
			toast.success('Đã gửi tin nhắn');
			messageContent = '';
		} else {
			toast.warning('Hãy nhập nội dung tin nhắn');
		}
	}
	async function setScore() {
		if (JSON.stringify(selectedScore) !== JSON.stringify([0, 0, 0, 0])) {
			let message: string = '';
			contestants.forEach(async (currentValue, i) => {
				message +=
					currentValue.name +
					': ' +
					(currentValue.score + selectedScore[i]) +
					' (' +
					((selectedScore[i] >= 0 ? '+' : '') + selectedScore[i]) +
					'); ';
				if (selectedScore[i] !== 0)
					await pb
						.collection('users')
						.update(currentValue.id, { score: currentValue.score + selectedScore[i] });
			});

			createLogMessage('system', 'SCORE', message);
			selectedScore = [0, 0, 0, 0];
		}
	}
	async function setContestantInfo() {
		contestant_info.forEach(async (currentValue, i) => {
			// systemLog += i + 1 + ': ' + currentValue.name + '-' + currentValue.name + ';';
			await pb.collection('users').update('4t-contestant-' + (i + 1), {
				name: currentValue.name,
				class: currentValue.class,
				answer: null,
				time: 0,
				score: 0,
				ring: 0
			});
		});

		createLogMessage('system', 'DATABASE', 'Đã cập nhật thông tin thí sinh');
		menu = 'main';
	}
	async function setScreen() {
		if (selected.screen !== current.screen) {
			await pb.collection('display_status').update('4T-DISPLAYSTATE', {
				screen: selected.screen,
				slide: selected.slide,
				ques: selected.question
			});
		}
	}
	async function setSlide() {
		if (selected.slide !== current.slide) {
			await pb.collection('display_status').update('4T-DISPLAYSTATE', {
				slide: selected.slide
			});
		}
	}
	async function setQuestion() {
		if (selected.question !== current.question) {
			await pb.collection('display_status').update('4T-DISPLAYSTATE', {
				ques: selected.question
			});
			contestants.forEach(async (currentValue) => {
				await pb.collection('users').update(currentValue.id, { answer: null, time: 0 });
			});
		}
	}
	async function setDisplayQuestion(value: boolean) {
		// contestants.forEach(async (currentValue) => {
		// 	await pb.collection('users').update(currentValue.id, { answer: null, time: 0 });
		// });
		await pb.collection('display_status').update('4T-DISPLAYSTATE', {
			displayQuestion: value
		});
	}
	function saveLog() {
		let content = '#START LOG';
		logs.forEach((currentValue) => {
			content +=
				'\n' +
				currentValue.time +
				': <' +
				currentValue.from +
				'> [' +
				currentValue.type +
				']: ' +
				currentValue.content;
		});
		download(
			'4T_LOG_' + getCurrentTime().slice(0, 10).replaceAll('/', '-'),
			content + '\n#END LOG'
		);
	}
	async function clearLog() {
		if (confirm('Confirm?')) {
			logs.forEach(async (currentValue) => {
				await pb.collection('logs').delete(currentValue.id);
			});
			logs = [];
			toast.success('Đã xóa Log');
		}
	}
</script>

<svelte:head>
	<title>Bảng điều khiển | BTC 4T</title>
</svelte:head>

<Toaster closeButton richColors position="top-right" />
<AuthCheck requiredBTC={true}>
	<section class="h-screen w-screen overflow-hidden">
		<div class="grid h-full grid-cols-2 grid-rows-[50px_1fr_1fr_50px] border-[3px] border-gray-400">
			<div class="flex items-center justify-between border-[3px] border-gray-400 p-2">
				<div class="flex items-center gap-4 text-xl font-semibold">
					<a href="/"><img src="/src/lib/image/4t-blue.png" alt="Logo 4T" class="h-10" /></a>
					<h1>Control Panel - Thách Thức Trí Tuệ mùa 8</h1>
				</div>
				<div class="flex items-center gap-4">
					<button class="transition-colors hover:text-gray-500" on:click={clearLog}
						>CLEAR LOG</button
					>
					<button class="transition-colors hover:text-gray-500" on:click={saveLog}
						>SAVE CURRENT LOG</button
					>
				</div>
			</div>
			<div class="flex items-center justify-between border-[3px] border-gray-400 px-2">
				<h1>
					Current: {getScreenStats(current)}
				</h1>
				<h1>Selected: {getScreenStats(selected)}</h1>
				<h1>Previous: {dictionary.get(prevScreen)}</h1>
			</div>
			<div class="row-span-2 flex flex-col border-[3px] border-gray-400">
				<div class="mt-1 flex h-full flex-col-reverse overflow-auto">
					<table class="table table-pin-rows table-sm mb-auto">
						<thead class="border-b-2">
							<tr>
								<th class="w-48">Thời gian</th>
								<th class="w-28">Đến từ</th>
								<th class="w-20">Type</th>
								<th>Nội dung</th>
								<th class="w-4"></th>
							</tr>
						</thead>
						<tbody>
							{#each logs as log}
								<tr
									class={'bg-opacity-50 last:bg-green-50 last:dark:bg-green-950' +
										(log.from == 'system' ? ' bg-red-50 dark:bg-red-950' : '')}
									in:fly={{ y: 20 }}
								>
									<th class="font-mono">{log.time}</th>
									<td class={'font-medium ' + (log.from == 'system' ? 'text-red-700' : '')}
										>{log.from.toUpperCase()}</td
									>
									<td>{log.type}</td>
									<td>{log.content}</td>
									<td class="border-x-2">
										<button
											class="hover:text-gray-500"
											on:click={async () => {
												if (confirm('Xoa tin nhan nay?')) {
													await pb.collection('logs').delete(log.id);
													toast.success('Đã xóa tin nhắn: "' + log.content + '"');
												}
											}}>×</button
										>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
			<div class="grid grid-rows-[1fr_50px]">
				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				<div class="h-full border-[3px] border-gray-400">
					{#if menu === 'info'}
						<table class="table table-zebra table-md w-full">
							<thead>
								<tr>
									<th>STT</th>
									<th>TÊN THÍ SINH</th>
									<th>LỚP</th>
								</tr>
							</thead>
							<tbody>
								{#each [0, 1, 2, 3] as i}
									<tr>
										<td>{i + 1}</td>
										<td>
											<input
												class="input input-bordered"
												placeholder="Nhập tên thí sinh"
												type="text"
												name="ts{i}"
												bind:value={contestant_info[i].name}
											/>
										</td>
										<td>
											<input
												class="input input-bordered"
												placeholder="Nhập lớp"
												type="text"
												name="ts{i}"
												bind:value={contestant_info[i].class}
											/>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{:else if menu === 'settings'}
						<div>hi</div>
					{:else}
						<div
							class="grid h-full grid-cols-[12rem_1fr_7rem_3rem_1fr_3rem] grid-rows-[30px_1fr_1fr_1fr_1fr]"
						>
							<div class="flex items-center border-b-2 px-3 py-1 text-xs font-bold text-gray-400">
								TÊN THÍ SINH
							</div>
							<div class="flex items-center border-b-2 px-3 py-1 text-xs font-bold text-gray-400">
								CÂU TRẢ LỜI
							</div>
							<div
								class="flex items-center justify-center border-b-2 px-3 py-1 text-xs font-bold text-gray-400"
							>
								THỜI GIAN
							</div>
							<div
								class="col-span-3 flex items-center justify-center border-b-2 px-3 py-1 text-xs font-bold text-gray-400"
							>
								ĐIỂM
							</div>
							{#each contestants as contestant, i (contestant.id)}
								<!-- <tr title="{contestant.name} {contestant.class} - {contestant.score}đ"> -->
								<!-- <th>{i + 1}</th> -->
								<div class="flex items-center border-b-2 px-3 text-xl font-semibold">
									{contestant.name}
								</div>
								<div class="flex items-center border-b-2 px-3 text-lg">
									{contestant.answer === '' ? 'Chưa có câu trả lời' : contestant.answer}
								</div>
								<div class="flex items-center justify-center border-b-2 font-mono text-xl">
									{contestant.time === -2
										? 'ended'
										: contestant.time === -1
											? 'running'
											: (contestant.time / 1000).toFixed(3)}
								</div>
								<button
									class="h-full w-full bg-slate-100 text-3xl font-light text-gray-400 transition-colors hover:bg-blue-100"
									on:click={() => {
										selectedScore[i] -= 5;
									}}>-</button
								>
								<div class="flex items-center justify-center border-b-2">
									<div class="flex translate-x-6 font-mono text-3xl">
										{#key contestant.score}
											<div class="relative">
												<span
													class="absolute right-0 font-bold"
													in:fly={{ y: 20 }}
													out:fly={{ y: -20 }}>{contestant.score}</span
												>
											</div>
										{/key}
										<div class="ml-3 flex items-baseline">
											<span class="font-thin text-gray-400">
												{selectedScore[i] >= 0 ? '+' : ''}
											</span>
											<input
												class="rounded-sm text-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
												style={`width: ${String(selectedScore[i]).length}ch`}
												type="number"
												bind:value={selectedScore[i]}
											/>
										</div>
									</div>
								</div>
								<button
									class="h-full w-full bg-slate-100 text-3xl font-light text-gray-400 transition-colors hover:bg-blue-100"
									on:click={() => {
										selectedScore[i] += 10;
									}}>+</button
								>
							{/each}
						</div>
					{/if}
				</div>
				<div class="grid grid-cols-[1fr_1fr_1fr]">
					<select
						class="border-[3px] border-gray-400 bg-white px-4 transition-colors hover:bg-gray-200"
						bind:value={menu}
					>
						<option value="main">Main</option>
						<option value="info">Set thong tin thi sinh</option>
						<option value="settings">Cai dat</option>
					</select>
					{#if menu === 'info'}
						<button
							class="border-[3px] border-gray-400 transition-colors hover:bg-gray-200"
							on:click={setContestantInfo}
						>
							Set thong tin
						</button>
						<button
							class="border-[3px] border-gray-400 hover:bg-gray-200"
							on:click={() => {
								selectedScore = [0, 0, 0, 0];
							}}
							>Bỏ chọn
						</button>
					{:else}
						<button
							class="border-[3px]
						border-gray-400 transition-colors hover:bg-gray-200"
							on:click={setScore}
							>Set diem
						</button>
						<button
							class="border-[3px] border-gray-400 hover:bg-gray-200"
							on:click={() => {
								selectedScore = [0, 0, 0, 0];
							}}
							>Bỏ chọn điểm
						</button>
					{/if}
				</div>
			</div>
			<div class="border-[3px] border-gray-400">
				<!-- dieu khien man hinh -->
				<div role="tablist" class="tabs tabs-lifted tabs-sm rounded-lg bg-gray-100 xl:tabs-md">
					{#each ['main', 'answers', 'scores', 'kd', 'tt', 'vcnv', 'vd', 'extra'] as item}
						<button
							class=" tab transition-colors duration-300 [--tab-bg:white]"
							class:tab-active={selected.screen === item}
							class:text-black={current.screen === item}
							class:text-gray-400={current.screen !== item}
							class:hover:text-gray-500={current.screen !== item}
							class:hover:bg-gray-50={selected.screen !== item}
							on:click={() => {
								if (item === current.screen) {
									selected.slide = current.slide;
									selected.question = current.question;
								} else if (['kd', 'tt', 'vcnv', 'vd'].includes(item) && prevScreen !== item) {
									selected.slide = 'start';
									selected.question = 1;
								}
								if (selected.screen === item) {
									prevScreen = current.screen;
									setScreen();
								}
								selected.screen = item;
							}}
						>
							{dictionary.get(item)}
						</button>
					{/each}
				</div>
				<div class="grid grid-cols-1 grid-rows-3 gap-4 p-4">
					<!-- {#if selected.screen !== current.screen}
						<button class="btn" on:click={changeScreen}>Switch To This Screen</button>
					{/if} -->
					<!-- chon slide -->
					{#if selected.screen === 'kd' || selected.screen === 'tt' || selected.screen === 'vcnv' || selected.screen === 'vd'}
						<div class="grid grid-cols-[50px_1fr_50px_1fr] gap-4 xl:grid-cols-[75px_1fr_75px_1fr]">
							<button
								class="btn"
								class:btn-disabled={selected.slide === 'start' ||
									selected.screen !== current.screen}
								on:click={() => {
									const prevIndex = selectionSlideList.indexOf(selected.slide) - 1;
									selected.slide = selectionSlideList[prevIndex];
									setSlide();
								}}>{'<'}</button
							>
							<select class="select select-bordered select-md" bind:value={selected.slide}>
								{#each selectionSlideList as value}
									<option {value}>{dictionary.get(value)}</option>
								{/each}
							</select>
							<button
								class="btn"
								class:btn-disabled={selected.slide === 'end' || selected.screen !== current.screen}
								on:click={() => {
									const nextIndex = selectionSlideList.indexOf(selected.slide) + 1;
									selected.slide = selectionSlideList[nextIndex];
									setSlide();
								}}>{'>'}</button
							>
							<button
								class="btn"
								class:btn-disabled={selected.screen !== current.screen ||
									selected.slide === current.slide}
								on:click={setSlide}>Change Slide</button
							>
						</div>
					{/if}
					{#if selected.slide == 'ques' && (selected.screen == 'kd' || selected.screen == 'tt')}
						<div class="grid grid-cols-[50px_1fr_50px_1fr] gap-4 xl:grid-cols-[75px_1fr_75px_1fr]">
							<button
								class="btn select-none"
								class:btn-disabled={selected.question <= 1 || selected.screen !== current.screen}
								on:click={() => {
									selected.question -= 1;
									setQuestion();
								}}>{'<'}</button
							>
							<div class="flex">
								<input
									class="input input-md input-bordered w-32 text-2xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
									type="number"
									min="1"
									max={current.numberOfQues}
									on:input={() => {}}
									bind:value={selected.question}
								/>
								<div class="flex w-8 flex-col">
									<button
										class="btn btn-xs select-none"
										class:btn-disabled={selected.question === selected.numberOfQues}
										on:click={() => (selected.question += 1)}
									>
										+
									</button>
									<button
										class="btn btn-xs select-none"
										class:btn-disabled={selected.question <= 1}
										on:click={() => (selected.question -= 1)}
									>
										-
									</button>
								</div>
							</div>

							<button
								class="btn"
								class:btn-disabled={selected.question >= current.numberOfQues ||
									selected.screen !== current.screen}
								on:click={() => {
									selected.question += 1;
									setQuestion();
								}}>{'>'}</button
							>
							<button
								class="btn select-none"
								class:btn-disabled={selected.screen !== current.screen ||
									selected.question === current.question}
								on:click={setQuestion}>Change Question</button
							>
						</div>
						<div class="grid grid-cols-4 gap-4">
							<button
								class="btn"
								class:btn-disabled={selected.screen !== current.screen}
								on:click={() => {
									contestants.forEach(async (currentValue) => {
										await pb.collection('users').update(currentValue.id, { ring: 0 });
									});
								}}>Play Animation (clr ring)</button
							>
							<button class="btn" on:click={() => setDisplayQuestion(true)}
								>Display question
							</button>
							<button
								class="btn"
								class:btn-disabled={elapsed > 0 || selected.screen !== current.screen}
								on:click={() => startTimer(timerSettings.get(current.screen) ?? 0)}
								>Start timer</button
							>
							<span class="flex items-center justify-center font-mono text-2xl font-semibold"
								>{(elapsed / 1000).toFixed(2)}s</span
							>
						</div>
					{/if}
					<!-- phan hien thi vcnv, de sau -->
					{#if selected.slide == 'main_vcnv' && selected.screen == 'vcnv'}
						<div class="grid grid-cols-8">
							{#each [1, 2, 3, 4, 5, 6, 7, 8] as i}
								<div><button class="btn">{i}</button></div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
			<div class="col-span-2 flex items-center border-[3px] border-gray-400 pr-3">
				<form class="h-full w-full" on:submit|preventDefault={createMessage}>
					<input
						class="h-full w-full px-4 text-xl"
						type="text"
						placeholder="Nhập tin nhắn, nhấn Enter để gửi"
						bind:value={messageContent}
						class:input-error={!messageContent}
					/>
				</form>
				<button class="btn btn-circle btn-sm ml-auto" on:click|preventDefault={() => {}}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
						<path
							d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm177.6 62.1C192.8 334.5 218.8 352 256 352s63.2-17.5 78.4-33.9c9-9.7 24.2-10.4 33.9-1.4s10.4 24.2 1.4 33.9c-22 23.8-60 49.4-113.6 49.4s-91.7-25.5-113.6-49.4c-9-9.7-8.4-24.9 1.4-33.9s24.9-8.4 33.9 1.4zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"
						/>
					</svg>
				</button>
			</div>
		</div>
	</section>
</AuthCheck>
