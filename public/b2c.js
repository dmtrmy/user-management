document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    try {
        const response = await fetch('/add-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email }),
        });

        if (response.ok) {
            window.location.href = '/success';
        } else {
            alert('Failed to submit details.');
        }
    } catch (err) {
        console.error(err);
        alert('An error occurred.');
    }
});