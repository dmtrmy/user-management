// Initialize Supabase client
const supabaseClient = supabase.createClient(
    'https://ovdbjdhxpznokaggshep.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92ZGJqZGh4cHpub2thZ2dzaGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MDU4MTUsImV4cCI6MjA1MTA4MTgxNX0.mJMmxNqKPC0XhaSQy96hRLp0Ed4qbdm7LcOvDph2YCA'
);

// Check if the user is logged in and authorized
async function checkAuth() {
    try {
        // Immediately hide dashboard and login required sections to prevent flashing
        document.getElementById('dashboardDiv').style.display = 'none';
        document.getElementById('loginRequired').style.display = 'none';

        const { data: { session }, error } = await supabaseClient.auth.getSession();
        console.log('Session check:', session); // Debug log

        if (error) throw error;

        if (session) {
            console.log('User is logged in:', session.user.email);

            // Check if the logged-in user is an authorized admin
            const adminCheckResponse = await fetch('/check-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: session.user.email })
            });

            const adminCheckData = await adminCheckResponse.json();

            if (adminCheckData.authorized) {
                // Admin user, show dashboard
                document.getElementById('dashboardDiv').style.display = 'block';
                fetchUsers();
            } else {
                // Not authorized
                alert('You are not authorized to access this admin area.');
                window.location.href = '/login.html';  // Redirect to login page
            }
        } else {
            console.log('No active session');
            document.getElementById('loginRequired').style.display = 'block';
        }
    } catch (error) {
        console.error('Auth error:', error.message);
        document.getElementById('loginRequired').style.display = 'block';
    }
}

// Auth state change listener
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session); // Debug log
    
    if (event === 'SIGNED_IN') {
        console.log('User signed in');
        document.getElementById('dashboardDiv').style.display = 'block';
        document.getElementById('loginRequired').style.display = 'none';
        fetchUsers();
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        document.getElementById('loginRequired').style.display = 'block';
        document.getElementById('dashboardDiv').style.display = 'none';
    }
});

// Call checkAuth when page loads
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Auth state change listener
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session); // Debug log
    
    if (event === 'SIGNED_IN') {
        console.log('User signed in');
        document.getElementById('dashboardDiv').style.display = 'block';
        document.getElementById('loginRequired').style.display = 'none';
        fetchUsers();
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        document.getElementById('loginRequired').style.display = 'block';
        document.getElementById('dashboardDiv').style.display = 'none';
    }
});

// Call checkAuth when page loads
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Fetch and populate the user table
async function fetchUsers() {
    try {
        const response = await fetch('/users');  // Your backend endpoint to fetch users
        const users = await response.json();
        const tableBody = document.querySelector('#userTable tbody');
        tableBody.innerHTML = '';  // Clear existing rows

        users.forEach(user => {
            const row = `
                <tr>
                    <td>${user.uuid}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.street || 'N/A'}</td>
                    <td>${user.house_number || 'N/A'}</td>
                    <td>${user.postal_code || 'N/A'}</td>
                    <td>${user.city || 'N/A'}</td>
                    <td>${user.created_at}</td>
                    <td>
                        <button onclick="editUser('${user.uuid}', '${user.name}', '${user.email}', '${user.street}', '${user.house_number}', '${user.postal_code}', '${user.city}')">Edit</button>
                        <button onclick="deleteUser('${user.uuid}')">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;  // Append new row to table
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Function to log out the user
async function logOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.error('Error signing out:', error.message);
    }
    window.location.href = '/login.html';  // Redirect to login page after logout
}

// Function to delete a user
async function deleteUser(uuid) {
    const confirmation = confirm("Are you sure you want to delete this user?");
    if (confirmation) {
        try {
            const response = await fetch(`/delete-user/${uuid}`, { method: 'DELETE' });
            if (response.ok) {
                alert('User deleted successfully!');
                fetchUsers();  // Refresh the table after deletion
            } else {
                alert('Error deleting user.');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }
}

// Function to open the edit modal
function editUser(uuid, name, email, street, house_number, postal_code, city) {
    document.getElementById('editUserId').value = uuid;
    document.getElementById('editUserName').value = name;
    document.getElementById('editUserEmail').value = email;
    document.getElementById('editUserStreet').value = street;
    document.getElementById('editUserHouseNumber').value = house_number;
    document.getElementById('editUserPostalCode').value = postal_code;
    document.getElementById('editUserCity').value = city;
    document.getElementById('editModal').style.display = 'block';  // Show modal
}

// Function to save the updated user details
async function saveUser() {
    const uuid = document.getElementById('editUserId').value;
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
            body: JSON.stringify({ name, email, street, house_number, postal_code, city }),
        });

        if (response.ok) {
            alert('User updated successfully!');
            fetchUsers();  // Refresh the table after update
            closeEditModal();
        } else {
            const errorData = await response.json();
            console.error('Error data:', errorData);
            alert('Error updating user.');
        }
    } catch (error) {
        console.error('Error updating user:', error);
    }
}

// Function to close the edit modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}