// Fetch and display users when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetch('/users')
        .then((response) => response.json())
        .then((users) => {
            const userTable = document.getElementById('userTable').querySelector('tbody');
            userTable.innerHTML = ''; // Clear existing table rows
            users.forEach((user) => {
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
        })
        .catch((error) => console.error('Error fetching users:', error));
});

// Function to delete a user
function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        fetch(`/delete-user/${id}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (response.ok) {
                    alert('User deleted successfully!');
                    location.reload(); // Refresh the table
                } else {
                    alert('Error deleting user.');
                }
            })
            .catch((error) => console.error('Error:', error));
    }
}

// Function to open the edit modal
function editUser(id, name, email) {
    document.getElementById('editUserId').value = id;
    document.getElementById('editUserName').value = name;
    document.getElementById('editUserEmail').value = email;
    document.getElementById('editModal').style.display = 'block';
}

// Function to close the edit modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Function to save the updated user details
function saveUser() {
    const id = document.getElementById('editUserId').value;
    const name = document.getElementById('editUserName').value;
    const email = document.getElementById('editUserEmail').value;

    fetch(`/update-user/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
    })
        .then((response) => {
            if (response.ok) {
                alert('User updated successfully!');
                location.reload(); // Refresh the table
            } else {
                alert('Error updating user.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    closeEditModal();
}