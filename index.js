// Replace 'http://localhost:3000' with your Render URL
const renderUrl = 'https://eczemafree.onrender.com'; // Update this with your actual Render URL

// Fetch the Stripe public key from the server
fetch(`${renderUrl}/get-stripe-public-key`)
    .then(response => response.json())
    .then(data => {
        // Initialize Stripe with the public key from the server
        const stripe = Stripe(data.publicKey); // Use the public key from the backend

        // Event listener for the "Buy Now" button
        document.querySelector('.buy-now').addEventListener('click', async (event) => {
            // Prevent the default action of the button (if it's inside a form)
            event.preventDefault();

            try {
                // Call the backend to create a checkout session
                const response = await fetch(`${renderUrl}/create-checkout-session`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        items: [
                            {
                                name: 'Eczema Relief Lotion',
                                quantity: 1,
                                price: 1999, // Price in cents (example: $19.99)
                                currency: 'usd',
                            },
                        ],
                    }),
                });

                // Check if the response is okay (status code 200-299)
                if (!response.ok) {
                    throw new Error('Failed to create checkout session');
                }

                const session = await response.json(); // Parse the JSON from the server

                // Redirect the user to Stripe Checkout
                const result = await stripe.redirectToCheckout({
                    sessionId: session.id, // Use the session ID from the backend
                });

                // Handle the error if redirection fails
                if (result.error) {
                    alert(result.error.message);
                }
            } catch (error) {
                console.error(error); // Log the error for debugging
                alert('An error occurred: ' + error.message); // Show an alert to the user
            }
        });
    })
    .catch(error => {
        console.error('Error fetching Stripe public key:', error);
        alert('An error occurred while fetching the Stripe public key.');
    });
