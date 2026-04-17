// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const dots = document.querySelectorAll('.dot');
    const getStartedButtons = document.querySelectorAll('.get-started-btn');
    const signupForm = document.getElementById('signupForm');
    const signupIdentifier = document.getElementById('signupIdentifier');
    const signupPassword = document.getElementById('signupPassword');
    const gotoLoginLink = document.getElementById('gotoLoginLink');
    const authNote = document.getElementById('authNote');
    const loggedInPanel = document.getElementById('loggedInPanel');
    const welcomeText = document.getElementById('welcomeText');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginForm = document.getElementById('loginForm');
    const loginIdentifier = document.getElementById('loginIdentifier');
    const loginPassword = document.getElementById('loginPassword');
    const loginNote = document.getElementById('loginNote');

    const STORAGE_ACCOUNT_KEY = 'agritwinAccount';
    const STORAGE_SESSION_KEY = 'agritwinSession';

    dots.forEach(dot => {
        dot.addEventListener('click', function() {
            const pageNum = this.getAttribute('data-page');
            navigateToPage(pageNum);
        });
    });

    getStartedButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-target-page');
            navigateToPage(targetPage);
        });
    });

    function normalizeIdentifier(value) {
        const trimmed = (value || '').trim();
        if (trimmed.includes('@')) {
            return trimmed.toLowerCase();
        }

        return trimmed.replace(/[\s-]/g, '');
    }

    function isValidIdentifier(value) {
        const normalized = normalizeIdentifier(value);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?\d{10,15}$/;
        return emailRegex.test(normalized) || phoneRegex.test(normalized);
    }

    function readAccount() {
        try {
            const raw = localStorage.getItem(STORAGE_ACCOUNT_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    }

    function readSession() {
        try {
            const raw = localStorage.getItem(STORAGE_SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    }

    function setLoggedInState(identifier) {
        if (welcomeText) {
            welcomeText.textContent = `Welcome back, ${identifier}`;
        }

        if (signupForm) {
            signupForm.classList.add('hidden');
        }

        if (gotoLoginLink) {
            gotoLoginLink.closest('.switch-auth-line').classList.add('hidden');
        }

        if (authNote) {
            authNote.textContent = 'You are logged in. Session is saved on this device.';
        }

        if (loggedInPanel) {
            loggedInPanel.classList.remove('hidden');
        }
    }

    function setLoggedOutState(noteText) {
        if (signupForm) {
            signupForm.classList.remove('hidden');
        }

        if (gotoLoginLink) {
            gotoLoginLink.closest('.switch-auth-line').classList.remove('hidden');
        }

        if (loggedInPanel) {
            loggedInPanel.classList.add('hidden');
        }

        if (authNote) {
            authNote.textContent = noteText;
        }
    }

    const savedAccount = readAccount();
    const savedSession = readSession();

    if (savedSession && savedSession.loggedIn && savedAccount && savedSession.identifier === savedAccount.identifier) {
        setLoggedInState(savedSession.identifier);
    } else {
        setLoggedOutState(savedAccount ? 'Account found. You can login from the Login link.' : 'Use your email or phone number to create your account.');
    }

    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const identifier = normalizeIdentifier(signupIdentifier ? signupIdentifier.value : '');
            const password = signupPassword ? signupPassword.value : '';

            if (!isValidIdentifier(identifier) || password.length < 6) {
                if (authNote) {
                    authNote.textContent = 'Enter a valid email or phone number and password with at least 6 characters.';
                }
                return;
            }

            localStorage.setItem(STORAGE_ACCOUNT_KEY, JSON.stringify({ identifier, password }));

            if (authNote) {
                authNote.textContent = 'Sign up successful. Click Login link below to continue.';
            }

            if (loginIdentifier) {
                loginIdentifier.value = identifier;
            }
        });
    }

    if (gotoLoginLink) {
        gotoLoginLink.addEventListener('click', function() {
            const currentSession = readSession();

            if (currentSession && currentSession.loggedIn) {
                navigateToPage(6);
                return;
            }

            navigateToPage(5);
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const storedAccount = readAccount();
            const identifier = normalizeIdentifier(loginIdentifier ? loginIdentifier.value : '');
            const password = loginPassword ? loginPassword.value : '';

            if (!storedAccount) {
                if (loginNote) {
                    loginNote.textContent = 'No account found. Please sign up first.';
                }
                return;
            }

            if (identifier !== storedAccount.identifier || password !== storedAccount.password) {
                if (loginNote) {
                    loginNote.textContent = 'Incorrect credentials. Use the same email/phone and password from sign up.';
                }
                return;
            }

            localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify({ loggedIn: true, identifier }));
            setLoggedInState(identifier);

            if (loginNote) {
                loginNote.textContent = 'Login successful.';
            }

            navigateToPage(6);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem(STORAGE_SESSION_KEY);

            if (signupPassword) {
                signupPassword.value = '';
            }

            if (loginPassword) {
                loginPassword.value = '';
            }

            const account = readAccount();
            setLoggedOutState(account ? 'Logged out. Use Login link to sign in again.' : 'Use your email or phone number to create your account.');
            navigateToPage(4);
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            navigatePrevious();
        } else if (e.key === 'ArrowRight') {
            navigateNext();
        }
    });
});

function navigateToPage(pageNum) {
    const pages = document.querySelectorAll('.page');
    const dots = document.querySelectorAll('.dot');

    // Remove active class from all pages and dots
    pages.forEach(page => page.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Add active class to selected page and dot
    const pageIndex = Number(pageNum) - 1;

    if (!pages[pageIndex]) {
        return;
    }

    pages[pageIndex].classList.add('active');

    if (dots[pageIndex]) {
        dots[pageIndex].classList.add('active');
    }
}

function navigateNext() {
    const activePage = document.querySelector('.page.active');
    const currentIndex = Array.from(document.querySelectorAll('.page')).indexOf(activePage);
    const pages = document.querySelectorAll('.page');
    
    if (currentIndex < pages.length - 1) {
        navigateToPage(currentIndex + 2);
    }
}

function navigatePrevious() {
    const activePage = document.querySelector('.page.active');
    const currentIndex = Array.from(document.querySelectorAll('.page')).indexOf(activePage);
    
    if (currentIndex > 0) {
        navigateToPage(currentIndex);
    }
}

// Touch/Swipe navigation for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, false);

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, false);

function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
        // Swiped left
        navigateNext();
    }
    if (touchEndX > touchStartX + 50) {
        // Swiped right
        navigatePrevious();
    }
}
