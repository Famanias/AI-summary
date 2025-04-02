<script lang="ts">
    import { onMount } from 'svelte';
    import { Pencil, Trash2 } from 'lucide-svelte';

    interface User {
        user_id: number;
        user_name: string;
        user_age: number | null;
        bio: string | null;
    }

    let users: User[] = [];
    let selectedIds: number[] = [];
    let summary: string | null = null;
    let newName: string = '';
    let newAge: string = '';
    let newBio: string = '';
    let aiInstructions: string = '';
    let isLoading: boolean = false;
    let errorMessage: string | null = null;
    let editingUser: User | null = null;
    let showEditModal = false;

    // Load initial data
    onMount(async () => {
        await fetchUsers();
    });

    // Fetch users function (reusable)
    async function fetchUsers() {
        try {
            const res = await fetch('/api/users');
            if (!res.ok) throw new Error('Failed to fetch users');
            users = await res.json();
        } catch (error) {
            errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching users';
        }
    }

    async function addUser(event: Event) {
        event.preventDefault();
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

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Extract the user from the response
            const newUser = data.user;
            users = [...users, newUser];
            newName = '';
            newAge = '';
            newBio = '';
            errorMessage = null;
        } catch (error) {
            errorMessage = error instanceof Error ? 
                error.message : 
                'An error occurred while adding the user';
        }
    }

    async function editUser(user: User) {
        showEditModal = true;
        editingUser = { ...user };
    }

    async function saveEdit() {
        if (!editingUser) return;
        
        try {
            const res = await fetch(`/api/users/${editingUser.user_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_name: editingUser.user_name,
                    user_age: editingUser.user_age,
                    bio: editingUser.bio
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Extract the user from the response
            const updatedUser = data.user;
            users = users.map(u => u.user_id === updatedUser.user_id ? updatedUser : u);
            showEditModal = false;
        } catch (error) {
            errorMessage = error instanceof Error ? 
                `An error occurred while updating user: ${error.message}` : 
                'An unknown error occurred';
        }
    }

    async function deleteUser(userId: number) {
        if (!confirm('Are you sure you want to delete this user?')) return;
        
        try {
            const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            
            // No need to check response body for DELETE
            users = users.filter(u => u.user_id !== userId);
        } catch (error) {
            errorMessage = error instanceof Error ? 
                `An error occurred while deleting user: ${error.message}` : 
                'An unknown error occurred';
        }
    }

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
                body: JSON.stringify({
                    userIds: selectedIds,
                    instructions: aiInstructions.trim() || 'Provide a concise summary and a relevant connection between the users.',
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate summary');
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

    {#if errorMessage}
        <div class="mb-4 p-3 bg-red-100 text-red-700 rounded">{errorMessage}</div>
    {/if}

    <form on:submit|preventDefault={addUser} class="mb-6 flex gap-2">
        <input type="text" bind:value={newName} placeholder="Name" required class="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <input type="number" bind:value={newAge} placeholder="Age" min="0" class="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <textarea bind:value={newBio} placeholder="Bio" class="border p-2 rounded w-1/3 focus:outline-none focus:ring-2 focus:ring-green-500" rows="2"></textarea>
        <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">Add User</button>
    </form>

    <table class="min-w-full bg-white border mb-6">
        <thead>
            <tr>
                <th class="border p-2">Select</th>
                <th class="border p-2">ID</th>
                <th class="border p-2">Name</th>
                <th class="border p-2">Age</th>
                <th class="border p-2">Bio</th>
                <th class="border p-2">Actions</th>
            </tr>
        </thead>
        <tbody>
            {#if users.length === 0}
                <tr><td colspan="5" class="border p-2 text-center text-gray-500">No users found. Add a user to get started!</td></tr>
            {/if}
            {#each users as user (user.user_id)}
                <tr>
                    <td class="border p-2 text-center"><input type="checkbox" bind:group={selectedIds} value={user.user_id} class="h-4 w-4" /></td>
                    <td class="border p-2">{user.user_id}</td>
                    <td class="border p-2">{user.user_name}</td>
                    <td class="border p-2">{user.user_age ?? 'N/A'}</td>
                    <td class="border p-2">{user.bio ?? 'No bio'}</td>
                    <td class="border p-2 text-center">
                        <button on:click={() => editUser(user)} class="text-blue-600 hover:text-blue-800">
                            <Pencil size={20} />
                        </button>
                        <button on:click={() => deleteUser(user.user_id)} class="text-red-600 hover:text-red-800">
                            <Trash2 size={20} />
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>

    <div class="mb-6">
        <label for="aiInstructions" class="block text-sm font-medium text-gray-700 mb-1">AI Instructions (optional):</label>
        <textarea
            id="aiInstructions"
            bind:value={aiInstructions}
            placeholder="e.g., 'Summarize in a humorous tone and highlight shared interests.'"
            class="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
        ></textarea>
    </div>

    <button
        on:click={getSummary}
        disabled={isLoading || selectedIds.length === 0}
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mb-4 disabled:bg-blue-300 disabled:cursor-not-allowed"
    >
        {#if isLoading}Generating...{:else}Get Summary{/if}
    </button>

    {#if summary}
        <h2 class="text-xl font-semibold mb-2">AI-Generated Summary</h2>
        <p class="p-4 bg-gray-100 rounded">{summary}</p>
    {/if}

    {#if showEditModal}
        <div class="fixed inset-0 flex items-center justify-center bg-opacity-20">
            <div class="bg-white p-6 rounded shadow-lg w-1/3">
                <h2 class="text-xl font-semibold mb-4">Edit User</h2>
                <form on:submit|preventDefault={saveEdit}>
                    {#if editingUser}
                        <input type="text" bind:value={editingUser.user_name} placeholder="Name" required class="border p-2 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" />
                        <input type="number" bind:value={editingUser.user_age} placeholder="Age" min="0" class="border p-2 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" />
                        <textarea bind:value={editingUser.bio} placeholder="Bio" class="border p-2 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" rows="2"></textarea>
                    {/if}
                    <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">Save</button>
                    <button type="button" on:click={() => showEditModal = false} class="ml-2 text-red-500 hover:text-red-700">Cancel</button>
                </form>
            </div>
        </div>
    {/if}
</div>