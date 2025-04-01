<script lang="ts">
    import { onMount } from 'svelte';

    // Define the User type based on your schema
    interface User {
        user_id: number;
        user_name: string;
        user_age: number | null;
        bio: string | null;
    }

    // State variables with explicit types
    let users: User[] = [];
    let selectedIds: number[] = [];
    let summary: string | null = null;
    let newName: string = '';
    let newAge: string = '';
    let newBio: string = '';
    let isLoading: boolean = false; // For loading state during API calls
    let errorMessage: string | null = null; // For error messages

    // Fetch users on mount
    onMount(async () => {
        try {
            const res = await fetch('/api/users');
            if (!res.ok) {
                throw new Error('Failed to fetch users');
            }
            users = await res.json();
        } catch (error) {
            errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching users';
        }
    });

    // Add a new user
    async function addUser(event: Event) {
        event.preventDefault();

        // Basic form validation
        if (!newName.trim()) {
            errorMessage = 'Name is required';
            return;
        }

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_name: newName.trim(),
                    user_age: newAge ? parseInt(newAge) : null,
                    bio: newBio.trim() || null,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to add user');
            }

            const newUser: User = await res.json();
            users = [...users, newUser];
            // Reset form
            newName = '';
            newAge = '';
            newBio = '';
            errorMessage = null;
        } catch (error) {
            errorMessage = error instanceof Error ? error.message : 'An error occurred while adding the user';
        }
    }

    // Request AI summary
    async function getSummary() {
        if (selectedIds.length === 0) {
            errorMessage = 'Please select at least one user';
            return;
        }

        isLoading = true;
        errorMessage = null;

        try {
            const res = await fetch('/api/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: selectedIds }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate summary');
            }

            summary = data.summary;
        } catch (error) {
            errorMessage = error instanceof Error ? error.message : 'An error occurred while generating the summary';
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Database Summarization Dashboard</h1>

    <!-- Error message display -->
    {#if errorMessage}
        <div class="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {errorMessage}
        </div>
    {/if}

    <!-- Form to add new users -->
    <form on:submit|preventDefault={addUser} class="mb-6 flex gap-2">
        <input
            type="text"
            bind:value={newName}
            placeholder="Name"
            required
            class="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
            type="number"
            bind:value={newAge}
            placeholder="Age"
            min="0"
            class="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <textarea
            bind:value={newBio}
            placeholder="Bio"
            class="border p-2 rounded w-1/3 focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="2"
        ></textarea>
        <button
            type="submit"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
            Add User
        </button>
    </form>

    <!-- Users table -->
    <table class="min-w-full bg-white border mb-6">
        <thead>
            <tr>
                <th class="border p-2">Select</th>
                <th class="border p-2">ID</th>
                <th class="border p-2">Name</th>
                <th class="border p-2">Age</th>
                <th class="border p-2">Bio</th>
            </tr>
        </thead>
        <tbody>
            {#if users.length === 0}
                <tr>
                    <td colspan="5" class="border p-2 text-center text-gray-500">
                        No users found. Add a user to get started!
                    </td>
                </tr>
            {/if}
            {#each users as user (user.user_id)}
                <tr>
                    <td class="border p-2 text-center">
                        <input
                            type="checkbox"
                            bind:group={selectedIds}
                            value={user.user_id}
                            class="h-4 w-4"
                        />
                    </td>
                    <td class="border p-2">{user.user_id}</td>
                    <td class="border p-2">{user.user_name}</td>
                    <td class="border p-2">{user.user_age ?? 'N/A'}</td>
                    <td class="border p-2">{user.bio ?? 'No bio'}</td>
                </tr>
            {/each}
        </tbody>
    </table>

    <!-- Summary button and display -->
    <button
        on:click={getSummary}
        disabled={isLoading || selectedIds.length === 0}
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mb-4 disabled:bg-blue-300 disabled:cursor-not-allowed"
    >
        {#if isLoading}
            Generating...
        {:else}
            Get Summary
        {/if}
    </button>

    {#if summary}
        <h2 class="text-xl font-semibold mb-2">AI-Generated Summary</h2>
        <p class="p-4 bg-gray-100 rounded">{summary}</p>
    {/if}
</div>