// Function to fetch all users and display them
async function fetchUsers() {
    const response = await fetch('/users');
    const users = await response.json();

    const userTable = document.getElementById('userTable').querySelector('tbody');
    userTable.innerHTML = ''; // Clear existing rows

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <button onclick="editUser(${user.id}, '${user.name}', '${user.email}')">Edit</button>
                <button onclick="deleteUser(${user.id})">Delete</button>
            </td>
        `;
        userTable.appendChild(row);
    });
}

async function editUser(id, currentName, currentEmail) {
    const newName = prompt('Enter new name:', currentName);
    const newEmail = prompt('Enter new email:', currentEmail);

    if (!newName || !newEmail) return alert('Name and email are required!');

    const response = await fetch(`/update-user/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName, email: newEmail }),
    });

    if (response.ok) {
        alert('User updated successfully!');
        fetchUsers();
    } else {
        alert('Error updating user.');
    }
}

async function deleteUser(id) {
    const confirmDelete = confirm('Are you sure you want to delete this user?');
    if (!confirmDelete) return;

    const response = await fetch(`/delete-user/${id}`, {
        method: 'DELETE',
    });

    if (response.ok) {
        alert('User deleted successfully!');
        fetchUsers();
    } else {
        alert('Error deleting user.');
    }
}

// Function to add a new user
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    const response = await fetch('/add-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
    });

    if (response.ok) {
        alert('User added successfully!');
        document.getElementById('addUserForm').reset();
        fetchUsers();
    } else {
        const error = await response.text();
        alert(`Error: ${error}`);
    }
});

// Fetch users when the page loads
fetchUsers();