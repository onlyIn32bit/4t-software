<script lang="ts">
	import { socket } from '$lib/socket-io-client';
	import { onMount } from 'svelte';
	import { pb, user } from '$lib/pocketBase';
	import '../app.css';

	onMount(() => {});
	$: if ($user !== null) socket.emit('user', $user);
</script>

<main class="">
	<slot />
</main>
