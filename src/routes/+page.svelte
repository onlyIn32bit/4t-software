<script>
	import { pb } from '$lib/pocketBase';
	import { fly, fade } from 'svelte/transition';
	import { user } from '$lib/pocketBase';
	import { socket } from '$lib/socket.io-client';
</script>

<svelte:head>
	<title>Phan mem Thach Thuc Tri Tue</title>
</svelte:head>

<section class="h-screen w-screen overflow-hidden">
	<h1 class="fixed left-8 top-8" in:fade={{ duration: 50 }}>
		{$user ? 'Da dang nhap: ' + $user.name : 'Chua dang nhap'}
	</h1>
	<div
		class="flex h-screen flex-col items-center justify-center gap-6"
		in:fly={{ y: 60, opacity: 0.5 }}
	>
		{#if $user}
			<a href="/ts">Trang thí sinh</a>
			<a href="/mc">Trang MC</a>
			<a href="/display">Màn hình</a>
			<a href="/sounds">Âm thanh</a>
			<a href="/control-panel">Control Panel</a>
			<a href="/settings">Global Settings</a>
		{:else}
			<a href="/auth/ts">Đăng nhập thí sinh</a>
			<a href="/auth/btc">Đăng nhập BTC</a>
			<a href="/auth/admin">Login Admin</a>
		{/if}
	</div>
	{#if $user}
		<button
			class="btn fixed bottom-8 left-8"
			in:fade={{ duration: 50 }}
			on:click={() => {
				socket.emit('userLogOut', $user);
				pb.authStore.clear();
			}}>Log out</button
		>
	{/if}
</section>
