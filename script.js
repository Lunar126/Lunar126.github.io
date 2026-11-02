/* ============ APPLE EMOJI ============ */
const APPLE_CDN = 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/';

function emojiToCodepoint(char) {
    let cp = char.codePointAt(0).toString(16);
    let result = cp;
    let rest = char.slice(String.fromCodePoint(char.codePointAt(0)).length);
    while (rest.length > 0) {
        cp = rest.codePointAt(0).toString(16);
        result += '-' + cp;
        rest = rest.slice(String.fromCodePoint(rest.codePointAt(0)).length);
    }
    return result;
}
function emojiImg(char, cls = '') {
    const cp = emojiToCodepoint(char);
    const classes = 'emoji' + (cls ? ' ' + cls : '');
    return `<img class="${classes}" src="${APPLE_CDN}${cp}.png" alt="${char}" onerror="this.onerror=null;this.src='${APPLE_CDN}${cp}-fe0f.png';this.onerror=function(){this.style.display='none';};">`;
}
function applyEmojiToStatic() {
    document.querySelectorAll('[data-emoji]').forEach(el => {
        if (el.querySelector('img.emoji')) return;
        const char = el.getAttribute('data-emoji');
        const size = el.getAttribute('data-size') || '';
        el.innerHTML = emojiImg(char, size);
    });
}

/* ============ ТЕМА ============ */
function initTheme() {
    const savedTheme = localStorage.getItem('lunar_theme') || 'dark';
    document.body.classList.toggle('theme-light', savedTheme === 'light');
    document.body.classList.toggle('theme-dark', savedTheme === 'dark');
}
function toggleTheme() {
    const isLight = document.body.classList.contains('theme-light');
    const newTheme = isLight ? 'dark' : 'light';
    document.body.classList.toggle('theme-light', newTheme === 'light');
    document.body.classList.toggle('theme-dark', newTheme === 'dark');
    localStorage.setItem('lunar_theme', newTheme);
    sound.play('click');
    showNotif('Тема', newTheme === 'light' ? 'Светлая' : 'Тёмная');
}
initTheme();

/* ============ АУДИО ============ */
class SoundEngine {
    constructor() { this.ctx = null; this.enabled = true; this.masterGain = null; }
    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.12;
        this.masterGain.connect(this.ctx.destination);
    }
    play(type) {
        if (!this.enabled) return;
        try { this.init(); } catch(e) { return; }
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;
        const tones = {
            message: [{f:880, f2:1320, d:.2, t:'sine', v:.3}],
            send: [{f:660, f2:990, d:.15, t:'triangle', v:.25}],
            click: [{f:1200, d:.05, t:'sine', v:.15}],
            like: [{f:523, f2:1046, d:.2, t:'sine', v:.2}],
            error: [{f:200, f2:120, d:.15, t:'sawtooth', v:.15}],
            notif: [{f:1046, f2:1568, d:.3, t:'sine', v:.25}],
            enter: [{f:523, d:.15, t:'sine', v:.15},{f:659, d:.15, t:'sine', v:.15, delay:.08},{f:784, d:.15, t:'sine', v:.15, delay:.16},{f:1046, d:.3, t:'sine', v:.2, delay:.24}],
            success: [{f:523, d:.12, t:'sine', v:.2},{f:659, d:.12, t:'sine', v:.2, delay:.12},{f:784, d:.12, t:'sine', v:.2, delay:.24},{f:1046, d:.4, t:'sine', v:.25, delay:.36}],
            photo: [{f:784, d:.1, t:'sine', v:.15},{f:1046, d:.15, t:'sine', v:.2, delay:.1}]
        };
        if (['enter','success','photo'].includes(type)) {
            const list = tones[type] || tones.click;
            list.forEach((tone, i) => {
                const start = now + (tone.delay || i * 0.08);
                const o = this.ctx.createOscillator(), g = this.ctx.createGain();
                o.type = tone.t || 'sine';
                o.frequency.setValueAtTime(tone.f, start);
                if (tone.f2) o.frequency.exponentialRampToValueAtTime(tone.f2, start + (tone.d || .2));
                g.gain.setValueAtTime(0, start);
                g.gain.linearRampToValueAtTime(tone.v || .2, start + 0.02);
                g.gain.exponentialRampToValueAtTime(0.001, start + (tone.d || .2) + 0.1);
                o.connect(g); g.connect(this.masterGain);
                o.start(start); o.stop(start + (tone.d || .2) + 0.15);
            });
            return;
        }
        const cfg = tones[type];
        if (!cfg) return;
        cfg.forEach(tone => {
            const o = this.ctx.createOscillator(), g = this.ctx.createGain();
            o.type = tone.t || 'sine';
            o.frequency.setValueAtTime(tone.f, now);
            if (tone.f2) o.frequency.exponentialRampToValueAtTime(tone.f2, now + (tone.d || .2));
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(tone.v || .2, now + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, now + (tone.d || .2) + 0.1);
            o.connect(g); g.connect(this.masterGain);
            o.start(now); o.stop(now + (tone.d || .2) + 0.15);
        });
    }
}
const sound = new SoundEngine();

/* ============ КОНСТАНТЫ ============ */
const avatarEmojis = ['😎','🌟','🔥','❄️','🎮','🎨','🚀','🦊','🐺','🦁','🐉','🦄','💎','👑','⚡','🌙','☀️','🌈','💚','🎭','👾','🤖','🦅','🐬','🌸','🍀','🎯','🎧','💫','✨','🖤','⚔️'];
const avatarColors = [
    ['#38bdf8', '#60a5fa'], ['#22d3ee', '#38bdf8'], ['#818cf8', '#60a5fa'],
    ['#2dd4bf', '#22d3ee'], ['#a78bfa', '#818cf8'], ['#60a5fa', '#818cf8'],
    ['#10b981', '#34d399'], ['#059669', '#10b981'], ['#f59e0b', '#fbbf24'],
    ['#ef4444', '#f87171'], ['#ec4899', '#f472b6'], ['#8b5cf6', '#a78bfa'],
    ['#06b6d4', '#22d3ee'], ['#84cc16', '#a3e635'], ['#f97316', '#fb923c'], ['#64748b', '#94a3b8']
];
const banners = [
    { id: 'default', css: 'linear-gradient(135deg, #1e3a5f, #0f172a, #1e293b)' },
    { id: 'lunar', css: 'linear-gradient(135deg, #1e293b, #cbd5e1, #0f172a)' },
    { id: 'emerald', css: 'linear-gradient(135deg, #064e3b, #10b981, #0f172a)' },
    { id: 'sunset', css: 'linear-gradient(135deg, #7c2d12, #f59e0b, #0f172a)' },
    { id: 'ocean', css: 'linear-gradient(135deg, #0c4a6e, #38bdf8, #0f172a)' },
    { id: 'cosmos', css: 'linear-gradient(135deg, #3b0764, #8b5cf6, #0f172a)' },
    { id: 'fire', css: 'linear-gradient(135deg, #7f1d1d, #ef4444, #0f172a)' },
    { id: 'aurora', css: 'linear-gradient(135deg, #10b981, #38bdf8, #8b5cf6)' },
    { id: 'rose', css: 'linear-gradient(135deg, #831843, #ec4899, #0f172a)' }
];
const frames = [
    { id: 'none', name: 'Без', class: 'avatar-frame-none' },
    { id: 'emerald', name: 'Изумруд', class: 'avatar-frame-emerald' },
    { id: 'neon', name: 'Неон', class: 'avatar-frame-neon' },
    { id: 'fire', name: 'Огонь', class: 'avatar-frame-fire' },
    { id: 'ice', name: 'Лёд', class: 'avatar-frame-ice' }
];

/* ============ STATE ============ */
const state = {
    user: null, login: null, activeConv: null, convs: [],
    filter: 'all', search: '',
    soundEnabled: true, replyTo: null,
    totalMessages: 0, totalPosts: 0,
    createType: 'channel', createSelectedColor: 0,
    profile: {
        nickname: '', bio: '',
        avatarType: 'emoji', avatarEmoji: '😎', avatarColor: 0,
        avatarPhoto: null, avatarPhotoName: '', avatarPhotoSize: 0,
        banner: 'default', frame: 'none'
    },
    tempProfile: null
};

/* ============ ПАРОЛИ ============ */
function hashPassword(password) {
    let hash = 0;
    const salt = 'lunar_salt_v1';
    const str = salt + password;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return 'h_' + Math.abs(hash).toString(36) + '_' + password.length;
}
function validateLogin(login) {
    if (!login || login.length < 3) return 'Логин должен быть минимум 3 символа';
    if (login.length > 20) return 'Логин слишком длинный';
    if (!/^[a-zA-Z0-9_]+$/.test(login)) return 'Только латиница, цифры и _';
    return null;
}
function validatePassword(password) {
    if (!password || password.length < 6) return 'Пароль должен быть минимум 6 символов';
    return null;
}
function getPasswordStrength(pwd) {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd) || /[^a-zA-Z0-9]/.test(pwd)) score++;
    return Math.min(score, 4);
}

/* ============ ХРАНИЛИЩЕ ============ */
function getUsers() { try { return JSON.parse(localStorage.getItem('lunar_accounts') || '{}'); } catch(e) { return {}; } }
function saveUsers(users) { localStorage.setItem('lunar_accounts', JSON.stringify(users)); }
function showMsg(id, text) { const el = document.getElementById(id); if (!el) return; el.textContent = text; el.classList.add('visible'); setTimeout(() => el.classList.remove('visible'), 4000); }
function hideMsg(id) { const el = document.getElementById(id); if (el) el.classList.remove('visible'); }

/* ============ ФОТО ============ */
function compressPhoto(file, maxSize = 256) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) { reject(new Error('Файл должен быть изображением')); return; }
        if (file.size > 5 * 1024 * 1024) { reject(new Error('Файл больше 5 МБ')); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const size = Math.min(img.width, img.height);
                const sx = (img.width - size) / 2;
                const sy = (img.height - size) / 2;
                const cvs = document.createElement('canvas');
                cvs.width = maxSize; cvs.height = maxSize;
                const ctx = cvs.getContext('2d');
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, sx, sy, size, size, 0, 0, maxSize, maxSize);
                resolve(cvs.toDataURL('image/jpeg', 0.85));
            };
            img.onerror = () => reject(new Error('Не удалось загрузить изображение'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Ошибка чтения файла'));
        reader.readAsDataURL(file);
    });
}
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

/* ============ AUTH ============ */
document.querySelectorAll('.auth-switcher button').forEach(btn => {
    btn.addEventListener('click', () => {
        sound.play('click');
        document.querySelectorAll('.auth-switcher button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.auth-step').forEach(s => s.classList.remove('active'));
        const mode = btn.dataset.mode;
        document.getElementById(mode === 'login' ? 'authLogin' : 'authRegister').classList.add('active');
        hideMsg('loginError'); hideMsg('loginSuccess'); hideMsg('registerError');
    });
});

document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        if (!input) return;
        if (input.type === 'password') {
            input.type = 'text';
            btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        } else {
            input.type = 'password';
            btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>';
        }
    });
});

const regPasswordInput = document.getElementById('regPassword');
const strengthEl = document.getElementById('pwdStrength');
const hintEl = document.getElementById('pwdHint');
regPasswordInput.addEventListener('input', () => {
    const val = regPasswordInput.value;
    const strength = getPasswordStrength(val);
    strengthEl.dataset.strength = strength;
    if (val.length === 0) hintEl.classList.remove('visible');
    else {
        hintEl.classList.add('visible');
        if (val.length < 6) { hintEl.textContent = 'Минимум 6 символов'; hintEl.style.color = 'var(--danger)'; }
        else if (strength <= 1) { hintEl.textContent = 'Слабый пароль'; hintEl.style.color = 'var(--danger)'; }
        else if (strength === 2) { hintEl.textContent = 'Средний пароль'; hintEl.style.color = '#fbbf24'; }
        else if (strength === 3) { hintEl.textContent = 'Хороший пароль'; hintEl.style.color = '#a3e635'; }
        else { hintEl.textContent = 'Отличный пароль'; hintEl.style.color = 'var(--success)'; }
    }
});

document.getElementById('registerBtn').addEventListener('click', () => {
    const login = document.getElementById('regUsername').value.trim().toLowerCase();
    const pwd = document.getElementById('regPassword').value;
    const pwd2 = document.getElementById('regPassword2').value;
    hideMsg('registerError');
    const loginErr = validateLogin(login);
    if (loginErr) { showMsg('registerError', loginErr); sound.play('error'); return; }
    const pwdErr = validatePassword(pwd);
    if (pwdErr) { showMsg('registerError', pwdErr); sound.play('error'); return; }
    if (pwd !== pwd2) { showMsg('registerError', 'Пароли не совпадают'); sound.play('error'); return; }
    const users = getUsers();
    if (users[login]) { showMsg('registerError', 'Этот логин уже занят'); sound.play('error'); return; }
    const btn = document.getElementById('registerBtn');
    btn.classList.add('loading');
    btn.innerHTML = '<div class="spinner"></div><span>Создание...</span>';
    setTimeout(() => {
        const nickname = login.charAt(0).toUpperCase() + login.slice(1);
        users[login] = {
            login, nickname, passwordHash: hashPassword(pwd),
            createdAt: Date.now(), lastLogin: Date.now(),
            profile: { nickname, bio: '', avatarType: 'emoji', avatarEmoji: '😎', avatarColor: 0, avatarPhoto: null, avatarPhotoName: '', avatarPhotoSize: 0, banner: 'default', frame: 'none' }
        };
        saveUsers(users);
        state.user = nickname; state.login = login;
        state.profile = { ...users[login].profile };
        try { localStorage.setItem('lunar_session', JSON.stringify({ login, nickname, loginAt: Date.now() })); } catch(e) {}
        sound.play('success');
        showNotif('Аккаунт создан', 'Добро пожаловать в Lunar, ' + nickname);
        btn.classList.remove('loading');
        btn.innerHTML = '<span>Создать аккаунт</span>';
        setTimeout(enterApp, 500);
    }, 700);
});
['regUsername', 'regPassword', 'regPassword2'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('registerBtn').click(); });
});

document.getElementById('loginBtn').addEventListener('click', () => {
    const login = document.getElementById('loginUsername').value.trim().toLowerCase();
    const pwd = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberMe').checked;
    hideMsg('loginError'); hideMsg('loginSuccess');
    if (!login) { showMsg('loginError', 'Введите логин'); sound.play('error'); return; }
    if (!pwd) { showMsg('loginError', 'Введите пароль'); sound.play('error'); return; }
    const users = getUsers();
    const user = users[login];
    if (!user) { showMsg('loginError', 'Пользователь не найден'); sound.play('error'); return; }
    if (user.passwordHash !== hashPassword(pwd)) { showMsg('loginError', 'Неверный пароль'); sound.play('error'); return; }
    const btn = document.getElementById('loginBtn');
    btn.classList.add('loading');
    btn.innerHTML = '<div class="spinner"></div><span>Вход...</span>';
    setTimeout(() => {
        user.lastLogin = Date.now();
        saveUsers(users);
        state.user = user.nickname; state.login = login;
        state.profile = user.profile || { nickname: user.nickname, bio: '', avatarType: 'emoji', avatarEmoji: '😎', avatarColor: 0, avatarPhoto: null, avatarPhotoName: '', avatarPhotoSize: 0, banner: 'default', frame: 'none' };
        if (remember) { try { localStorage.setItem('lunar_session', JSON.stringify({ login, nickname: user.nickname, loginAt: Date.now() })); } catch(e) {} }
        sound.play('success');
        showMsg('loginSuccess', 'Успешный вход!');
        showNotif('С возвращением в Lunar!', user.nickname);
        btn.classList.remove('loading');
        btn.innerHTML = '<span>Войти</span>';
        setTimeout(enterApp, 400);
    }, 700);
});
['loginUsername', 'loginPassword'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('loginBtn').click(); });
});

/* ============ АВАТАР ============ */
function getAvatarContent() {
    const p = state.profile;
    if (p.avatarType === 'photo' && p.avatarPhoto) return `<img class="avatar-photo" src="${p.avatarPhoto}" alt="">`;
    if (p.avatarType === 'emoji') return `<div class="avatar-emoji-wrap">${emojiImg(p.avatarEmoji)}</div>`;
    return p.nickname.charAt(0).toUpperCase();
}
function getFrameClass() {
    const f = frames.find(fr => fr.id === state.profile.frame);
    return f ? f.class : 'avatar-frame-none';
}
function getBannerStyle() {
    const b = banners.find(bn => bn.id === state.profile.banner);
    return b ? b.css : banners[0].css;
}

function updateProfileUI() {
    const p = state.profile;
    const ua = document.getElementById('userAvatar');
    ua.innerHTML = getAvatarContent();
    if (p.avatarType === 'photo' && p.avatarPhoto) ua.style.background = 'var(--bg-tertiary)';
    else if (p.avatarType === 'color') { const c = avatarColors[p.avatarColor]; ua.style.background = `linear-gradient(135deg, ${c[0]}, ${c[1]})`; }
    else ua.style.background = 'linear-gradient(135deg, var(--accent), var(--blue))';

    const pa = document.getElementById('profileAvatar');
    pa.innerHTML = getAvatarContent();
    if (p.avatarType === 'photo' && p.avatarPhoto) pa.style.background = 'var(--bg-tertiary)';
    else if (p.avatarType === 'color') { const c = avatarColors[p.avatarColor]; pa.style.background = `linear-gradient(135deg, ${c[0]}, ${c[1]})`; }
    else pa.style.background = 'linear-gradient(135deg, var(--accent), var(--blue))';
    pa.className = 'profile-avatar-large ' + getFrameClass();
    document.getElementById('profileName').textContent = p.nickname;
    const bioEl = document.getElementById('profileBio');
    if (p.bio) { bioEl.textContent = p.bio; bioEl.classList.remove('empty'); } else bioEl.classList.add('empty');
    document.getElementById('profileLogin').textContent = '@' + state.login;
    document.getElementById('profileBanner').style.background = getBannerStyle();
    document.getElementById('statMessages').textContent = state.totalMessages;
    document.getElementById('statChats').textContent = state.convs.length;
    document.getElementById('statPosts').textContent = state.totalPosts;
    const removeBtn = document.getElementById('quickRemovePhotoBtn');
    if (removeBtn) removeBtn.style.display = (p.avatarType === 'photo' && p.avatarPhoto) ? 'flex' : 'none';
}

function enterApp() {
    loadFromStorage();
    updateProfileUI();
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('app').classList.add('visible');
    renderConvList();
    applyEmojiToStatic();
    const online = Math.max(1, state.convs.filter(c => c.type === 'group').length + 1);
    document.getElementById('onlineCount').textContent = online;
    saveToStorage();
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    if (!confirm('Выйти из аккаунта?')) return;
    try { localStorage.removeItem('lunar_session'); } catch(e) {}
    location.reload();
});

(function checkSession() {
    try {
        const session = JSON.parse(localStorage.getItem('lunar_session') || 'null');
        if (session && session.login && session.nickname) {
            const users = getUsers();
            if (users[session.login]) {
                state.user = session.nickname; state.login = session.login;
                state.profile = users[session.login].profile || { nickname: session.nickname, bio: '', avatarType: 'emoji', avatarEmoji: '😎', avatarColor: 0, avatarPhoto: null, avatarPhotoName: '', avatarPhotoSize: 0, banner: 'default', frame: 'none' };
                setTimeout(() => { enterApp(); showNotif('С возвращением в Lunar!', session.nickname); }, 300);
            }
        }
    } catch(e) {}
})();

/* ============ СОХРАНЕНИЕ ============ */
function saveToStorage() {
    try {
        const data = state.convs.map(c => ({
            id: c.id, name: c.name, description: c.description, type: c.type,
            color: c.color, messages: c.messages.slice(-200), unread: c.unread,
            members: c.members, creatorLogin: c.creatorLogin
        }));
        localStorage.setItem('lunar_contacts', JSON.stringify(data));
        localStorage.setItem('lunar_stats', JSON.stringify({ totalMessages: state.totalMessages, totalPosts: state.totalPosts }));
        if (state.login) {
            const users = getUsers();
            if (users[state.login]) { users[state.login].profile = state.profile; users[state.login].nickname = state.profile.nickname; saveUsers(users); }
        }
    } catch(e) {}
}
function loadFromStorage() {
    try {
        const raw = localStorage.getItem('lunar_contacts');
        if (raw) {
            const data = JSON.parse(raw);
            if (Array.isArray(data)) state.convs = data.map(c => ({ ...c, messages: (c.messages || []).map(m => ({ ...m })) }));
        }
        const stats = localStorage.getItem('lunar_stats');
        if (stats) { const s = JSON.parse(stats); state.totalMessages = s.totalMessages || 0; state.totalPosts = s.totalPosts || 0; }
    } catch(e) {}
}

/* ============ УТИЛИТЫ ============ */
function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function formatTime(ts) { return new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }); }
function formatConvTime(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'сейчас';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' мин';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' ч';
    return Math.floor(diff / 86400000) + ' д';
}
function initials(name) { const parts = name.trim().split(/\s+/); if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase(); return name.trim().slice(0, 2).toUpperCase(); }
function genId() { return 'c' + Date.now() + Math.random().toString(36).slice(2, 6); }

/* ============ РОЛИ ============ */
function getMemberRole(conv, login) {
    if (!conv || !conv.members) return null;
    const m = conv.members.find(m => m.login === login);
    return m ? m.role : null;
}
function canWrite(conv) {
    if (!conv) return false;
    if (conv.type === 'group') return true;
    const role = getMemberRole(conv, state.login);
    return role === 'creator' || role === 'admin';
}
function getRoleLabel(role) {
    if (role === 'creator') return '<span class="role-badge creator">создатель</span>';
    if (role === 'admin') return '<span class="role-badge admin">админ</span>';
    return '';
}

/* ============ СПИСОК ЧАТОВ ============ */
function renderConvList() {
    const container = document.getElementById('convItems');
    const unreadBadge = document.getElementById('chatsBadge');
    const unreadCountEl = document.getElementById('unreadCount');
    const totalUnread = state.convs.reduce((s, c) => s + (c.unread || 0), 0);
    if (totalUnread > 0) { unreadBadge.style.display = ''; unreadBadge.textContent = totalUnread > 99 ? '99+' : totalUnread; unreadCountEl.style.display = ''; unreadCountEl.textContent = totalUnread; }
    else { unreadBadge.style.display = 'none'; unreadCountEl.style.display = 'none'; }

    let filtered = state.convs;
    if (state.filter === 'channels') filtered = filtered.filter(c => c.type === 'channel');
    if (state.filter === 'groups') filtered = filtered.filter(c => c.type === 'group');
    if (state.filter === 'unread') filtered = filtered.filter(c => c.unread > 0);
    if (state.search) {
        const q = state.search.toLowerCase();
        filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.messages.some(m => m.text && m.text.toLowerCase().includes(q)));
    }
    filtered = [...filtered].sort((a, b) => {
        const aT = a.messages.length ? a.messages[a.messages.length - 1].time : 0;
        const bT = b.messages.length ? b.messages[b.messages.length - 1].time : 0;
        return bT - aT;
    });

    if (!filtered.length) {
        container.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:40px 20px;font-size:13px;line-height:1.6;">Нет чатов<br><span style="font-size:12px;">Нажмите + чтобы создать канал или группу</span></div>`;
        return;
    }

    container.innerHTML = filtered.map(c => {
        const last = c.messages[c.messages.length - 1];
        let preview = 'Нет сообщений';
        if (last) preview = (last.own ? 'Вы: ' : '') + (last.text || '');
        const time = last ? formatConvTime(last.time) : '';
        const badge = c.unread > 0 ? `<span class="conv-badge">${c.unread > 99 ? '99+' : c.unread}</span>` : '';
        const active = state.activeConv === c.id ? ' active' : '';
        const style = c.color ? `background: linear-gradient(135deg, ${c.color[0]}, ${c.color[1]})` : '';
        const typeIcon = c.type === 'channel' 
            ? `<span class="type-icon channel" title="Канал"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M3 11l18-8-8 18-2-8-8-2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></span>`
            : `<span class="type-icon group" title="Группа"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>`;
        const tag = c.type === 'channel' ? '<span class="channel-tag">канал</span>' : '<span class="group-tag">группа</span>';
        return `<div class="conv-item${active}" data-id="${c.id}">
            <div class="conv-avatar" style="${style}">${initials(c.name)}${typeIcon}</div>
            <div class="conv-body">
                <div class="conv-top"><div class="conv-name">${escapeHtml(c.name)} ${tag}</div><div class="conv-time">${time}</div></div>
                <div class="conv-bottom"><div class="conv-preview">${escapeHtml(preview)}</div>${badge}</div>
            </div>
        </div>`;
    }).join('');

    container.querySelectorAll('.conv-item').forEach(el => {
        el.addEventListener('click', () => openConv(el.dataset.id));
    });
}

/* ============ ОТКРЫТИЕ ЧАТА ============ */
function openConv(id) {
    sound.play('click');
    const conv = state.convs.find(c => c.id === id);
    if (!conv) return;
    state.activeConv = id;
    conv.unread = 0;
    state.replyTo = null;
    document.getElementById('replyBar').classList.remove('active');
    document.getElementById('emptyChat').style.display = 'none';
    document.getElementById('activeChat').style.display = 'flex';

    const avatar = document.getElementById('chatHeaderAvatar');
    avatar.textContent = initials(conv.name);
    avatar.style.background = conv.color ? `linear-gradient(135deg, ${conv.color[0]}, ${conv.color[1]})` : '';

    const nameEl = document.getElementById('chatHeaderName');
    const tag = conv.type === 'channel' ? '<span class="channel-tag">канал</span>' : '<span class="group-tag">группа</span>';
    nameEl.innerHTML = escapeHtml(conv.name) + ' ' + tag;

    const statusEl = document.getElementById('chatHeaderStatus');
    const memberCount = conv.members ? conv.members.length : 1;
    statusEl.textContent = conv.description || (conv.type === 'channel' ? memberCount + ' подписчиков' : memberCount + ' участников');

    const banner = document.getElementById('channelBanner');
    const bannerText = document.getElementById('channelBannerText');
    if (conv.type === 'channel') {
        banner.style.display = 'flex';
        bannerText.textContent = canWrite(conv) ? 'Вы можете писать в этом канале (создатель/админ)' : 'Только создатель и админы могут писать в этом канале';
    } else {
        banner.style.display = 'none';
    }

    const form = document.getElementById('messageForm');
    const readOnly = document.getElementById('readonlyBar');
    if (canWrite(conv)) { form.style.display = 'flex'; readOnly.style.display = 'none'; }
    else { form.style.display = 'none'; readOnly.style.display = 'flex'; }

    document.getElementById('convList').classList.add('mobile-hide');
    document.getElementById('chatWindow').classList.add('mobile-open');
    document.getElementById('backBtn').style.display = '';

    renderMessages();
    renderConvList();
    setTimeout(() => { const m = document.getElementById('messages'); m.scrollTop = m.scrollHeight; }, 50);
}
function closeChatMobile() {
    document.getElementById('convList').classList.remove('mobile-hide');
    document.getElementById('chatWindow').classList.remove('mobile-open');
}

/* ============ СООБЩЕНИЯ ============ */
function renderMessages() {
    const conv = state.convs.find(c => c.id === state.activeConv);
    if (!conv) return;
    const container = document.getElementById('messages');
    if (!conv.messages.length) {
        container.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px 20px;font-size:13px;">Начните общение</div>';
        return;
    }
    let html = '';
    let lastDate = null;
    conv.messages.forEach(m => {
        const d = new Date(m.time);
        const dateKey = d.toDateString();
        if (dateKey !== lastDate) {
            lastDate = dateKey;
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            let label = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
            if (dateKey === today) label = 'Сегодня';
            else if (dateKey === yesterday) label = 'Вчера';
            html += `<div class="date-divider"><span>${label}</span></div>`;
        }
        const own = m.own;
        const authorName = own ? state.profile.nickname : m.author;
        let avatarText, avatarStyle;
        if (own) {
            avatarText = getAvatarContent();
            if (state.profile.avatarType === 'photo' && state.profile.avatarPhoto) avatarStyle = 'background: var(--bg-tertiary)';
            else if (state.profile.avatarType === 'color') { const c = avatarColors[state.profile.avatarColor]; avatarStyle = `background: linear-gradient(135deg, ${c[0]}, ${c[1]})`; }
            else avatarStyle = 'background: linear-gradient(135deg, var(--accent), var(--blue))';
        } else {
            avatarText = initials(conv.name);
            avatarStyle = conv.color ? `background: linear-gradient(135deg, ${conv.color[0]}, ${conv.color[1]})` : '';
        }
        const authorRole = m.role || '';
        const reactionsHtml = m.reactions && m.reactions.length
            ? `<div class="reactions">${m.reactions.map(r => `<span class="reaction${r.own ? ' own' : ''}" data-msg="${m.id}" data-emoji="${r.emoji}">${emojiImg(r.emoji)} ${r.count}</span>`).join('')}</div>` : '';
        const replyHtml = m.replyTo ? `<div class="reply-quote"><b>${escapeHtml(m.replyTo.author)}</b>${escapeHtml(m.replyTo.text)}</div>` : '';
        const bubbleContent = `${replyHtml}${escapeHtml(m.text || '')}${reactionsHtml}`;
        html += `<div class="message${own ? ' own' : ''}" data-id="${m.id}">
            <div class="message-avatar" style="${avatarStyle}">${avatarText}</div>
            <div class="message-content">
                <div class="message-author">${escapeHtml(authorName)} ${getRoleLabel(authorRole)}</div>
                <div class="message-bubble">${bubbleContent}</div>
                <div class="message-time">${formatTime(m.time)}</div>
            </div>
            <div class="msg-actions">
                <button data-action="reply" data-id="${m.id}" title="Ответить">${emojiImg('↩️')}</button>
                <button data-action="react" data-id="${m.id}" title="Реакция">${emojiImg('😊')}</button>
                <button data-action="copy" data-id="${m.id}" title="Копировать">${emojiImg('📋')}</button>
                ${own ? `<button data-action="delete" data-id="${m.id}" title="Удалить">${emojiImg('🗑️')}</button>` : ''}
            </div>
        </div>`;
    });
    container.innerHTML = html;
    container.querySelectorAll('.msg-actions button').forEach(btn => {
        btn.addEventListener('click', (e) => { e.stopPropagation(); handleMsgAction(btn.dataset.action, btn.dataset.id); });
    });
    container.querySelectorAll('.reaction').forEach(el => {
        el.addEventListener('click', () => toggleReaction(el.dataset.msg, el.dataset.emoji));
    });
    setTimeout(() => { container.scrollTop = container.scrollHeight; }, 30);
}

function handleMsgAction(action, msgId) {
    const conv = state.convs.find(c => c.id === state.activeConv);
    const msg = conv.messages.find(m => String(m.id) === String(msgId));
    if (!msg) return;
    sound.play('click');
    if (action === 'reply') {
        state.replyTo = msg;
        document.getElementById('replyBar').classList.add('active');
        document.getElementById('replyAuthor').textContent = msg.own ? state.profile.nickname : msg.author;
        document.getElementById('replyText').textContent = msg.text;
        document.getElementById('messageInput').focus();
    } else if (action === 'react') {
        toggleReaction(msgId, '👍');
    } else if (action === 'copy') {
        navigator.clipboard?.writeText(msg.text);
        showNotif('Скопировано', (msg.text || '').slice(0, 40));
    } else if (action === 'delete') {
        conv.messages = conv.messages.filter(m => m.id !== msg.id);
        renderMessages(); renderConvList(); saveToStorage();
    }
}
function toggleReaction(msgId, emoji) {
    const conv = state.convs.find(c => c.id === state.activeConv);
    const msg = conv.messages.find(m => String(m.id) === String(msgId));
    if (!msg) return;
    if (!msg.reactions) msg.reactions = [];
    const existing = msg.reactions.find(r => r.emoji === emoji);
    if (existing) {
        if (existing.own) { existing.count--; existing.own = false; if (existing.count <= 0) msg.reactions = msg.reactions.filter(r => r !== existing); }
        else { existing.count++; existing.own = true; }
    } else { msg.reactions.push({ emoji, count: 1, own: true }); }
    sound.play('like'); renderMessages(); saveToStorage();
}

/* ============ ОТПРАВКА ============ */
document.getElementById('messageForm').addEventListener('submit', (e) => { e.preventDefault(); sendMessage(); });
function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text || !state.activeConv) return;
    const conv = state.convs.find(c => c.id === state.activeConv);
    if (!canWrite(conv)) { sound.play('error'); showNotif('Ошибка', 'Вы не можете писать в этом канале'); return; }
    const role = getMemberRole(conv, state.login);
    const msg = {
        id: Date.now() + Math.random(), author: state.profile.nickname,
        text, time: Date.now(), own: true, reactions: [],
        role: role || '',
        replyTo: state.replyTo ? { author: state.replyTo.own ? state.profile.nickname : state.replyTo.author, text: state.replyTo.text } : null
    };
    conv.messages.push(msg);
    state.totalMessages++;
    input.value = '';
    state.replyTo = null;
    document.getElementById('replyBar').classList.remove('active');
    sound.play('send');
    renderMessages(); renderConvList(); saveToStorage();
}

/* ============ УВЕДОМЛЕНИЯ ============ */
function showNotif(title, text, avatar) {
    const container = document.getElementById('notifContainer');
    const el = document.createElement('div');
    el.className = 'notif';
    const av = avatar || title.charAt(0).toUpperCase();
    el.innerHTML = `<div class="notif-avatar">${escapeHtml(av)}</div>
        <div class="notif-body"><div class="notif-title">${escapeHtml(title)}</div><div class="notif-text">${escapeHtml(text)}</div></div>`;
    container.appendChild(el);
    sound.play('notif');
    setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 300); }, 4000);
    el.addEventListener('click', () => el.remove());
}

/* ============ ВКЛАДКИ ============ */
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        sound.play('click');
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const tab = item.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById('tab-' + tab).classList.add('active');
        if (tab === 'chats') {
            document.getElementById('convList').classList.remove('mobile-hide');
            document.getElementById('chatWindow').classList.remove('mobile-open');
        }
        if (tab === 'profile') updateProfileUI();
    });
});
document.getElementById('backBtn').addEventListener('click', closeChatMobile);
document.getElementById('themeToggle').addEventListener('click', toggleTheme);

/* ============ ФИЛЬТРЫ ============ */
document.querySelectorAll('.conv-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        sound.play('click');
        document.querySelectorAll('.conv-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.filter = tab.dataset.filter;
        renderConvList();
    });
});
document.getElementById('convSearch').addEventListener('input', (e) => { state.search = e.target.value; renderConvList(); });

/* ============ КНОПКИ ЧАТА ============ */
document.getElementById('soundToggle').addEventListener('click', (e) => {
    state.soundEnabled = !state.soundEnabled; sound.enabled = state.soundEnabled;
    e.currentTarget.classList.toggle('muted', !state.soundEnabled);
    if (state.soundEnabled) sound.play('click');
});
document.getElementById('clearChatBtn').addEventListener('click', () => {
    const conv = state.convs.find(c => c.id === state.activeConv);
    if (!conv) return;
    if (confirm('Очистить историю чата?')) { conv.messages = []; renderMessages(); renderConvList(); sound.play('click'); saveToStorage(); }
});
document.getElementById('cancelReply').addEventListener('click', () => { state.replyTo = null; document.getElementById('replyBar').classList.remove('active'); });

/* ============ МОДАЛКИ ============ */
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
document.querySelectorAll('[data-close]').forEach(btn => { btn.addEventListener('click', () => closeModal(btn.dataset.close)); });
document.querySelectorAll('.modal-overlay').forEach(overlay => { overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay.id); }); });

/* ============ СОЗДАНИЕ ============ */
function renderCreateAvatarChoices() {
    const container = document.getElementById('createAvatarChoices');
    container.innerHTML = avatarColors.slice(0, 8).map((c, i) => `<div class="avatar-choice${i === state.createSelectedColor ? ' selected' : ''}" data-idx="${i}" style="background: linear-gradient(135deg, ${c[0]}, ${c[1]})"></div>`).join('');
    container.querySelectorAll('.avatar-choice').forEach(el => {
        el.addEventListener('click', () => {
            container.querySelectorAll('.avatar-choice').forEach(x => x.classList.remove('selected'));
            el.classList.add('selected');
            state.createSelectedColor = parseInt(el.dataset.idx);
            sound.play('click');
        });
    });
}
function openCreateChatModal() {
    state.createType = 'channel';
    state.createSelectedColor = 0;
    document.getElementById('createName').value = '';
    document.getElementById('createDesc').value = '';
    document.getElementById('createNameLabel').textContent = 'Название канала';
    document.getElementById('createDescLabel').textContent = 'Описание';
    document.getElementById('createName').placeholder = 'Например, Lunar News';
    document.getElementById('createDesc').placeholder = 'О чём канал?';
    document.querySelectorAll('#createTypeSwitch button').forEach(b => b.classList.remove('active'));
    document.querySelector('#createTypeSwitch button[data-type="channel"]').classList.add('active');
    document.getElementById('createTypeHint').querySelector('span').textContent = 'В канале писать могут только создатель и админы';
    renderCreateAvatarChoices();
    openModal('createChatModal');
    setTimeout(() => document.getElementById('createName').focus(), 100);
}
document.getElementById('createChatBtn').addEventListener('click', () => { sound.play('click'); openCreateChatModal(); });

document.querySelectorAll('#createTypeSwitch button').forEach(btn => {
    btn.addEventListener('click', () => {
        sound.play('click');
        document.querySelectorAll('#createTypeSwitch button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.createType = btn.dataset.type;
        if (state.createType === 'channel') {
            document.getElementById('createNameLabel').textContent = 'Название канала';
            document.getElementById('createDescLabel').textContent = 'Описание';
            document.getElementById('createName').placeholder = 'Например, Lunar News';
            document.getElementById('createDesc').placeholder = 'О чём канал?';
            document.getElementById('createTypeHint').querySelector('span').textContent = 'В канале писать могут только создатель и админы';
        } else {
            document.getElementById('createNameLabel').textContent = 'Название группы';
            document.getElementById('createDescLabel').textContent = 'Описание';
            document.getElementById('createName').placeholder = 'Например, Друзья';
            document.getElementById('createDesc').placeholder = 'О чём группа?';
            document.getElementById('createTypeHint').querySelector('span').textContent = 'В группе могут писать все участники';
        }
    });
});

document.getElementById('confirmCreateBtn').addEventListener('click', () => {
    const name = document.getElementById('createName').value.trim();
    const desc = document.getElementById('createDesc').value.trim();
    if (!name) { sound.play('error'); return; }
    if (state.convs.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        sound.play('error');
        showNotif('Ошибка', 'Чат с таким названием уже существует');
        return;
    }
    const newConv = {
        id: genId(),
        name,
        description: desc || (state.createType === 'channel' ? 'Канал' : 'Группа'),
        type: state.createType,
        color: avatarColors[state.createSelectedColor],
        messages: [],
        unread: 0,
        creatorLogin: state.login,
        members: [{ login: state.login, name: state.profile.nickname, role: 'creator' }]
    };
    state.convs.unshift(newConv);
    saveToStorage(); renderConvList();
    closeModal('createChatModal');
    sound.play('enter');
    showNotif('Создано!', (state.createType === 'channel' ? 'Канал ' : 'Группа ') + name);
    setTimeout(() => openConv(newConv.id), 300);
});

/* ============ УЧАСТНИКИ ============ */
function openMembersModal() {
    const conv = state.convs.find(c => c.id === state.activeConv);
    if (!conv) return;
    const myRole = getMemberRole(conv, state.login);
    const isCreator = myRole === 'creator';
    const isAdmin = myRole === 'admin';
    const canManage = isCreator || isAdmin;

    document.getElementById('membersHeaderInfo').innerHTML = `<b>${escapeHtml(conv.name)}</b> — ${conv.type === 'channel' ? 'канал' : 'группа'}<br>${conv.type === 'channel' ? 'Писать могут только создатель и админы' : 'Писать могут все участники'}`;
    document.getElementById('addMemberForm').style.display = canManage ? 'flex' : 'none';

    const list = document.getElementById('membersList');
    list.innerHTML = (conv.members || []).map(m => {
        const roleLabel = m.role === 'creator' ? '<span class="role-pill creator">создатель</span>' : m.role === 'admin' ? '<span class="role-pill admin">админ</span>' : '<span class="role-pill member">участник</span>';
        const canPromote = isCreator && m.role !== 'creator';
        const canDemote = isCreator && m.role === 'admin';
        const canRemove = (isCreator || (isAdmin && m.role === 'member')) && m.login !== state.login;
        return `<div class="member-item">
            <div class="member-avatar" style="background: linear-gradient(135deg, var(--accent), var(--blue))">${initials(m.name)}</div>
            <div class="member-info">
                <div class="member-name">${escapeHtml(m.name)} ${roleLabel}</div>
                <div class="member-status">@${m.login}</div>
            </div>
            <div class="member-actions">
                ${canPromote ? `<button data-action="promote" data-login="${m.login}" title="Сделать админом">${emojiImg('⬆️')}</button>` : ''}
                ${canDemote ? `<button data-action="demote" data-login="${m.login}" title="Снять админа">${emojiImg('⬇️')}</button>` : ''}
                ${canRemove ? `<button data-action="remove" data-login="${m.login}" class="danger" title="Удалить">${emojiImg('❌')}</button>` : ''}
            </div>
        </div>`;
    }).join('');

    list.querySelectorAll('.member-actions button').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            const login = btn.dataset.login;
            const member = conv.members.find(m => m.login === login);
            if (!member) return;
            if (action === 'promote') member.role = 'admin';
            else if (action === 'demote') member.role = 'member';
            else if (action === 'remove') conv.members = conv.members.filter(m => m.login !== login);
            saveToStorage();
            openMembersModal();
            sound.play('click');
        });
    });

    openModal('membersModal');
}
document.getElementById('membersBtn').addEventListener('click', () => { sound.play('click'); openMembersModal(); });

document.getElementById('addMemberBtn').addEventListener('click', () => {
    const conv = state.convs.find(c => c.id === state.activeConv);
    if (!conv) return;
    const name = document.getElementById('newMemberName').value.trim();
    if (!name) return;
    if (conv.members.some(m => m.name.toLowerCase() === name.toLowerCase())) {
        showNotif('Ошибка', 'Такой участник уже есть');
        sound.play('error');
        return;
    }
    conv.members.push({ login: name.toLowerCase().replace(/\s+/g, '_'), name, role: 'member' });
    document.getElementById('newMemberName').value = '';
    saveToStorage();
    openMembersModal();
    sound.play('enter');
    showNotif('Участник добавлен', name);
});

/* ============ ЛЕНТА ============ */
document.getElementById('newPostBtn').addEventListener('click', () => { sound.play('click'); document.getElementById('newPost').style.display = ''; });
document.getElementById('cancelPost').addEventListener('click', () => { document.getElementById('newPost').style.display = 'none'; document.getElementById('postContent').value = ''; });
document.getElementById('publishPost').addEventListener('click', () => {
    const text = document.getElementById('postContent').value.trim();
    if (!text) return;
    state.totalPosts++;
    const postsEl = document.getElementById('posts');
    const el = document.createElement('div');
    el.className = 'post';
    let avatarBg = 'linear-gradient(135deg, #38bdf8, #60a5fa)';
    if (state.profile.avatarType === 'color') avatarBg = `linear-gradient(135deg, ${avatarColors[state.profile.avatarColor][0]}, ${avatarColors[state.profile.avatarColor][1]})`;
    el.innerHTML = `
        <div class="post-header"><div class="post-avatar" style="background: ${avatarBg}">${getAvatarContent()}</div><div class="post-meta"><div class="post-author">${escapeHtml(state.profile.nickname)}</div><div class="post-time">сейчас</div></div></div>
        <div class="post-content">${escapeHtml(text)}</div>
        <div class="post-actions"><button class="post-action like-btn">${emojiImg('❤️')} <span>0</span></button></div>`;
    postsEl.prepend(el);
    el.querySelector('.like-btn').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        btn.classList.toggle('liked');
        sound.play('like');
        let cnt = parseInt(btn.querySelector('span').textContent) || 0;
        cnt += btn.classList.contains('liked') ? 1 : -1;
        btn.querySelector('span').textContent = cnt;
    });
    document.getElementById('postContent').value = '';
    document.getElementById('newPost').style.display = 'none';
    sound.play('send'); saveToStorage();
});

/* ============ КАСТОМИЗАЦИЯ ============ */
function renderCustomizeModal() {
    state.tempProfile = { ...state.profile };
    updatePreview();
    document.getElementById('customNickname').value = state.tempProfile.nickname;
    document.getElementById('nicknameCount').textContent = state.tempProfile.nickname.length;
    document.getElementById('customBio').value = state.tempProfile.bio || '';
    document.getElementById('bioCount').textContent = (state.tempProfile.bio || '').length;
    document.querySelectorAll('.avatar-type-switch button').forEach(b => { b.classList.toggle('active', b.dataset.avatarType === state.tempProfile.avatarType); });
    document.getElementById('avatarPhotoSection').style.display = state.tempProfile.avatarType === 'photo' ? '' : 'none';
    document.getElementById('avatarEmojiSection').style.display = state.tempProfile.avatarType === 'emoji' ? '' : 'none';
    document.getElementById('avatarColorSection').style.display = state.tempProfile.avatarType === 'color' ? '' : 'none';
    if (state.tempProfile.avatarPhoto) {
        document.getElementById('photoPreviewBox').style.display = 'flex';
        document.getElementById('photoUploadZone').style.display = 'none';
        document.getElementById('photoPreviewImg').src = state.tempProfile.avatarPhoto;
        document.getElementById('photoFilename').textContent = state.tempProfile.avatarPhotoName || 'avatar.jpg';
        document.getElementById('photoFilesize').textContent = formatFileSize(state.tempProfile.avatarPhotoSize || 0);
    } else {
        document.getElementById('photoPreviewBox').style.display = 'none';
        document.getElementById('photoUploadZone').style.display = '';
    }
    const emojiPicker = document.getElementById('emojiPicker');
    emojiPicker.innerHTML = avatarEmojis.map(e => `<button class="emoji-choice${e === state.tempProfile.avatarEmoji ? ' selected' : ''}" data-emoji="${e}">${emojiImg(e, 'emoji-choice-img')}</button>`).join('');
    emojiPicker.querySelectorAll('.emoji-choice').forEach(el => {
        el.addEventListener('click', () => {
            emojiPicker.querySelectorAll('.emoji-choice').forEach(x => x.classList.remove('selected'));
            el.classList.add('selected');
            state.tempProfile.avatarEmoji = el.dataset.emoji;
            updatePreview(); sound.play('click');
        });
    });
    const colorGrid = document.getElementById('avatarColorGrid');
    colorGrid.innerHTML = avatarColors.map((c, i) => `<div class="color-swatch${i === state.tempProfile.avatarColor ? ' selected' : ''}" data-idx="${i}" style="background: linear-gradient(135deg, ${c[0]}, ${c[1]})"></div>`).join('');
    colorGrid.querySelectorAll('.color-swatch').forEach(el => {
        el.addEventListener('click', () => {
            colorGrid.querySelectorAll('.color-swatch').forEach(x => x.classList.remove('selected'));
            el.classList.add('selected');
            state.tempProfile.avatarColor = parseInt(el.dataset.idx);
            updatePreview(); sound.play('click');
        });
    });
    const bannerGrid = document.getElementById('bannerGrid');
    bannerGrid.innerHTML = banners.map(b => `<div class="banner-choice${b.id === state.tempProfile.banner ? ' selected' : ''}" data-banner="${b.id}" style="background: ${b.css}"></div>`).join('');
    bannerGrid.querySelectorAll('.banner-choice').forEach(el => {
        el.addEventListener('click', () => {
            bannerGrid.querySelectorAll('.banner-choice').forEach(x => x.classList.remove('selected'));
            el.classList.add('selected');
            state.tempProfile.banner = el.dataset.banner;
            updatePreview(); sound.play('click');
        });
    });
    const frameGrid = document.getElementById('frameGrid');
    frameGrid.innerHTML = frames.map(f => `<div class="frame-choice${f.id === state.tempProfile.frame ? ' selected' : ''}" data-frame="${f.id}"><div class="frame-circle ${f.class}"></div></div>`).join('');
    frameGrid.querySelectorAll('.frame-choice').forEach(el => {
        el.addEventListener('click', () => {
            frameGrid.querySelectorAll('.frame-choice').forEach(x => x.classList.remove('selected'));
            el.classList.add('selected');
            state.tempProfile.frame = el.dataset.frame;
            updatePreview(); sound.play('click');
        });
    });
}

function updatePreview() {
    const p = state.tempProfile;
    document.getElementById('previewName').textContent = p.nickname || 'Никнейм';
    document.getElementById('previewBio').textContent = p.bio || '';
    const banner = banners.find(b => b.id === p.banner);
    document.getElementById('previewBanner').style.background = banner ? banner.css : banners[0].css;
    const avatar = document.getElementById('previewAvatar');
    if (p.avatarType === 'photo' && p.avatarPhoto) { avatar.innerHTML = `<img class="avatar-photo" src="${p.avatarPhoto}" alt="">`; avatar.style.background = 'var(--bg-tertiary)'; }
    else if (p.avatarType === 'emoji') { avatar.innerHTML = `<div class="avatar-emoji-wrap">${emojiImg(p.avatarEmoji)}</div>`; avatar.style.background = 'linear-gradient(135deg, #38bdf8, #60a5fa)'; }
    else { avatar.textContent = (p.nickname || 'A').charAt(0).toUpperCase(); const c = avatarColors[p.avatarColor]; avatar.style.background = `linear-gradient(135deg, ${c[0]}, ${c[1]})`; }
    const frameClass = frames.find(f => f.id === p.frame);
    avatar.className = 'preview-avatar ' + (frameClass ? frameClass.class : 'avatar-frame-none');
}

document.getElementById('editProfileBtn').addEventListener('click', () => { sound.play('click'); renderCustomizeModal(); openModal('customizeModal'); });
document.getElementById('customNickname').addEventListener('input', (e) => { document.getElementById('nicknameCount').textContent = e.target.value.length; state.tempProfile.nickname = e.target.value; updatePreview(); });
document.getElementById('customBio').addEventListener('input', (e) => { document.getElementById('bioCount').textContent = e.target.value.length; state.tempProfile.bio = e.target.value; updatePreview(); });
document.querySelectorAll('.avatar-type-switch button').forEach(btn => {
    btn.addEventListener('click', () => {
        sound.play('click');
        document.querySelectorAll('.avatar-type-switch button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.tempProfile.avatarType = btn.dataset.avatarType;
        document.getElementById('avatarPhotoSection').style.display = state.tempProfile.avatarType === 'photo' ? '' : 'none';
        document.getElementById('avatarEmojiSection').style.display = state.tempProfile.avatarType === 'emoji' ? '' : 'none';
        document.getElementById('avatarColorSection').style.display = state.tempProfile.avatarType === 'color' ? '' : 'none';
        updatePreview();
    });
});

const photoUploadZone = document.getElementById('photoUploadZone');
const photoInput = document.getElementById('photoInput');
photoUploadZone.addEventListener('click', () => { sound.play('click'); photoInput.click(); });
photoUploadZone.addEventListener('dragover', (e) => { e.preventDefault(); photoUploadZone.classList.add('dragover'); });
photoUploadZone.addEventListener('dragleave', () => photoUploadZone.classList.remove('dragover'));
photoUploadZone.addEventListener('drop', async (e) => { e.preventDefault(); photoUploadZone.classList.remove('dragover'); const file = e.dataTransfer.files[0]; if (file) await handlePhotoUpload(file); });
photoInput.addEventListener('change', async (e) => { const file = e.target.files[0]; if (file) await handlePhotoUpload(file); e.target.value = ''; });

async function handlePhotoUpload(file) {
    try {
        photoUploadZone.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" style="animation: spin 1s linear infinite"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-dasharray="30 60"/></svg><p>Обработка фото...</p>';
        const dataUrl = await compressPhoto(file, 256);
        state.tempProfile.avatarPhoto = dataUrl;
        state.tempProfile.avatarPhotoName = file.name;
        state.tempProfile.avatarPhotoSize = file.size;
        state.tempProfile.avatarType = 'photo';
        sound.play('photo');
        showNotif('Фото загружено', file.name);
        document.querySelectorAll('.avatar-type-switch button').forEach(b => b.classList.toggle('active', b.dataset.avatarType === 'photo'));
        document.getElementById('avatarPhotoSection').style.display = '';
        document.getElementById('photoPreviewBox').style.display = 'flex';
        document.getElementById('photoPreviewImg').src = dataUrl;
        document.getElementById('photoFilename').textContent = file.name;
        document.getElementById('photoFilesize').textContent = formatFileSize(file.size);
        document.getElementById('photoUploadZone').style.display = 'none';
        photoUploadZone.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><p>Нажмите или перетащите фото</p><div class="hint">PNG, JPG, WEBP до 5 МБ</div>';
        updatePreview();
    } catch (err) {
        sound.play('error'); showNotif('Ошибка', err.message);
        photoUploadZone.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><p>Нажмите или перетащите фото</p><div class="hint">PNG, JPG, WEBP до 5 МБ</div>';
    }
}

document.getElementById('photoRemoveBtn').addEventListener('click', () => {
    state.tempProfile.avatarPhoto = null; state.tempProfile.avatarPhotoName = ''; state.tempProfile.avatarPhotoSize = 0;
    state.tempProfile.avatarType = 'emoji';
    document.querySelectorAll('.avatar-type-switch button').forEach(b => b.classList.toggle('active', b.dataset.avatarType === 'emoji'));
    document.getElementById('avatarPhotoSection').style.display = 'none';
    document.getElementById('avatarEmojiSection').style.display = '';
    document.getElementById('photoPreviewBox').style.display = 'none';
    document.getElementById('photoUploadZone').style.display = '';
    sound.play('click'); updatePreview();
});

document.getElementById('saveCustomizationBtn').addEventListener('click', () => {
    const nickname = state.tempProfile.nickname.trim();
    if (!nickname) { showNotif('Ошибка', 'Никнейм не может быть пустым'); sound.play('error'); return; }
    if (nickname.length < 2) { showNotif('Ошибка', 'Никнейм минимум 2 символа'); sound.play('error'); return; }
    state.profile = { ...state.tempProfile, nickname };
    state.user = nickname;
    updateProfileUI();
    saveToStorage();
    closeModal('customizeModal');
    sound.play('enter');
    showNotif('Профиль обновлён', nickname);
    if (state.activeConv) renderMessages();
    renderConvList();
});

/* ============ БЫСТРАЯ ЗАГРУЗКА ============ */
const quickPhotoInput = document.createElement('input');
quickPhotoInput.type = 'file';
quickPhotoInput.accept = 'image/*';
quickPhotoInput.style.display = 'none';
document.body.appendChild(quickPhotoInput);

document.getElementById('quickUploadPhotoBtn').addEventListener('click', () => { sound.play('click'); quickPhotoInput.click(); });
quickPhotoInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        const dataUrl = await compressPhoto(file, 256);
        state.profile.avatarPhoto = dataUrl;
        state.profile.avatarPhotoName = file.name;
        state.profile.avatarPhotoSize = file.size;
        state.profile.avatarType = 'photo';
        updateProfileUI();
        saveToStorage();
        sound.play('photo');
        showNotif('Фото загружено', file.name);
    } catch (err) {
        sound.play('error'); showNotif('Ошибка', err.message);
    }
    e.target.value = '';
});

document.getElementById('quickRemovePhotoBtn').addEventListener('click', () => {
    if (!confirm('Удалить фото аватара?')) return;
    state.profile.avatarPhoto = null;
    state.profile.avatarPhotoName = '';
    state.profile.avatarPhotoSize = 0;
    state.profile.avatarType = 'emoji';
    updateProfileUI();
    saveToStorage();
    sound.play('click');
    showNotif('Фото удалено', 'Аватар сброшен');
});

/* ============ СТАРТ ============ */
document.getElementById('messageInput').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
setInterval(() => {
    if (!state.user) return;
    const online = Math.max(1, state.convs.filter(c => c.type === 'group').length + 1);
    document.getElementById('onlineCount').textContent = online;
}, 5000);

document.addEventListener('DOMContentLoaded', () => {
    applyEmojiToStatic();
    initTheme();
});
