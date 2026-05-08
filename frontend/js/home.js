document.addEventListener('DOMContentLoaded', async () => {
    const loggedEmail = localStorage.getItem('loggedEmail');
    const navAuth = document.getElementById('navAuth');
    const navProfile = document.getElementById('navProfile');
    const noticeLink = document.getElementById('noticeLink');
    const calendarLink = document.getElementById('calendarLink');
    const heroWelcome = document.getElementById('heroWelcome');
    const heroButtons = document.getElementById('heroButtons');
    const greetingText = document.getElementById('greetingText');
    const batchText = document.getElementById('batchText');
    const heroName = document.getElementById('heroName');
    const heroMsg = document.getElementById('heroMsg');

    if (loggedEmail) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:3000/profile/${loggedEmail}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const user = await response.json();

            if (response.ok && user && user.name) {
                // Update Navbar
                navAuth.style.display = 'none';
                navProfile.style.display = 'flex';
                noticeLink.style.display = 'inline-block';
                noticeLink.href = 'notices.html';
                calendarLink.style.display = 'inline-block';
                calendarLink.href = 'calendar.html';

                // Set Greeting
                const hour = new Date().getHours();
                let greeting = "Good Morning";
                if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
                else if (hour >= 17) greeting = "Good Evening";

                greetingText.innerText = `${greeting}, ${user.name}`;
                batchText.innerText = `Branch: ${user.branch || 'N/A'} | Batch: ${user.batch_start || '?'}-${user.batch_end || '?'}`;

                // Update Hero
                if (heroButtons) heroButtons.style.display = 'none';
                if (heroWelcome) heroWelcome.style.display = 'block';
                if (heroName) heroName.innerText = `Welcome Back, ${user.name}!`;
                if (heroMsg) heroMsg.innerText = `Explore your ${greeting.toLowerCase()} updates on the Notice Board.`;
            } else {
                console.warn('Profile fetch unsuccessful or name missing:', user);
                // If token is invalid/expired, maybe logout?
                // logout(); 
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    }
});

function logout() {
    localStorage.removeItem('loggedEmail');
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
}