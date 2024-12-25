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
        `;
        userTable.appendChild(row);
    });
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