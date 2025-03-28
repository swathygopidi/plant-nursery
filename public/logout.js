document.addEventListener('DOMContentLoaded', function() {
    const logoutLink = document.getElementById('logoutLink');

    if (logoutLink) {
        logoutLink.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default link behavior

            // Your logout logic here. For example:
            console.log('Logout Successful');

            // Example: Redirect to a login page
            window.location.href = 'homepage.html'; // Replace 'login.html' with your login page URL     
        });
    } else {
        console.error('Logout link not found.');
    }
}); 
