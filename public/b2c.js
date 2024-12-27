document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

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
            alert('Details submitted successfully!');
            window.location.href = '/success'; // Redirect to success page
        } else {
            const errorMessage = await response.text();
            alert(`Failed to submit details: ${errorMessage}`);
        }
    } catch (error) {
        console.error('Error submitting details:', error);
        alert('An unexpected error occurred.');
    }
});