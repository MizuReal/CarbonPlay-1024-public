async function loadNavbar(activeKey){
  try {
    window.__SET_ACTIVE_NAV__ = activeKey || null;
    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) return;
    const res = await fetch('frontend/partials/navbar.html', { cache: 'no-store' });
    const html = await res.text();
    placeholder.innerHTML = html;
    // small delay to let partial script run
    setTimeout(() => initNavbar(activeKey), 50);
  } catch (e) {
    // swallow errors to avoid breaking pages
  }
}

function initNavbar(activeKey){
  // Apply active tab
  // Mark active links (desktop + mobile)
  if (activeKey) {
    document.querySelectorAll('[data-active]').forEach(a => {
      if (a.getAttribute('data-active') === activeKey) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }

  const token = localStorage.getItem('token');
  const logoutBtn = document.getElementById('navLogoutBtn');
  const loginBtn = document.getElementById('navLoginBtn');
  const userName = document.getElementById('navUserName');
  const initials = document.getElementById('navUserInitials');

  const show = el => { if (el) el.classList.remove('hidden'); };
  const hide = el => { if (el) el.classList.add('hidden'); };

  if (token) {
    show(logoutBtn); show(userName); show(initials); hide(loginBtn);
    // Fetch user info for display
    fetch('http://localhost:3000/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` }})
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        const user = d.data || {};
        if (userName) userName.textContent = user.username || 'User';
        
        // Update profile picture or initials
        if (initials) {
          const avatarDiv = initials.querySelector('div');
          if (user.profile && user.profile.profile_picture) {
            // Show profile picture
            const imgUrl = `http://localhost:3000/backend${user.profile.profile_picture}`;
            if (avatarDiv) {
              avatarDiv.innerHTML = `<img src="${imgUrl}" alt="Profile" class="w-full h-full object-cover rounded-full">`;
              avatarDiv.classList.remove('bg-primary', 'text-white', 'flex', 'items-center', 'justify-center');
            }
          } else {
            // Show initials
            const initial = (user.username || 'U').charAt(0).toUpperCase();
            if (avatarDiv) {
              avatarDiv.textContent = initial;
            } else {
              initials.textContent = initial;
            }
          }
        }
      })
      .catch(() => {});

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
      });
    }
  } else {
    hide(logoutBtn); hide(userName); hide(initials); show(loginBtn);
  }
}
