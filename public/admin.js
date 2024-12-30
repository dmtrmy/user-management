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
                    <td>${user.street || 'N/A'}</td> <!-- Display Street -->
                    <td>${user.house_number || 'N/A'}</td> <!-- Display House Number -->
                    <td>${user.postal_code || 'N/A'}</td> <!-- Display Postal Code -->
                    <td>${user.city || 'N/A'}</td> <!-- Display City -->
                    <td>${user.created_at}</td> <!-- Display Date Created -->
                    <td>
                        <button onclick="editUser('${user.uuid}', '${user.name}', '${user.email}', '${user.street}', '${user.house_number}', '${user.postal_code}', '${user.city}')">Edit</button>
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

// Function to open the edit modal
function editUser(uuid, name, email, street, house_number, postal_code, city) {
    document.getElementById('editUserId').value = uuid; // Use UUID
    document.getElementById('editUserName').value = name;
    document.getElementById('editUserEmail').value = email;
    document.getElementById('editUserStreet').value = street; // Populate street
    document.getElementById('editUserHouseNumber').value = house_number; // Populate house number
    document.getElementById('editUserPostalCode').value = postal_code; // Populate postal code
    document.getElementById('editUserCity').value = city; // Populate city
    document.getElementById('editModal').style.display = 'block';
}

// Function to save the updated user details
async function saveUser() {
    const uuid = document.getElementById('editUserId').value; // Use UUID
    const name = document.getElementById('editUserName').value;
    const email = document.getElementById('editUserEmail').value;
    const street = document.getElementById('editUserStreet').value;
    const house_number = document.getElementById('editUserHouseNumber').value;
    const postal_code = document.getElementById('editUserPostalCode').value;
    const city = document.getElementById('editUserCity').value;

    try {
        const response = await fetch(`/update-user/${uuid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, street, house_number, postal_code, city }), // Include address data
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

// Function to close the edit modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Function to delete a user
async function deleteUser(uuid) {
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
            console.error('Error deleting user:', error);
        }
    }
}

// Fetch and populate users when the page loads
document.addEventListener('DOMContentLoaded', fetchUsers);