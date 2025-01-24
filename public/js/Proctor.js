
  document.querySelectorAll('.verify-button').forEach(button => {
    button.addEventListener('click', async (event) => {
      const listingId = button.getAttribute('data-id');
      const status = button.getAttribute('data-status');

        const response = await fetch(`/verify-listing`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: listingId, status }),
        });

        const result = await response.json();
        if (result.success) {
          window.location.reload();
      } 
  });
  });

