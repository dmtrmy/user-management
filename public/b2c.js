document.getElementById('userForm').addEventListener('submit', async (e) => {
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
        alert('Details submitted successfully!');
        document.getElementById('userForm').reset();
    } else {
        alert('Failed to submit details.');
    }
});