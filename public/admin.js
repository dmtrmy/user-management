// Fetch and populate the user table
async function fetchUsers() {
    try {
        const response = await fetch('/users'); // Fetch users from the backend
        const users = await response.json(); // Parse JSON response
        const tableBody = document.querySelector('#userTable tbody');
        tableBody.innerHTML = ''; // Clear existing rows

        users.forEach(user => {
            const row = `
                <tr>
                    <td>${user.uuid}</td> <!-- Display UUID -->
                    <td>${user.name}</td> <!-- Display Name -->
                    <td>${user.email}</td> <!-- Display Email -->
                    <td>
                        <button onclick="editUser('${user.uuid}', '${user.name}', '${user.email}')">Edit</button>
                        <button onclick="deleteUser('${user.uuid}')">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row; // Append new row
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

async function deleteUser(uuid) {
    console.log('Deleting user with UUID:', uuid); // Log UUID for debugging

    if (confirm('Are you sure you want to delete this user?')) {
        try {
            const response = await fetch(`/delete-user/${uuid}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('User deleted successfully!');
                fetchUsers(); // Refresh the table
            } else {
                alert('Error deleting user.');
            }
        } catch (error) {
            console.error('Error deleting user:', error); // Log any errors
        }
    }
}

// Function to open the edit modal
function editUser(uuid, name, email) {
    document.getElementById('editUserId').value = uuid; // Use UUID
    document.getElementById('editUserName').value = name;
    document.getElementById('editUserEmail').value = email;
    document.getElementById('editModal').style.display = 'block';
}

// Function to close the edit modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Function to save the updated user details
async function saveUser() {
    const uuid = document.getElementById('editUserId').value; // Use UUID
    const name = document.getElementById('editUserName').value;
    const email = document.getElementById('editUserEmail').value;

    try {
        const response = await fetch(`/update-user/${uuid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email }),
        });

        if (response.ok) {
            alert('User updated successfully!');
            fetchUsers(); // Refresh the table
        } else {
            alert('Error updating user.');
        }
    } catch (error) {
        console.error('Error updating user:', error);
    }

    closeEditModal();
}

// Fetch and populate users when the page loads
document.addEventListener('DOMContentLoaded', fetchUsers);