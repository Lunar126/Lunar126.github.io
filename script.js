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
    return `<img class="emoji${cls ? ' ' + cls : ''}" src="${APPLE_CDN}${cp}.png" alt="${char}" onerror="this.onerror=null;this.src='${APPLE_CDN}${cp}-fe0f.png';this.onerror=function(){this.style.display='none';};">`;
}
function applyEmojiToStatic() {
    document.querySelectorAll('[data-emoji]').forEach(el => {
        if (el.querySelector('img.emoji')) return;
        el.innerHTML = emojiImg(el.getAttribute('data-emoji'), el.getAttribute('data-size') || '');
    });
}

/* ============ THEMES ============ */
const themeColors = {
    lunar: { name: 'Lunar', dark: { b1a: '#38bdf8', b1b: '#0284c7', b2a: '#a78bfa', b2b: '#6366f1', b3a: '#22d3ee', b3b: '#0891b2', b4a: '#10b981', b4b: '#047857' }, light: { b1a: '#7dd3fc', b1b: '#38bdf8', b2a: '#c4b5fd', b2b: '#a78bfa', b3a: '#67e8f9', b3b: '#22d3ee', b4a: '#6ee7b7', b4b: '#10b981' } },
    ocean: { name: 'Ocean', dark: { b1a: '#0ea5e9', b1b: '#0369a1', b2a: '#3b82f6', b2b: '#1d4ed8', b3a: '#06b6d4', b3b: '#0891b2', b4a: '#6366f1', b4b: '#4f46e5' }, light: { b1a: '#7dd3fc', b1b: '#38bdf8', b2a: '#93c5fd', b2b: '#60a5fa', b3a: '#67e8f9', b3b: '#22d3ee', b4a: '#a5b4fc', b4b: '#818cf8' } },
    sunset: { name: 'Sunset', dark: { b1a: '#f97316', b1b: '#c2410c', b2a: '#ec4899', b2b: '#be185d', b3a: '#fbbf24', b3b: '#d97706', b4a: '#ef4444', b4b: '#b91c1c' }, light: { b1a: '#fdba74', b1b: '#fb923c', b2a: '#fbcfe8', b2b: '#f472b6', b3a: '#fde68a', b3b: '#fbbf24', b4a: '#fecaca', b4b: '#f87171' } },
    forest: { name: 'Forest', dark: { b1a: '#10b981', b1b: '#047857', b2a: '#14b8a6', b2b: '#0f766e', b3a: '#84cc16', b3b: '#65a30d', b4a: '#22c55e', b4b: '#16a34a' }, light: { b1a: '#6ee7b7', b1b: '#34d399', b2a: '#5eead4', b2b: '#2dd4bf', b3a: '#bef264', b3b: '#a3e635', b4a: '#86efac', b4b: '#4ade80' } },
    purple: { name: 'Purple', dark: { b1a: '#a78bfa', b1b: '#7c3aed', b2a: '#ec4899', b2b: '#db2777', b3a: '#8b5cf6', b3b: '#6d28d9', b4a: '#d946ef', b4b: '#c026d3' }, light: { b1a: '#c4b5fd', b1b: '#a78bfa', b2a: '#f9a8d4', b2b: '#f472b6', b3a: '#ddd6fe', b3b: '#c4b5fd', b4a: '#f0abfc', b4b: '#e879f9' } }
};
function initTheme() {
    state.themeMode = localStorage.getItem('lunar_theme_mode') || 'dark';
    state.themeColor = localStorage.getItem('lunar_theme_color') || 'lunar';
    applyTheme();
}
function applyTheme() {
    document.body.className = '';
    document.body.classList.add('theme-' + state.themeMode);
    document.body.classList.add('theme-' + state.themeColor);
    const c = (themeColors[state.themeColor] || themeColors.lunar)[state.themeMode === 'dark' || state.themeMode === 'amoled' ? 'dark' : state.themeMode === 'terminal' ? 'dark' : 'light'] || themeColors.lunar.dark;
    const b1 = document.querySelector('.tg-blob-1'), b2 = document.querySelector('.tg-blob-2'), b3 = document.querySelector('.tg-blob-3'), b4 = document.querySelector('.tg-blob-4');
    if (b1) b1.style.background = `radial-gradient(circle, ${c.b1a} 0%, ${c.b1b} 40%, transparent 70%)`;
    if (b2) b2.style.background = `radial-gradient(circle, ${c.b2a} 0%, ${c.b2b} 40%, transparent 70%)`;
    if (b3) b3.style.background = `radial-gradient(circle, ${c.b3a} 0%, ${c.b3b} 40%, transparent 70%)`;
    if (b4) b4.style.background = `radial-gradient(circle, ${c.b4a} 0%, ${c.b4b} 40%, transparent 70%)`;
}
function toggleTheme() {
    state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
    localStorage.setItem('lunar_theme_mode', state.themeMode);
    applyTheme();
    if (document.getElementById('themeModal')?.classList.contains('active')) renderThemeGrid();
    sound.play('click');
}

/* ============ SOUND ============ */
class SoundEngine {
    constructor() { this.ctx = null; this.enabled = true; this.masterGain = null; this.notifSound = 'default'; }
    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.12;
        this.masterGain.connect(this.ctx.destination);
    }
    play(type) {
        if (!this.enabled) return;
        if (type === 'notif' && this.notifSound === 'none') return;
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
            success: [{f:523, d:.12, t:'sine', v:.2},{f:659, d:.12, t:'sine', v:.2, delay:.12},{f:784, d:.12, t:'sine', v:.2, delay:.24},{f:1046, d:.4, t:'sine', v:.25, delay:.36}],
            photo: [{f:784, d:.1, t:'sine', v:.15},{f:1046, d:.15, t:'sine', v:.2, delay:.1}]
        };
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
    }
}
const sound = new SoundEngine();

/* ============ CONSTANTS ============ */
const avatarEmojis = ['😎','🌟','🔥','❄️','🎮','🎨','🚀','🦊','🐺','🦁','🐉','🦄','💎','👑','⚡','🌙','☀️','🌈','💚','🎭','👾','🤖','🦅','🐬','🌸','🍀','🎯','🎧','💫','✨','🖤','⚔️'];
const avatarColors = [['#38bdf8','#60a5fa'],['#22d3ee','#38bdf8'],['#818cf8','#60a5fa'],['#2dd4bf','#22d3ee'],['#a78bfa','#818cf8'],['#60a5fa','#818cf8'],['#10b981','#34d399'],['#059669','#10b981'],['#f59e0b','#fbbf24'],['#ef4444','#f87171'],['#ec4899','#f472b6'],['#8b5cf6','#a78bfa'],['#06b6d4','#22d3ee'],['#84cc16','#a3e635'],['#f97316','#fb923c'],['#64748b','#94a3b8']];
const banners = [{id:'default',css:'linear-gradient(135deg,#1e3a5f,#0f172a,#1e293b)'},{id:'lunar',css:'linear-gradient(135deg,#1e293b,#cbd5e1,#0f172a)'},{id:'emerald',css:'linear-gradient(135deg,#064e3b,#10b981,#0f172a)'},{id:'sunset',css:'linear-gradient(135deg,#7c2d12,#f59e0b,#0f172a)'},{id:'ocean',css:'linear-gradient(135deg,#0c4a6e,#38bdf8,#0f172a)'},{id:'cosmos',css:'linear-gradient(135deg,#3b0764,#8b5cf6,#0f172a)'},{id:'fire',css:'linear-gradient(135deg,#7f1d1d,#ef4444,#0f172a)'},{id:'aurora',css:'linear-gradient(135deg,#10b981,#38bdf8,#8b5cf6)'},{id:'rose',css:'linear-gradient(135deg,#831843,#ec4899,#0f172a)'}];
const frames = [{id:'none',name:'Без',class:'avatar-frame-none'},{id:'emerald',name:'Изумруд',class:'avatar-frame-emerald'},{id:'neon',name:'Неон',class:'avatar-frame-neon'},{id:'fire',name:'Огонь',class:'avatar-frame-fire'},{id:'ice',name:'Лёд',class:'avatar-frame-ice'}];
const wallpapers = ['','linear-gradient(135deg,#1e3a5f,#0f172a)','linear-gradient(135deg,#064e3b,#0f172a)','linear-gradient(135deg,#7c2d12,#0f172a)','linear-gradient(135deg,#3b0764,#0f172a)','linear-gradient(135deg,#831843,#0f172a)','linear-gradient(135deg,#0c4a6e,#0f172a)','linear-gradient(135deg,#1e293b,#334155)'];
const stickers = ['😀','😂','😍','🥰','😎','🤩','🥳','😏','😴','🤔','👍','👎','❤️','🔥','💯','🎉','✨','🌟','💎','👑','🐶','🐱','🦊','🐺','🐼','🦁','🐸','🦄','🍕','🍔','🍰','☕','🎮','⚽','🎸','🚀','🌙','☀️','🌈','⚡'];
const emojiCategories = {
    'Часто': ['😀','😂','🥰','😎','🔥','👍','❤️','✨','🎉','💯'],
    'Смайлы': ['😀','😃','😄','😁','😆','😅','😂','🤣','🥲','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕'],
    'Животные': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🦋','🐌','🐞','🐜','🦟','🦗','🕷','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐈','🐓','🦃','🦚','🦜','🦢','🦩','🕊','🐇','🦝','🦨','🦡','🦦','🦥','🐁','🐀','🐿','🦔'],
    'Еда': ['🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','☕','🫖','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾'],
    'Символы': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🛗','🈳','🈂️','🛂','🛃','🛄','🛅','🚹','🚺','🚼','⚧','🚻','🚮','🎦','📶','🈁','🔣','ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔢','#️⃣','*️⃣','⏏️','▶️','⏸','⏯','⏹','⏺','⏭','⏮','⏩','⏪','⏫','⏬','◀️','🔼','🔽','➡️','⬅️','⬆️','⬇️','↗️','↘️','↙️','↖️','↕️','↔️','↩️','↪️','⤴️','⤵️','🔀','🔁','🔂','🔄','🔃','🎵','🎶','➕','➖','➗','✖️','🟰','♾️','💲','💱','™️','©️','®️','👁️‍🗨️','🔚','🔙','🔛','🔝','🔜','〰️','➰','➿','✔️','☑️','🔘','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔺','🔻','🔸','🔹','🔶','🔷','🔳','🔲','▪️','▫️','◾','◽','◼️','◻️','🟥','🟧','🟨','🟩','🟦','🟪','⬛','⬜','🟫','🔈','🔇','🔉','🔊','🔔','🔕','📣','📢','💬','💭','🗯','♠️','♣️','♥️','♦️','🃏','🎴','🀄','🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛']
};
const smartReplyPool = {
    greeting: ['Привет! 👋','Как дела?','Добрый день'],
    thanks: ['Спасибо! 🙏','Благодарю','Отлично, спасибо'],
    ok: ['Ок 👌','Хорошо','Понял','Договорились'],
    question: ['Сейчас посмотрю','Скоро отвечу','Интересный вопрос'],
    yes: ['Да','Конечно','Согласен'],
    no: ['Нет','Не сейчас','Не могу'],
    default: ['👍','Ок','Спасибо','Понял','Хорошо']
};

/* ============ ПОДАРКИ ============ */
const giftCatalog = [
    { id: '5170145012310081615', name: 'Сердечко', collection: 'Telegram', rarity: 'common', price: 15, img: 'https://api.changes.tg/original/5170145012310081615.png?size=512' },
    { id: '5170233102089322756', name: 'Мишка', collection: 'Telegram', rarity: 'common', price: 20, img: 'https://api.changes.tg/original/5170233102089322756.png?size=512' },
    { id: '5170250947678437525', name: 'Подарок', collection: 'Telegram', rarity: 'common', price: 25, img: 'https://api.changes.tg/original/5170250947678437525.png?size=512' },
    { id: '5168103777563050263', name: 'Роза', collection: 'Telegram', rarity: 'rare', price: 50, img: 'https://api.changes.tg/original/5168103777563050263.png?size=512' },
    { id: '5170144170496491616', name: 'Торт', collection: 'Telegram', rarity: 'rare', price: 65, img: 'https://api.changes.tg/original/5170144170496491616.png?size=512' },
    { id: '5170314324215857265', name: 'Букет', collection: 'Telegram', rarity: 'rare', price: 80, img: 'https://api.changes.tg/original/5170314324215857265.png?size=512' },
    { id: '5170564780938756245', name: 'Ракета', collection: 'Telegram', rarity: 'epic', price: 150, img: 'https://api.changes.tg/original/5170564780938756245.png?size=512' },
    { id: '6028601630662853006', name: 'Шампанское', collection: 'Telegram', rarity: 'epic', price: 180, img: 'https://api.changes.tg/original/6028601630662853006.png?size=512' },
    { id: '5168043875654172773', name: 'Кубок', collection: 'Telegram', rarity: 'epic', price: 200, img: 'https://api.changes.tg/original/5168043875654172773.png?size=512' },
    { id: '5170690322832818290', name: 'Кольцо', collection: 'Telegram', rarity: 'legend', price: 500, img: 'https://api.changes.tg/original/5170690322832818290.png?size=512' },
    { id: '5170521118301225164', name: 'Самоцвет', collection: 'Telegram', rarity: 'legend', price: 750, img: 'https://api.changes.tg/original/5170521118301225164.png?size=512' }
];
const rarityLabel = { common: 'Обычный', rare: 'Редкий', epic: 'Эпический', legend: 'Легендарный' };

/* ============ STATE ============ */
const state = {
    user: null, login: null, activeConv: null, convs: [],
    filter: 'all', search: '',
    soundEnabled: true, replyTo: null,
    totalMessages: 0, totalPosts: 0,
    createType: 'channel', createSelectedColor: 0,
    role: 'user',
    themeMode: 'dark', themeColor: 'lunar',
    notifMode: 'all',
    pin: null, pinAutolock: 0, pinInput: '',
    lastActivity: Date.now(),
    accounts: [], drafts: {}, chatWallpapers: {},
    editingMsg: null, forwardMsg: null, activeCommentPost: null,
    recording: null, recordStart: 0, recordTimer: null, voiceBlob: null,
    balance: 500, ownedGifts: [], giftTab: 'catalog', userProfileGifts: [],
    pendingGift: null, giftRecipientConv: null,
    profile: { nickname: '', bio: '', avatarType: 'emoji', avatarEmoji: '😎', avatarColor: 0, avatarPhoto: null, avatarPhotoName: '', avatarPhotoSize: 0, banner: 'default', frame: 'none' },
    tempProfile: null
};

/* ============ STORAGE ============ */
function getUsers() { try { return JSON.parse(localStorage.getItem('lunar_accounts') || '{}'); } catch(e) { return {}; } }
function saveUsers(u) { localStorage.setItem('lunar_accounts', JSON.stringify(u)); }
function hashPassword(p) { let h = 0; const s = 'lunar_salt_v1' + p; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h = h & h; } return 'h_' + Math.abs(h).toString(36) + '_' + p.length; }
function validateLogin(l) { if (!l || l.length < 3) return 'Минимум 3 символа'; if (l.length > 20) return 'Слишком длинный'; if (!/^[a-zA-Z0-9_]+$/.test(l)) return 'Только латиница, цифры и _'; return null; }
function validatePassword(p) { if (!p || p.length < 6) return 'Минимум 6 символов'; return null; }
function getPasswordStrength(p) { if (!p) return 0; let s = 0; if (p.length >= 6) s++; if (p.length >= 10) s++; if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++; if (/\d/.test(p) || /[^a-zA-Z0-9]/.test(p)) s++; return Math.min(s, 4); }
function showMsg(id, t) { const el = document.getElementById(id); if (!el) return; el.textContent = t; el.classList.add('visible'); setTimeout(() => el.classList.remove('visible'), 4000); }
function hideMsg(id) { const el = document.getElementById(id); if (el) el.classList.remove('visible'); }

/* ============ GLOBAL ROLES ============ */
function getGlobalRoleBadge(role) { return (role === 'creator' || role === 'developer') ? '<span class="creator-mini">creator</span>' : ''; }
function isCreator() { return state.role === 'creator'; }
function getAllUsersList() { return Object.values(getUsers()).map(u => ({ login: u.login, nickname: u.nickname, role: u.role || 'user', createdAt: u.createdAt, profile: u.profile })); }

/* ============ PHOTO ============ */
function compressPhoto(file, maxSize = 256) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) { reject(new Error('Не изображение')); return; }
        if (file.size > 5 * 1024 * 1024) { reject(new Error('Больше 5 МБ')); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const size = Math.min(img.width, img.height);
                const cvs = document.createElement('canvas');
                cvs.width = maxSize; cvs.height = maxSize;
                cvs.getContext('2d').drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, maxSize, maxSize);
                resolve(cvs.toDataURL('image/jpeg', 0.85));
            };
            img.onerror = () => reject(new Error('Ошибка'));
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}
function formatFileSize(b) { if (b < 1024) return b + ' B'; if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'; return (b / 1048576).toFixed(1) + ' MB'; }

/* ============ PIN ============ */
function renderPinPad() {
    const pad = document.getElementById('pinPad');
    if (!pad) return;
    pad.innerHTML = '';
    const layout = ['1','2','3','4','5','6','7','8','9','','0','←'];
    layout.forEach(k => {
        const b = document.createElement('button');
        b.className = 'pin-key' + (k === '' ? ' empty' : '');
        b.textContent = k;
        if (k) b.onclick = () => handlePinKey(k);
        pad.appendChild(b);
    });
}
function updatePinDots() {
    const dots = document.getElementById('pinDots');
    if (!dots) return;
    const len = state.pin ? state.pin.length : 4;
    dots.innerHTML = '';
    for (let i = 0; i < len; i++) {
        const d = document.createElement('div');
        d.className = 'pin-dot' + (i < state.pinInput.length ? ' filled' : '');
        dots.appendChild(d);
    }
}
function handlePinKey(k) {
    if (k === '←') { state.pinInput = state.pinInput.slice(0, -1); updatePinDots(); return; }
    if (state.pinInput.length >= state.pin.length) return;
    state.pinInput += k;
    updatePinDots();
    if (state.pinInput.length === state.pin.length) {
        if (state.pinInput === state.pin) {
            const err = document.getElementById('pinError'); if (err) err.textContent = '';
            const screen = document.getElementById('pinScreen'); if (screen) screen.style.display = 'none';
            state.pinInput = '';
            state.lastActivity = Date.now();
        } else {
            const err = document.getElementById('pinError'); if (err) err.textContent = 'Неверный PIN';
            state.pinInput = '';
            setTimeout(updatePinDots, 300);
            sound.play('error');
        }
    }
}
function checkAutoLock() {
    if (!state.pin) return;
    if (state.pinAutolock > 0 && (Date.now() - state.lastActivity) > state.pinAutolock * 60000) {
        lockApp();
    }
}
function lockApp() {
    state.pinInput = '';
    updatePinDots();
    const screen = document.getElementById('pinScreen'); if (screen) screen.style.display = 'flex';
}

/* ============ AUTH ============ */
document.querySelectorAll('.auth-switcher button').forEach(btn => {
    btn.addEventListener('click', () => {
        sound.play('click');
        document.querySelectorAll('.auth-switcher button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.auth-step').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(btn.dataset.mode === 'login' ? 'authLogin' : 'authRegister');
        if (target) target.classList.add('active');
    });
});
document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        if (input) input.type = input.type === 'password' ? 'text' : 'password';
    });
});
const regPasswordInput = document.getElementById('regPassword');
if (regPasswordInput) {
    regPasswordInput.addEventListener('input', (e) => {
        const s = getPasswordStrength(e.target.value);
        const ps = document.getElementById('pwdStrength'); if (ps) ps.dataset.strength = s;
        const h = document.getElementById('pwdHint');
        if (!h) return;
        if (!e.target.value) h.classList.remove('visible');
        else { h.classList.add('visible'); h.textContent = e.target.value.length < 6 ? 'Минимум 6 символов' : s <= 1 ? 'Слабый' : s === 2 ? 'Средний' : s === 3 ? 'Хороший' : 'Отличный 💪'; }
    });
}

const registerBtn = document.getElementById('registerBtn');
if (registerBtn) {
    registerBtn.addEventListener('click', () => {
        const login = document.getElementById('regUsername').value.trim().toLowerCase();
        const pwd = document.getElementById('regPassword').value;
        const pwd2 = document.getElementById('regPassword2').value;
        hideMsg('registerError');
        const lErr = validateLogin(login); if (lErr) { showMsg('registerError', lErr); sound.play('error'); return; }
        const pErr = validatePassword(pwd); if (pErr) { showMsg('registerError', pErr); sound.play('error'); return; }
        if (pwd !== pwd2) { showMsg('registerError', 'Пароли не совпадают'); sound.play('error'); return; }
        const users = getUsers();
        if (users[login]) { showMsg('registerError', 'Логин занят'); sound.play('error'); return; }
        const btn = document.getElementById('registerBtn');
        btn.classList.add('loading'); btn.innerHTML = '<div class="spinner"></div>Создание...';
        setTimeout(() => {
            const nickname = login.charAt(0).toUpperCase() + login.slice(1);
            const isFirst = Object.keys(users).length === 0;
            users[login] = { login, nickname, passwordHash: hashPassword(pwd), role: isFirst ? 'creator' : 'user', createdAt: Date.now(), lastLogin: Date.now(), profile: { nickname, bio: '', avatarType: 'emoji', avatarEmoji: '😎', avatarColor: 0, avatarPhoto: null, avatarPhotoName: '', avatarPhotoSize: 0, banner: 'default', frame: 'none' } };
            saveUsers(users);
            state.user = nickname; state.login = login; state.role = users[login].role;
            state.profile = { ...users[login].profile };
            try { localStorage.setItem('lunar_session', JSON.stringify({ login, nickname, loginAt: Date.now() })); } catch(e) {}
            sound.play('success');
            showNotif(isFirst ? '👑 Creator создан!' : 'Аккаунт создан', nickname);
            enterApp();
        }, 700);
    });
}

const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        const login = document.getElementById('loginUsername').value.trim().toLowerCase();
        const pwd = document.getElementById('loginPassword').value;
        hideMsg('loginError');
        if (!login || !pwd) { showMsg('loginError', 'Введите логин и пароль'); sound.play('error'); return; }
        const users = getUsers();
        const user = users[login];
        if (!user || user.passwordHash !== hashPassword(pwd)) { showMsg('loginError', 'Неверные данные'); sound.play('error'); return; }
        const btn = document.getElementById('loginBtn');
        btn.classList.add('loading'); btn.innerHTML = '<div class="spinner"></div>Вход...';
        setTimeout(() => {
            user.lastLogin = Date.now(); saveUsers(users);
            state.user = user.nickname; state.login = login; state.role = user.role || 'user';
            state.profile = user.profile || { nickname: user.nickname, bio: '', avatarType: 'emoji', avatarEmoji: '😎', avatarColor: 0, avatarPhoto: null, avatarPhotoName: '', avatarPhotoSize: 0, banner: 'default', frame: 'none' };
            if (document.getElementById('rememberMe')?.checked) {
                try { localStorage.setItem('lunar_session', JSON.stringify({ login, nickname: user.nickname, loginAt: Date.now() })); } catch(e) {}
            }
            sound.play('success');
            showNotif('С возвращением!', user.nickname);
            enterApp();
        }, 700);
    });
}

/* ============ AVATAR ============ */
function getAvatarContent() {
    const p = state.profile;
    if (p.avatarType === 'photo' && p.avatarPhoto) return `<img class="avatar-photo" src="${p.avatarPhoto}" alt="">`;
    if (p.avatarType === 'emoji') return `<div class="avatar-emoji-wrap">${emojiImg(p.avatarEmoji)}</div>`;
    return (p.nickname || 'U').charAt(0).toUpperCase();
}
function getFrameClass() { const f = frames.find(fr => fr.id === state.profile.frame); return f ? f.class : 'avatar-frame-none'; }
function getBannerStyle() { const b = banners.find(bn => bn.id === state.profile.banner); return b ? b.css : banners[0].css; }
function updateProfileUI() {
    const p = state.profile;
    const ua = document.getElementById('userAvatar');
    if (ua) {
        ua.innerHTML = getAvatarContent();
        if (p.avatarType === 'photo' && p.avatarPhoto) ua.style.background = 'var(--bg-tertiary)';
        else if (p.avatarType === 'color') { const c = avatarColors[p.avatarColor]; ua.style.background = `linear-gradient(135deg,${c[0]},${c[1]})`; }
        else ua.style.background = 'linear-gradient(135deg,var(--accent),var(--blue))';
        ua.classList.toggle('creator', state.role === 'creator' || state.role === 'developer');
    }
    const pa = document.getElementById('profileAvatar');
    if (pa) {
        pa.innerHTML = getAvatarContent();
        if (p.avatarType === 'photo' && p.avatarPhoto) pa.style.background = 'var(--bg-tertiary)';
        else if (p.avatarType === 'color') { const c = avatarColors[p.avatarColor]; pa.style.background = `linear-gradient(135deg,${c[0]},${c[1]})`; }
        else pa.style.background = 'linear-gradient(135deg,var(--accent),var(--blue))';
        pa.className = 'profile-avatar-large ' + getFrameClass();
    }
    const pn = document.getElementById('profileName'); if (pn) pn.textContent = p.nickname;
    const badge = document.getElementById('profileCreatorBadge');
    if (badge) badge.style.display = (state.role === 'creator' || state.role === 'developer') ? 'inline-flex' : 'none';
    const devBtn = document.getElementById('developersBtn');
    if (devBtn) devBtn.style.display = isCreator() ? 'flex' : 'none';
    const bioEl = document.getElementById('profileBio');
    if (bioEl) {
        if (p.bio) { bioEl.textContent = p.bio; bioEl.classList.remove('empty'); } else bioEl.classList.add('empty');
    }
    const pl = document.getElementById('profileLogin'); if (pl) pl.textContent = '@' + state.login;
    const pb = document.getElementById('profileBanner'); if (pb) pb.style.background = getBannerStyle();
    const sm = document.getElementById('statMessages'); if (sm) sm.textContent = state.totalMessages;
    const sc = document.getElementById('statChats'); if (sc) sc.textContent = state.convs.length;
    const sp = document.getElementById('statPosts'); if (sp) sp.textContent = state.totalPosts;
    const ba = document.getElementById('balanceAmount'); if (ba) ba.textContent = state.balance;
    const pba = document.getElementById('profileBalance'); if (pba) pba.textContent = state.balance;
    const rBtn = document.getElementById('quickRemovePhotoBtn');
    if (rBtn) rBtn.style.display = (p.avatarType === 'photo' && p.avatarPhoto) ? 'flex' : 'none';
}

function enterApp() {
    loadFromStorage();
    updateProfileUI();
    
    const auth = document.getElementById('authScreen');
    if (auth) auth.classList.add('hidden');
    const app = document.getElementById('app');
    if (app) app.classList.add('visible');

    try { renderConvList(); } catch(e) { console.warn('renderConvList error', e); }
    try { applyEmojiToStatic(); } catch(e) {}
    try { renderGifts(); } catch(e) { console.warn('renderGifts error', e); }
    try { renderProfileGifts(); } catch(e) { console.warn('renderProfileGifts error', e); }
    
    const oc = document.getElementById('onlineCount');
    if (oc) oc.textContent = Math.max(1, state.convs.filter(c => c.type === 'group').length + 1);
    
    saveToStorage();
    if (state.pin) lockApp();
    requestNotificationPermission();
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (!confirm('Выйти?')) return;
        try { localStorage.removeItem('lunar_session'); } catch(e) {}
        location.reload();
    });
}

(function checkSession() {
    try {
        const s = JSON.parse(localStorage.getItem('lunar_session') || 'null');
        if (s && s.login) {
            const users = getUsers();
            if (users[s.login]) {
                state.user = s.nickname; state.login = s.login;
                state.role = users[s.login].role || 'user';
                state.profile = users[s.login].profile || { nickname: s.nickname, bio: '', avatarType: 'emoji', avatarEmoji: '😎', avatarColor: 0, avatarPhoto: null, avatarPhotoName: '', avatarPhotoSize: 0, banner: 'default', frame: 'none' };
                state.accounts = JSON.parse(localStorage.getItem('lunar_multi_accounts') || '[]');
                setTimeout(() => { enterApp(); showNotif('С возвращением!', s.nickname); }, 300);
            }
        }
    } catch(e) {}
})();

/* ============ STORAGE ============ */
function saveToStorage() {
    try {
        localStorage.setItem('lunar_contacts', JSON.stringify(state.convs.map(c => ({ ...c, messages: c.messages.slice(-300) }))));
        localStorage.setItem('lunar_stats', JSON.stringify({ totalMessages: state.totalMessages, totalPosts: state.totalPosts }));
        localStorage.setItem('lunar_drafts', JSON.stringify(state.drafts));
        localStorage.setItem('lunar_wallpapers', JSON.stringify(state.chatWallpapers));
        localStorage.setItem('lunar_balance', JSON.stringify(state.balance));
        localStorage.setItem('lunar_owned_gifts', JSON.stringify(state.ownedGifts));
        localStorage.setItem('lunar_profile_gifts', JSON.stringify(state.userProfileGifts));
        if (state.pin !== null) localStorage.setItem('lunar_pin', JSON.stringify({ pin: state.pin, autolock: state.pinAutolock }));
        if (state.login) {
            const users = getUsers();
            if (users[state.login]) {
                users[state.login].profile = state.profile;
                users[state.login].nickname = state.profile.nickname;
                users[state.login].role = state.role;
                saveUsers(users);
            }
        }
    } catch(e) {}
}
function loadFromStorage() {
    try {
        const raw = localStorage.getItem('lunar_contacts');
        if (raw) { const d = JSON.parse(raw); if (Array.isArray(d)) state.convs = d.map(c => ({ ...c, messages: (c.messages || []).map(m => ({ ...m })) })); }
        const stats = localStorage.getItem('lunar_stats');
        if (stats) { const s = JSON.parse(stats); state.totalMessages = s.totalMessages || 0; state.totalPosts = s.totalPosts || 0; }
        const drafts = localStorage.getItem('lunar_drafts');
        if (drafts) state.drafts = JSON.parse(drafts);
        const wp = localStorage.getItem('lunar_wallpapers');
        if (wp) state.chatWallpapers = JSON.parse(wp);
        const balance = localStorage.getItem('lunar_balance');
        if (balance !== null) state.balance = JSON.parse(balance);
        const owned = localStorage.getItem('lunar_owned_gifts');
        if (owned) state.ownedGifts = JSON.parse(owned);
        const pg = localStorage.getItem('lunar_profile_gifts');
        if (pg) state.userProfileGifts = JSON.parse(pg);
        const pin = localStorage.getItem('lunar_pin');
        if (pin) { const p = JSON.parse(pin); state.pin = p.pin; state.pinAutolock = p.autolock || 0; }
    } catch(e) {}
}

/* ============ UTILS ============ */
function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function formatTime(ts) { return new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }); }
function formatConvTime(ts) { const d = Date.now() - ts; if (d < 60000) return 'сейчас'; if (d < 3600000) return Math.floor(d / 60000) + ' мин'; if (d < 86400000) return Math.floor(d / 3600000) + ' ч'; return Math.floor(d / 86400000) + ' д'; }
function initials(n) { const p = n.trim().split(/\s+/); return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : n.trim().slice(0, 2).toUpperCase(); }
function genId() { return 'c' + Date.now() + Math.random().toString(36).slice(2, 6); }
function formatDuration(sec) { return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }

/* ============ ROLES ============ */
function getMemberRole(conv, login) { if (!conv || !conv.members) return null; const m = conv.members.find(m => m.login === login); return m ? m.role : null; }
function canWrite(conv) { if (!conv) return false; if (conv.type === 'group' || conv.type === 'dm') return true; const r = getMemberRole(conv, state.login); return r === 'creator' || r === 'admin'; }
function getRoleLabel(r) { if (r === 'creator') return '<span class="role-badge creator">создатель</span>'; if (r === 'admin') return '<span class="role-badge admin">админ</span>'; return ''; }

/* ============ NOTIFICATIONS ============ */
function requestNotificationPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default' && state.notifMode !== 'off') {
        Notification.requestPermission();
    }
}
function sendBrowserNotif(title, body) {
    if (state.notifMode === 'off') return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try { new Notification(title, { body, icon: '/favicon.ico' }); } catch(e) {}
}
function updateTitle() {
    const total = state.convs.filter(c => !c.archived).reduce((s, c) => s + (c.unread || 0), 0);
    document.title = total > 0 ? `(${total}) Lunar` : 'Lunar';
}

/* ============ CONV LIST ============ */
function renderConvList() {
    const container = document.getElementById('convItems');
    if (!container) return;
    const archived = state.convs.filter(c => c.archived);
    const active = state.convs.filter(c => !c.archived);
    const totalUnread = active.reduce((s, c) => s + (c.unread || 0), 0);
    const uB = document.getElementById('chatsBadge'), uC = document.getElementById('unreadCount'), aC = document.getElementById('archiveCount');
    if (uB) { if (totalUnread > 0) { uB.style.display = ''; uB.textContent = totalUnread > 99 ? '99+' : totalUnread; } else uB.style.display = 'none'; }
    if (uC) { if (totalUnread > 0) { uC.style.display = ''; uC.textContent = totalUnread; } else uC.style.display = 'none'; }
    if (aC) { if (archived.length > 0) { aC.style.display = ''; aC.textContent = archived.length; } else aC.style.display = 'none'; }
    updateTitle();
    if (state.filter === 'archive') {
        if (!archived.length) {
            container.innerHTML = `<div class="archive-empty"><svg width="56" height="56" viewBox="0 0 24 24" fill="none"><path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg><div class="title">Архив пуст</div></div>`;
            return;
        }
        container.innerHTML = archived.map(c => renderConvItemHTML(c, true)).join('');
        container.querySelectorAll('.conv-item').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('.unarchive-btn')) { e.stopPropagation(); const c = state.convs.find(x => x.id === el.dataset.id); if (c) { c.archived = false; saveToStorage(); renderConvList(); sound.play('click'); } return; }
                openConv(el.dataset.id);
            });
        });
        return;
    }
    let filtered = active;
    if (state.filter === 'channels') filtered = filtered.filter(c => c.type === 'channel');
    if (state.filter === 'groups') filtered = filtered.filter(c => c.type === 'group');
    if (state.filter === 'unread') filtered = filtered.filter(c => c.unread > 0);
    if (state.filter === 'mentions') filtered = filtered.filter(c => c.messages.some(m => m.mentions && m.mentions.includes(state.login)));
    if (state.search) { const q = state.search.toLowerCase(); filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.messages.some(m => m.text && m.text.toLowerCase().includes(q))); }
    filtered = [...filtered].sort((a, b) => {
        const aT = a.messages.length ? a.messages[a.messages.length - 1].time : 0;
        const bT = b.messages.length ? b.messages[b.messages.length - 1].time : 0;
        return bT - aT;
    });
    if (!filtered.length) {
        container.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:40px 20px;font-size:13px;line-height:1.6;">Нет чатов<br><span style="font-size:12px;">Нажмите + чтобы создать</span></div>`;
        return;
    }
    container.innerHTML = filtered.map(c => renderConvItemHTML(c, false)).join('');
    container.querySelectorAll('.conv-item').forEach(el => el.addEventListener('click', () => openConv(el.dataset.id)));
}
function renderConvItemHTML(c, isArch) {
    const last = c.messages[c.messages.length - 1];
    const draft = state.drafts[c.id];
    let preview = 'Нет сообщений';
    if (draft) preview = `<span class="draft-tag">Черновик:</span> ${escapeHtml(draft.slice(0, 30))}`;
    else if (last) {
        if (last.gift) preview = '🎁 ' + last.gift.name;
        else if (last.voice) preview = '🎤 Голосовое';
        else if (last.file) preview = '📎 ' + (last.file.name || 'Файл');
        else if (last.poll) preview = '📊 ' + last.poll.question;
        else if (last.sticker) preview = '🎨 Стикер';
        else preview = (last.own ? 'Вы: ' : '') + (last.text || '');
    }
    const time = last ? formatConvTime(last.time) : '';
    const hasMention = last && last.mentions && last.mentions.includes(state.login) && !last.own;
    const badge = c.unread > 0 ? `<span class="conv-badge${hasMention ? ' mention' : ''}">${c.unread > 99 ? '99+' : c.unread}</span>` : '';
    const active = state.activeConv === c.id ? ' active' : '';
    const archClass = c.archived ? ' archived-item' : '';
    const muteClass = c.muted ? ' muted' : '';
    const style = c.color ? `background: linear-gradient(135deg, ${c.color[0]}, ${c.color[1]})` : '';
    const typeIcon = c.type === 'channel' ? `<span class="type-icon channel">📢</span>` : c.type === 'dm' ? `<span class="type-icon">💬</span>` : `<span class="type-icon group">👥</span>`;
    const tag = c.type === 'channel' ? '<span class="channel-tag">канал</span>' : c.type === 'dm' ? '' : '<span class="group-tag">группа</span>';
    const unarch = isArch ? `<button class="unarchive-btn">Вернуть</button>` : '';
    return `<div class="conv-item${active}${archClass}${muteClass}" data-id="${c.id}">
        <div class="conv-avatar" style="${style}">${initials(c.name)}${typeIcon}</div>
        <div class="conv-body">
            <div class="conv-top"><div class="conv-name">${escapeHtml(c.name)} ${tag}</div><div class="conv-time">${time}</div></div>
            <div class="conv-bottom"><div class="conv-preview">${preview}</div>${badge}${unarch}</div>
        </div>
    </div>`;
}

/* ============ OPEN CHAT ============ */
function openConv(id) {
    sound.play('click');
    const conv = state.convs.find(c => c.id === id);
    if (!conv) return;
    const curInput = document.getElementById('messageInput');
    if (state.activeConv && curInput && curInput.value.trim()) state.drafts[state.activeConv] = curInput.value;
    state.activeConv = id;
    conv.unread = 0;
    state.replyTo = null;
    state.editingMsg = null;
    
    const rb = document.getElementById('replyBar'); if (rb) rb.classList.remove('active');
    const ec = document.getElementById('emptyChat'); if (ec) ec.style.display = 'none';
    const ac = document.getElementById('activeChat'); if (ac) ac.style.display = 'flex';
    
    const avatar = document.getElementById('chatHeaderAvatar');
    if (avatar) {
        avatar.textContent = initials(conv.name);
        avatar.style.background = conv.color ? `linear-gradient(135deg,${conv.color[0]},${conv.color[1]})` : '';
    }
    const nameEl = document.getElementById('chatHeaderName');
    if (nameEl) {
        const tag = conv.type === 'channel' ? '<span class="channel-tag">канал</span>' : conv.type === 'dm' ? '' : '<span class="group-tag">группа</span>';
        nameEl.innerHTML = escapeHtml(conv.name) + ' ' + tag + (conv.archived ? ' 📦' : '');
    }
    const statusEl = document.getElementById('chatHeaderStatus');
    if (statusEl) {
        const mc = conv.members ? conv.members.length : 1;
        statusEl.textContent = conv.description || (conv.type === 'channel' ? mc + ' подписчиков' : mc + ' участников');
    }
    const ban = document.getElementById('channelBanner'), bant = document.getElementById('channelBannerText');
    if (ban && bant) {
        if (conv.type === 'channel') { ban.style.display = 'flex'; bant.textContent = canWrite(conv) ? 'Вы можете писать (создатель/админ)' : 'Только создатель и админы могут писать'; }
        else ban.style.display = 'none';
    }
    applyChatWallpaper(id);
    const form = document.getElementById('messageForm'), ro = document.getElementById('readonlyBar');
    if (form && ro) {
        if (canWrite(conv)) { form.style.display = 'flex'; ro.style.display = 'none'; } else { form.style.display = 'none'; ro.style.display = 'flex'; }
    }
    if (curInput) curInput.value = state.drafts[id] || '';
    const cl = document.getElementById('convList'); if (cl) cl.classList.add('mobile-hide');
    const cw = document.getElementById('chatWindow'); if (cw) cw.classList.add('mobile-open');
    const bb = document.getElementById('backBtn'); if (bb) bb.style.display = '';
    renderMessages();
    renderConvList();
    updatePinnedBar();
    updateSmartReplies();
    const m = document.getElementById('messages');
    if (m) setTimeout(() => { m.scrollTop = m.scrollHeight; }, 50);
}
function closeChatMobile() { 
    const cl = document.getElementById('convList'); if (cl) cl.classList.remove('mobile-hide'); 
    const cw = document.getElementById('chatWindow'); if (cw) cw.classList.remove('mobile-open'); 
}
function applyChatWallpaper(convId) {
    const wp = state.chatWallpapers[convId];
    const msgs = document.getElementById('messages');
    if (!msgs) return;
    if (wp) { msgs.style.background = wp; msgs.classList.add('has-wallpaper'); }
    else { msgs.style.background = ''; msgs.classList.remove('has-wallpaper'); }
}
function updatePinnedBar() {
    const conv = state.convs.find(c => c.id === state.activeConv);
    const bar = document.getElementById('pinnedBar');
    if (!bar) return;
    if (!conv || !conv.pinned || !conv.pinned.length) { bar.style.display = 'none'; return; }
    bar.style.display = 'flex';
    const last = conv.pinned[conv.pinned.length - 1];
    const msg = conv.messages.find(m => m.id === last);
    const pt = document.getElementById('pinnedText');
    if (pt) pt.textContent = msg ? (msg.author + ': ' + (msg.text || '').slice(0, 50)) : '—';
}

/* ============ MESSAGES ============ */
function renderMessages() {
    const conv = state.convs.find(c => c.id === state.activeConv);
    if (!conv) return;
    const container = document.getElementById('messages');
    if (!container) return;
    if (!conv.messages.length) { container.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px 20px;font-size:13px;">Начните общение</div>'; return; }
    let html = '', lastDate = null;
    conv.messages.forEach(m => {
        const d = new Date(m.time), dk = d.toDateString();
        if (dk !== lastDate) {
            lastDate = dk;
            const today = new Date().toDateString(), y = new Date(Date.now() - 86400000).toDateString();
            let label = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
            if (dk === today) label = 'Сегодня'; else if (dk === y) label = 'Вчера';
            html += `<div class="date-divider"><span>${label}</span></div>`;
        }
        const own = m.own;
        const authorName = own ? state.profile.nickname : m.author;
        let avatarText, avatarStyle;
        if (own) { avatarText = getAvatarContent(); avatarStyle = state.profile.avatarType === 'photo' ? 'background: var(--bg-tertiary)' : state.profile.avatarType === 'color' ? `background: linear-gradient(135deg,${avatarColors[state.profile.avatarColor][0]},${avatarColors[state.profile.avatarColor][1]})` : 'background: linear-gradient(135deg,var(--accent),var(--blue))'; }
        else { avatarText = initials(conv.name); avatarStyle = conv.color ? `background: linear-gradient(135deg,${conv.color[0]},${conv.color[1]})` : ''; }
        const gB = getGlobalRoleBadge(m.globalRole);
        const rB = getRoleLabel(m.role || '');
        const reactionsHtml = m.reactions && m.reactions.length ? `<div class="reactions">${m.reactions.map(r => `<span class="reaction${r.own ? ' own' : ''}" data-msg="${m.id}" data-emoji="${r.emoji}">${emojiImg(r.emoji)} ${r.count}</span>`).join('')}</div>` : '';
        const replyHtml = m.replyTo ? `<div class="reply-quote"><b>${escapeHtml(m.replyTo.author)}</b>${escapeHtml(m.replyTo.text)}</div>` : '';
        const fwdHtml = m.forwardedFrom ? `<span class="forward-tag">↪ Переслано от ${escapeHtml(m.forwardedFrom)}</span>` : '';
        const editedHtml = m.edited ? '<span class="edited-tag">(изменено)</span>' : '';
        let bubbleContent = '';
        if (m.gift) {
            bubbleContent = `<div style="background:transparent;border:none;padding:0;width:200px;">
                <img src="${m.gift.img}" alt="${m.gift.name}" style="width:80px;height:80px;object-fit:contain;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.4));">
                <div style="font-size:14px;font-weight:600;text-align:center;margin-top:8px;">${escapeHtml(m.gift.name)}</div>
                <div style="font-size:10px;font-weight:700;padding:2px 10px;border-radius:10px;text-transform:uppercase;background:rgba(100,116,139,.2);color:#94a3b8;">${m.gift.rarity}</div>
                ${m.text ? `<div style="font-size:12px;color:var(--text-secondary);text-align:center;margin-top:6px;padding-top:6px;border-top:1px solid var(--border);">${escapeHtml(m.text)}</div>` : ''}
            </div>`;
        }
        else if (m.voice) bubbleContent = `<audio class="voice-msg" controls src="${m.voice}"></audio>`;
        else if (m.file) {
            if (m.file.type && m.file.type.startsWith('image/')) bubbleContent = `<a href="${m.file.data}" target="_blank"><img class="attachment-img" src="${m.file.data}" alt=""></a>`;
            else bubbleContent = `<a class="file-attachment" href="${m.file.data}" download="${escapeHtml(m.file.name)}">📎 ${escapeHtml(m.file.name)}</a>`;
        }
        else if (m.sticker) bubbleContent = `<span class="sticker-big">${emojiImg(m.sticker)}</span>`;
        else if (m.poll) {
            const total = m.poll.votes.reduce((s, v) => s + v.length, 0);
            bubbleContent = `<div class="poll"><div class="poll-question">${escapeHtml(m.poll.question)}</div>${m.poll.options.map((opt, i) => {
                const votes = m.poll.votes[i] || [], pct = total > 0 ? Math.round(votes.length / total * 100) : 0;
                const voted = votes.includes(state.login);
                return `<div class="poll-option${voted ? ' voted' : ''}" data-poll="${m.id}" data-opt="${i}">${voted ? '✓' : '○'} <span style="flex:1">${escapeHtml(opt)}</span><div class="poll-bar"><div class="poll-bar-fill" style="width:${pct}%"></div></div><span class="poll-count">${pct}% (${votes.length})</span></div>`;
            }).join('')}</div>`;
        }
        else {
            let textHtml = escapeHtml(m.text || '');
            if (m.mentions) m.mentions.forEach(mn => { textHtml = textHtml.replace(new RegExp('@' + mn, 'g'), `<span class="mention" data-user="${mn}">@${mn}</span>`); });
            bubbleContent = `${replyHtml}${fwdHtml}${textHtml}${editedHtml}${reactionsHtml}`;
        }
        html += `<div class="message${own ? ' own' : ''}" data-id="${m.id}">
            <div class="message-avatar" style="${avatarStyle}" data-user="${own ? state.login : ''}">${avatarText}</div>
            <div class="message-content">
                <div class="message-author">${escapeHtml(authorName)} ${gB} ${rB}</div>
                <div class="message-bubble">${bubbleContent}</div>
                <div class="message-time">${formatTime(m.time)}${m.expiresAt ? ' ⏱' : ''}</div>
            </div>
            <div class="msg-actions">
                <button data-action="reply" data-id="${m.id}" title="Ответить">${emojiImg('↩️')}</button>
                <button data-action="react" data-id="${m.id}" title="Реакция">${emojiImg('😊')}</button>
                <button data-action="copy" data-id="${m.id}" title="Копировать">${emojiImg('📋')}</button>
                <button data-action="forward" data-id="${m.id}" title="Переслать">${emojiImg('↪️')}</button>
                <button data-action="pin" data-id="${m.id}" title="Закрепить">${emojiImg('📌')}</button>
                ${own ? `<button data-action="edit" data-id="${m.id}" title="Изменить">${emojiImg('✏️')}</button><button data-action="delete" data-id="${m.id}" title="Удалить">${emojiImg('🗑️')}</button>` : ''}
            </div>
        </div>`;
    });
    container.innerHTML = html;
    container.querySelectorAll('.msg-actions button').forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); handleMsgAction(b.dataset.action, b.dataset.id); }));
    container.querySelectorAll('.reaction').forEach(el => el.addEventListener('click', () => toggleReaction(el.dataset.msg, el.dataset.emoji)));
    container.querySelectorAll('.poll-option').forEach(el => el.addEventListener('click', () => votePoll(el.dataset.poll, parseInt(el.dataset.opt))));
    container.querySelectorAll('.mention').forEach(el => el.addEventListener('click', () => openUserProfile(el.dataset.user)));
    container.querySelectorAll('.message-avatar[data-user]').forEach(el => { if (el.dataset.user) el.addEventListener('click', () => openUserProfile(el.dataset.user)); });
    attachSwipeHandlers();
    setTimeout(() => { container.scrollTop = container.scrollHeight; }, 30);
}

function handleMsgAction(action, msgId) {
    const conv = state.convs.find(c => c.id === state.activeConv);
    if (!conv) return;
    const msg = conv.messages.find(m => String(m.id) === String(msgId));
    if (!msg) return;
    sound.play('click');
    if (action === 'reply') {
        state.replyTo = msg;
        const rb = document.getElementById('replyBar'); if (rb) rb.classList.add('active');
        const ra = document.getElementById('replyAuthor'); if (ra) ra.textContent = msg.own ? state.profile.nickname : msg.author;
        const rt = document.getElementById('replyText'); if (rt) rt.textContent = msg.text || '[вложение]';
        const mi = document.getElementById('messageInput'); if (mi) mi.focus();
    } else if (action === 'react') toggleReaction(msgId, '👍');
    else if (action === 'copy') { navigator.clipboard?.writeText(msg.text || ''); showNotif('Скопировано', (msg.text || '').slice(0, 40)); }
    else if (action === 'forward') {
        state.forwardMsg = msg;
        openForwardModal();
    } else if (action === 'pin') {
        if (!conv.pinned) conv.pinned = [];
        if (!conv.pinned.includes(msg.id)) conv.pinned.push(msg.id);
        saveToStorage(); updatePinnedBar(); showNotif('Закреплено', '');
    } else if (action === 'edit') {
        state.editingMsg = msg;
        const input = document.getElementById('messageInput');
        if (input) { input.value = msg.text; input.focus(); }
        showNotif('Редактирование', 'Esc — отмена');
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
    const ex = msg.reactions.find(r => r.emoji === emoji);
    if (ex) { if (ex.own) { ex.count--; ex.own = false; if (ex.count <= 0) msg.reactions = msg.reactions.filter(r => r !== ex); } else { ex.count++; ex.own = true; } }
    else msg.reactions.push({ emoji, count: 1, own: true });
    sound.play('like'); renderMessages(); saveToStorage();
}
function votePoll(msgId, optIdx) {
    const conv = state.convs.find(c => c.id === state.activeConv);
    const msg = conv.messages.find(m => String(m.id) === String(msgId));
    if (!msg || !msg.poll) return;
    msg.poll.votes.forEach((v, i) => { const idx = v.indexOf(state.login); if (idx !== -1) v.splice(idx, 1); });
    if (!msg.poll.votes[optIdx]) msg.poll.votes[optIdx] = [];
    msg.poll.votes[optIdx].push(state.login);
    sound.play('click'); renderMessages(); saveToStorage();
}

/* ============ SEND ============ */
const messageForm = document.getElementById('messageForm');
if (messageForm) {
    messageForm.addEventListener('submit', (e) => { e.preventDefault(); sendMessage(); });
}
function sendMessage() {
    const input = document.getElementById('messageInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text || !state.activeConv) return;
    const conv = state.convs.find(c => c.id === state.activeConv);
    if (!conv || !canWrite(conv)) { sound.play('error'); return; }
    if (state.editingMsg) {
        state.editingMsg.text = text;
        state.editingMsg.edited = true;
        state.editingMsg.editedAt = Date.now();
        state.editingMsg.mentions = extractMentions(text);
        state.editingMsg = null;
        input.value = '';
        sound.play('send');
        renderMessages(); saveToStorage();
        return;
    }
    const role = getMemberRole(conv, state.login);
    const mentions = extractMentions(text);
    const msg = {
        id: Date.now() + Math.random(), author: state.profile.nickname, text,
        time: Date.now(), own: true, reactions: [], role: role || '', globalRole: state.role,
        mentions,
        replyTo: state.replyTo ? { author: state.replyTo.own ? state.profile.nickname : state.replyTo.author, text: state.replyTo.text || '📎' } : null
    };
    conv.messages.push(msg);
    state.totalMessages++;
    input.value = '';
    delete state.drafts[conv.id];
    state.replyTo = null;
    const rb = document.getElementById('replyBar'); if (rb) rb.classList.remove('active');
    const sr = document.getElementById('smartReplies'); if (sr) sr.style.display = 'none';
    sound.play('send');
    renderMessages(); renderConvList(); saveToStorage();
}
function extractMentions(text) {
    const m = text.match(/@([a-zA-Z0-9_]+)/g);
    return m ? m.map(x => x.slice(1).toLowerCase()) : [];
}

/* ============ SWIPE ============ */
function attachSwipeHandlers() {
    const messages = document.querySelectorAll('.message');
    messages.forEach(el => {
        let startX = 0, currentX = 0, isDragging = false;
        let leftInd = null, rightInd = null;
        el.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            el.classList.add('message-swiping');
        }, { passive: true });
        el.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX - startX;
            const maxDist = 80;
            const dx = Math.max(-maxDist, Math.min(maxDist, currentX));
            el.style.transform = `translateX(${dx}px)`;
            if (dx > 30) {
                if (!leftInd) { leftInd = document.createElement('div'); leftInd.className = 'swipe-indicator left'; leftInd.textContent = '↩'; el.appendChild(leftInd); }
                leftInd.classList.add('visible');
                if (rightInd) rightInd.classList.remove('visible');
            } else if (dx < -30) {
                if (!rightInd) { rightInd = document.createElement('div'); rightInd.className = 'swipe-indicator right'; rightInd.textContent = '🗑'; el.appendChild(rightInd); }
                rightInd.classList.add('visible');
                if (leftInd) leftInd.classList.remove('visible');
            } else {
                if (leftInd) leftInd.classList.remove('visible');
                if (rightInd) rightInd.classList.remove('visible');
            }
        }, { passive: true });
        el.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            const dx = currentX;
            el.classList.remove('message-swiping');
            el.style.transform = '';
            if (leftInd) { leftInd.remove(); leftInd = null; }
            if (rightInd) { rightInd.remove(); rightInd = null; }
            const msgId = el.dataset.id;
            if (dx > 60) { handleMsgAction('reply', msgId); sound.play('click'); }
            else if (dx < -60) { handleMsgAction('delete', msgId); sound.play('click'); }
            currentX = 0;
        });
    });
}

/* ============ NOTIFICATIONS UI ============ */
function showNotif(title, text, avatar) {
    const container = document.getElementById('notifContainer');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'notif';
    const av = avatar || title.charAt(0).toUpperCase();
    el.innerHTML = `<div class="notif-avatar">${escapeHtml(av)}</div><div class="notif-body"><div class="notif-title">${escapeHtml(title)}</div><div class="notif-text">${escapeHtml(text)}</div></div>`;
    container.appendChild(el);
    sound.play('notif');
    sendBrowserNotif(title, text);
    setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 300); }, 4000);
    el.addEventListener('click', () => el.remove());
}

/* ============ TABS ============ */
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        sound.play('click');
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const tab = item.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        const tgt = document.getElementById('tab-' + tab);
        if (tgt) tgt.classList.add('active');
        if (tab === 'chats') { 
            const cl = document.getElementById('convList'); if (cl) cl.classList.remove('mobile-hide'); 
            const cw = document.getElementById('chatWindow'); if (cw) cw.classList.remove('mobile-open'); 
        }
        if (tab === 'profile') updateProfileUI();
        if (tab === 'friends') renderFriends();
        if (tab === 'gifts') renderGifts();
    });
});
const backBtn = document.getElementById('backBtn');
if (backBtn) backBtn.addEventListener('click', closeChatMobile);
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
const themeSettingsBtn = document.getElementById('themeSettingsBtn');
if (themeSettingsBtn) themeSettingsBtn.addEventListener('click', () => { sound.play('click'); renderThemeGrid(); openModal('themeModal'); });

/* ============ THEME MODAL ============ */
document.querySelectorAll('#themeModeSwitch button').forEach(btn => {
    btn.addEventListener('click', () => {
        state.themeMode = btn.dataset.mode;
        localStorage.setItem('lunar_theme_mode', state.themeMode);
        applyTheme(); renderThemeGrid(); sound.play('click');
    });
});
function renderThemeGrid() {
    document.querySelectorAll('#themeModeSwitch button').forEach(b => b.classList.toggle('active', b.dataset.mode === state.themeMode));
    const grid = document.getElementById('themeGrid');
    if (!grid) return;
    grid.innerHTML = Object.entries(themeColors).map(([key, t]) => {
        const c = t[state.themeMode === 'light' ? 'light' : 'dark'];
        const act = key === state.themeColor ? ' active' : '';
        return `<div class="theme-card${act}" data-theme="${key}">
            <div class="theme-preview" style="background: linear-gradient(135deg, ${c.b1b}, #0a0e1a);">
                <div class="theme-preview-blob b1" style="background: ${c.b1a}; position:absolute; width:40px; height:40px; border-radius:50%; filter:blur(15px); top:-10px; left:-10px;"></div>
                <div class="theme-preview-blob b2" style="background: ${c.b2a}; position:absolute; width:40px; height:40px; border-radius:50%; filter:blur(15px); bottom:-10px; right:-10px;"></div>
            </div>
            <div class="theme-card-name">${t.name}</div>
        </div>`;
    }).join('');
    grid.querySelectorAll('.theme-card').forEach(el => {
        el.addEventListener('click', () => {
            state.themeColor = el.dataset.theme;
            localStorage.setItem('lunar_theme_color', state.themeColor);
            applyTheme(); renderThemeGrid(); sound.play('click');
        });
    });
}

/* ============ ARCHIVE ============ */
const archiveChatBtn = document.getElementById('archiveChatBtn');
if (archiveChatBtn) {
    archiveChatBtn.addEventListener('click', () => {
        const conv = state.convs.find(c => c.id === state.activeConv);
        if (!conv) return;
        conv.archived = !conv.archived;
        saveToStorage(); renderConvList(); sound.play('click');
        if (state.activeConv === conv.id) openConv(conv.id);
    });
}

/* ============ FILTERS ============ */
document.querySelectorAll('.conv-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        sound.play('click');
        document.querySelectorAll('.conv-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.filter = tab.dataset.filter;
        renderConvList();
    });
});
const convSearch = document.getElementById('convSearch');
if (convSearch) convSearch.addEventListener('input', (e) => { state.search = e.target.value; renderConvList(); });

/* ============ CHAT ACTIONS ============ */
const muteBtn = document.getElementById('muteBtn');
if (muteBtn) {
    muteBtn.addEventListener('click', () => {
        const conv = state.convs.find(c => c.id === state.activeConv);
        if (!conv) return;
        conv.muted = !conv.muted;
        saveToStorage(); renderConvList(); sound.play('click');
        showNotif(conv.muted ? 'Без звука' : 'Звук включён', conv.name);
    });
}
const clearChatBtn = document.getElementById('clearChatBtn');
if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
        const conv = state.convs.find(c => c.id === state.activeConv);
        if (!conv) return;
        if (confirm('Очистить?')) { conv.messages = []; renderMessages(); renderConvList(); saveToStorage(); sound.play('click'); }
    });
}
const cancelReply = document.getElementById('cancelReply');
if (cancelReply) {
    cancelReply.addEventListener('click', () => {
        state.replyTo = null; state.editingMsg = null;
        const rb = document.getElementById('replyBar'); if (rb) rb.classList.remove('active');
        const mi = document.getElementById('messageInput'); if (mi) mi.value = '';
    });
}
const searchMsgBtn = document.getElementById('searchMsgBtn');
if (searchMsgBtn) searchMsgBtn.addEventListener('click', () => openModal('searchModal'));
const pinnedBtn = document.getElementById('pinnedBtn');
if (pinnedBtn) pinnedBtn.addEventListener('click', () => openPinnedModal());

/* ============ MODALS ============ */
function openModal(id) { const m = document.getElementById(id); if (m) m.classList.add('active'); }
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('active'); }
document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.dataset.close)));
document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', (e) => { if (e.target === o) closeModal(o.id); }));

/* ============ CREATE ============ */
function renderCreateColors() {
    const c = document.getElementById('createAvatarChoices');
    if (!c) return;
    c.innerHTML = avatarColors.slice(0, 8).map((col, i) => `<div class="avatar-choice${i === state.createSelectedColor ? ' selected' : ''}" data-idx="${i}" style="background: linear-gradient(135deg, ${col[0]}, ${col[1]})"></div>`).join('');
    c.querySelectorAll('.avatar-choice').forEach(el => el.addEventListener('click', () => {
        c.querySelectorAll('.avatar-choice').forEach(x => x.classList.remove('selected'));
        el.classList.add('selected'); state.createSelectedColor = parseInt(el.dataset.idx); sound.play('click');
    }));
}
const createChatBtn = document.getElementById('createChatBtn');
if (createChatBtn) {
    createChatBtn.addEventListener('click', () => {
        sound.play('click');
        state.createType = 'channel'; state.createSelectedColor = 0;
        const cn = document.getElementById('createName'); if (cn) cn.value = '';
        const cd = document.getElementById('createDesc'); if (cd) cd.value = '';
        document.querySelectorAll('#createTypeSwitch button').forEach(b => b.classList.remove('active'));
        const chBtn = document.querySelector('#createTypeSwitch button[data-type="channel"]'); if (chBtn) chBtn.classList.add('active');
        const hint = document.getElementById('createTypeHint');
        if (hint && hint.querySelector('span')) hint.querySelector('span').textContent = 'В канале писать могут только создатель и админы';
        renderCreateColors(); openModal('createChatModal');
    });
}
document.querySelectorAll('#createTypeSwitch button').forEach(b => b.addEventListener('click', () => {
    sound.play('click');
    document.querySelectorAll('#createTypeSwitch button').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); state.createType = b.dataset.type;
    const hint = document.getElementById('createTypeHint');
    if (hint && hint.querySelector('span')) hint.querySelector('span').textContent = state.createType === 'channel' ? 'В канале писать могут только создатель и админы' : 'В группе могут писать все участники';
}));
const confirmCreateBtn = document.getElementById('confirmCreateBtn');
if (confirmCreateBtn) {
    confirmCreateBtn.addEventListener('click', () => {
        const nameEl = document.getElementById('createName');
        const descEl = document.getElementById('createDesc');
        const name = nameEl ? nameEl.value.trim() : '';
        const desc = descEl ? descEl.value.trim() : '';
        if (!name) { sound.play('error'); return; }
        if (state.convs.some(c => c.name.toLowerCase() === name.toLowerCase())) { showNotif('Ошибка', 'Уже существует'); return; }
        const nc = {
            id: genId(), name, description: desc || (state.createType === 'channel' ? 'Канал' : 'Группа'),
            type: state.createType, color: avatarColors[state.createSelectedColor],
            messages: [], unread: 0, archived: false, muted: false,
            creatorLogin: state.login,
            members: [{ login: state.login, name: state.profile.nickname, role: 'creator' }]
        };
        state.convs.unshift(nc);
        saveToStorage(); renderConvList();
        closeModal('createChatModal');
        sound.play('success');
        setTimeout(() => openConv(nc.id), 300);
    });
}

/* ============ MEMBERS ============ */
function openMembersModal() {
    const conv = state.convs.find(c => c.id === state.activeConv);
    if (!conv || !conv.members) return;
    const myRole = getMemberRole(conv, state.login);
    const isC = myRole === 'creator', isA = myRole === 'admin';
    const canM = isC || isA;
    const mhi = document.getElementById('membersHeaderInfo'); if (mhi) mhi.innerHTML = `<b>${escapeHtml(conv.name)}</b> — ${conv.type === 'channel' ? 'канал' : 'группа'}`;
    const amf = document.getElementById('addMemberForm'); if (amf) amf.style.display = canM ? 'flex' : 'none';
    const list = document.getElementById('membersList');
    if (!list) return;
    list.innerHTML = conv.members.map(m => {
        const rL = m.role === 'creator' ? '<span class="role-pill creator">создатель</span>' : m.role === 'admin' ? '<span class="role-pill admin">админ</span>' : '<span class="role-pill member">участник</span>';
        const canP = isC && m.role !== 'creator';
        const canD = isC && m.role === 'admin';
        const canR = (isC || (isA && m.role === 'member')) && m.login !== state.login;
        return `<div class="member-item"><div class="member-avatar">${initials(m.name)}</div><div class="member-info"><div class="member-name">${escapeHtml(m.name)} ${rL}</div><div class="member-status">@${m.login}</div></div><div class="member-actions">
            ${canP ? `<button data-action="promote" data-login="${m.login}">⬆️</button>` : ''}
            ${canD ? `<button data-action="demote" data-login="${m.login}">⬇️</button>` : ''}
            ${canR ? `<button data-action="remove" data-login="${m.login}" class="danger">❌</button>` : ''}
        </div></div>`;
    }).join('');
    list.querySelectorAll('.member-actions button').forEach(b => b.addEventListener('click', () => {
        const m = conv.members.find(x => x.login === b.dataset.login);
        if (!m) return;
        if (b.dataset.action === 'promote') m.role = 'admin';
        else if (b.dataset.action === 'demote') m.role = 'member';
        else if (b.dataset.action === 'remove') conv.members = conv.members.filter(x => x.login !== b.dataset.login);
        saveToStorage(); openMembersModal(); sound.play('click');
    }));
    openModal('membersModal');
}
const membersBtn = document.getElementById('membersBtn');
if (membersBtn) membersBtn.addEventListener('click', () => { sound.play('click'); openMembersModal(); });
const addMemberBtn = document.getElementById('addMemberBtn');
if (addMemberBtn) {
    addMemberBtn.addEventListener('click', () => {
        const conv = state.convs.find(c => c.id === state.activeConv);
        const nameEl = document.getElementById('newMemberName');
        const name = nameEl ? nameEl.value.trim() : '';
        if (!conv || !name) return;
        if (conv.members.some(m => m.name.toLowerCase() === name.toLowerCase())) { showNotif('Ошибка', 'Уже есть'); return; }
        conv.members.push({ login: name.toLowerCase().replace(/\s+/g, '_'), name, role: 'member' });
        if (nameEl) nameEl.value = '';
        saveToStorage(); openMembersModal(); sound.play('success');
    });
}

/* ============ DEVELOPERS ============ */
function renderDevelopersModal() {
    const devs = getAllUsersList().filter(u => u.role === 'creator' || u.role === 'developer');
    const list = document.getElementById('devsList');
    if (!list) return;
    const adf = document.getElementById('addDevForm'); if (adf) adf.style.display = isCreator() ? 'flex' : 'none';
    if (!devs.length) { list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">Нет разработчиков</div>'; return; }
    list.innerHTML = devs.map(u => {
        const isMe = u.login === state.login;
        const canR = isCreator() && u.login !== state.login;
        return `<div class="member-item" style="${isMe ? 'border-color:var(--accent)' : ''}"><div class="member-avatar" style="background:linear-gradient(135deg,#fbbf24,#f59e0b)">${initials(u.nickname)}</div><div class="member-info"><div class="member-name">${escapeHtml(u.nickname)} ${getGlobalRoleBadge(u.role)} ${isMe ? '(вы)' : ''}</div><div class="member-status">@${u.login}</div></div>${canR ? `<button class="dev-remove-btn" data-login="${u.login}">×</button>` : ''}</div>`;
    }).join('');
    list.querySelectorAll('.dev-remove-btn').forEach(b => b.addEventListener('click', () => {
        if (!confirm('Забрать creator?')) return;
        const users = getUsers();
        if (users[b.dataset.login]) { users[b.dataset.login].role = 'user'; saveUsers(users); renderDevelopersModal(); sound.play('click'); }
    }));
}
const developersBtn = document.getElementById('developersBtn');
if (developersBtn) developersBtn.addEventListener('click', () => { sound.play('click'); renderDevelopersModal(); openModal('developersModal'); });
const addDevBtn = document.getElementById('addDevBtn');
if (addDevBtn) {
    addDevBtn.addEventListener('click', () => {
        if (!isCreator()) return;
        const nameEl = document.getElementById('newDevName');
        const login = nameEl ? nameEl.value.trim().toLowerCase() : '';
        if (!login) return;
        const users = getUsers();
        if (!users[login]) { showNotif('Ошибка', 'Пользователь не найден'); return; }
        users[login].role = 'developer'; saveUsers(users);
        if (nameEl) nameEl.value = '';
        renderDevelopersModal(); sound.play('success');
    });
}

/* ============ SEARCH ============ */
const msgSearchInput = document.getElementById('msgSearchInput');
if (msgSearchInput) msgSearchInput.addEventListener('input', performSearch);
const searchAuthorFilter = document.getElementById('searchAuthorFilter');
if (searchAuthorFilter) searchAuthorFilter.addEventListener('input', performSearch);
const searchDateFilter = document.getElementById('searchDateFilter');
if (searchDateFilter) searchDateFilter.addEventListener('change', performSearch);
function performSearch() {
    const qEl = document.getElementById('msgSearchInput');
    const aEl = document.getElementById('searchAuthorFilter');
    const dEl = document.getElementById('searchDateFilter');
    const q = qEl ? qEl.value.toLowerCase().trim() : '';
    const author = aEl ? aEl.value.toLowerCase().trim() : '';
    const date = dEl ? dEl.value : '';
    const results = document.getElementById('searchResults');
    if (!results) return;
    if (!q && !author && !date) { results.innerHTML = '<div class="search-empty">Введите запрос</div>'; return; }
    const matches = [];
    state.convs.forEach(conv => {
        conv.messages.forEach(m => {
            if (q && !(m.text && m.text.toLowerCase().includes(q))) return;
            if (author && !(m.author && m.author.toLowerCase().includes(author))) return;
            if (date) { const d = new Date(m.time).toISOString().slice(0, 10); if (d !== date) return; }
            matches.push({ conv, msg: m });
        });
    });
    if (!matches.length) { results.innerHTML = '<div class="search-empty">Ничего не найдено</div>'; return; }
    results.innerHTML = matches.slice(0, 50).map(({ conv, msg }) => {
        let text = escapeHtml(msg.text || '');
        if (q) text = text.replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>');
        return `<div class="search-result-item" data-conv="${conv.id}" data-msg="${msg.id}">
            <div class="search-result-header"><b>${escapeHtml(conv.name)}</b><span>${escapeHtml(msg.author)} · ${formatTime(msg.time)}</span></div>
            <div class="search-result-text">${text}</div>
        </div>`;
    }).join('');
    results.querySelectorAll('.search-result-item').forEach(el => el.addEventListener('click', () => {
        const convId = el.dataset.conv, msgId = el.dataset.msg;
        closeModal('searchModal');
        openConv(convId);
        setTimeout(() => {
            const msgEl = document.querySelector(`.message[data-id="${msgId}"]`);
            if (msgEl) { msgEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); msgEl.classList.add('highlight'); setTimeout(() => msgEl.classList.remove('highlight'), 1500); }
        }, 200);
    }));
}

/* ============ PINNED ============ */
function openPinnedModal() {
    const conv = state.convs.find(c => c.id === state.activeConv);
    const list = document.getElementById('pinnedList');
    if (!list) return;
    if (!conv || !conv.pinned || !conv.pinned.length) { list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">Нет закреплённых</div>'; }
    else {
        list.innerHTML = conv.pinned.map(id => {
            const m = conv.messages.find(x => x.id === id);
            if (!m) return '';
            return `<div class="pinned-item" data-msg="${id}"><div class="pinned-item-author">${escapeHtml(m.author)}</div><div class="pinned-item-text">${escapeHtml(m.text || '[вложение]')}</div><div class="pinned-item-footer"><span>${formatTime(m.time)}</span><button class="unpin-btn" data-msg="${id}" style="color:var(--danger);background:none;border:none;cursor:pointer;font-size:11px;">Открепить</button></div></div>`;
        }).join('');
    }
    list.querySelectorAll('.pinned-item').forEach(el => el.addEventListener('click', () => {
        const m = document.querySelector(`.message[data-id="${el.dataset.msg}"]`);
        if (m) { closeModal('pinnedModal'); m.scrollIntoView({ behavior: 'smooth', block: 'center' }); m.classList.add('highlight'); setTimeout(() => m.classList.remove('highlight'), 1500); }
    }));
    list.querySelectorAll('.unpin-btn').forEach(b => b.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = b.dataset.msg;
        conv.pinned = conv.pinned.filter(x => String(x) !== String(id));
        saveToStorage(); openPinnedModal(); updatePinnedBar(); sound.play('click');
    }));
    openModal('pinnedModal');
}
const unpinBtn = document.getElementById('unpinBtn');
if (unpinBtn) {
    unpinBtn.addEventListener('click', () => {
        const conv = state.convs.find(c => c.id === state.activeConv);
        if (!conv || !conv.pinned) return;
        conv.pinned = conv.pinned.slice(0, -1);
        saveToStorage(); updatePinnedBar();
    });
}

/* ============ FORWARD ============ */
function openForwardModal() {
    const list = document.getElementById('forwardList');
    if (!list) return;
    list.innerHTML = state.convs.filter(c => canWrite(c)).map(c => `<div class="forward-item" data-id="${c.id}"><div class="forward-avatar">${initials(c.name)}</div><div class="forward-name">${escapeHtml(c.name)}</div></div>`).join('');
    list.querySelectorAll('.forward-item').forEach(el => el.addEventListener('click', () => {
        const target = state.convs.find(c => c.id === el.dataset.id);
        if (target && state.forwardMsg) {
            target.messages.push({ ...state.forwardMsg, id: Date.now() + Math.random(), own: true, time: Date.now(), forwardedFrom: state.forwardMsg.author, replyTo: null });
            saveToStorage(); renderConvList(); showNotif('Переслано', target.name); sound.play('success');
        }
        closeModal('forwardModal'); state.forwardMsg = null;
    }));
    openModal('forwardModal');
}

/* ============ POLL ============ */
const createPollBtn = document.getElementById('createPollBtn');
if (createPollBtn) {
    createPollBtn.addEventListener('click', () => {
        const qEl = document.getElementById('pollQuestion');
        const oEl = document.getElementById('pollOptions');
        const q = qEl ? qEl.value.trim() : '';
        const opts = oEl ? oEl.value.split('\n').map(x => x.trim()).filter(x => x) : [];
        if (!q || opts.length < 2) { showNotif('Ошибка', 'Нужен вопрос и минимум 2 варианта'); return; }
        const conv = state.convs.find(c => c.id === state.activeConv);
        if (!conv) return;
        conv.messages.push({ id: Date.now() + Math.random(), author: state.profile.nickname, time: Date.now(), own: true, poll: { question: q, options: opts, votes: opts.map(() => []) }, reactions: [], globalRole: state.role, replyTo: null });
        saveToStorage(); renderMessages(); renderConvList();
        closeModal('pollModal'); 
        if (qEl) qEl.value = ''; 
        if (oEl) oEl.value = 'Да\nНет\nМожет быть';
        sound.play('success');
    });
}

/* ============ EMOJI PICKER ============ */
function renderEmojiPicker() {
    const cats = document.getElementById('emojiCategories');
    if (!cats) return;
    cats.innerHTML = Object.keys(emojiCategories).map((cat, i) => `<button class="emoji-cat-btn${i === 0 ? ' active' : ''}" data-cat="${cat}">${emojiCategories[cat][0]}</button>`).join('');
    cats.querySelectorAll('.emoji-cat-btn').forEach(b => b.addEventListener('click', () => {
        cats.querySelectorAll('.emoji-cat-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        renderEmojiSection(b.dataset.cat);
    }));
    renderEmojiSection('Часто');
}
function renderEmojiSection(cat) {
    const scroll = document.getElementById('emojiScroll');
    if (!scroll) return;
    const emojis = emojiCategories[cat] || [];
    scroll.innerHTML = `<div class="emoji-section-title">${cat}</div><div class="emoji-grid">${emojis.map(e => `<button class="emoji-item" data-emoji="${e}">${emojiImg(e)}</button>`).join('')}</div>`;
    scroll.querySelectorAll('.emoji-item').forEach(b => b.addEventListener('click', () => {
        const input = document.getElementById('messageInput');
        if (input) { input.value += b.dataset.emoji; input.focus(); }
    }));
}
const emojiBtn = document.getElementById('emojiBtn');
if (emojiBtn) emojiBtn.addEventListener('click', () => { sound.play('click'); renderEmojiPicker(); openModal('emojiModal'); });
const emojiModalSearch = document.getElementById('emojiModalSearch');
if (emojiModalSearch) {
    emojiModalSearch.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        if (!q) { renderEmojiSection('Часто'); return; }
        const allEmojis = Object.values(emojiCategories).flat();
        const filtered = allEmojis.filter(e => e.includes(q) || e.toLowerCase().includes(q));
        const scroll = document.getElementById('emojiScroll');
        if (!scroll) return;
        scroll.innerHTML = `<div class="emoji-section-title">Найдено: ${filtered.length}</div><div class="emoji-grid">${filtered.slice(0, 60).map(e => `<button class="emoji-item" data-emoji="${e}">${emojiImg(e)}</button>`).join('')}</div>`;
        scroll.querySelectorAll('.emoji-item').forEach(b => b.addEventListener('click', () => { 
            const input = document.getElementById('messageInput');
            if (input) input.value += b.dataset.emoji; 
        }));
    });
}

/* ============ STICKERS ============ */
const stickerBtn = document.getElementById('stickerBtn');
if (stickerBtn) {
    stickerBtn.addEventListener('click', () => {
        sound.play('click');
        const grid = document.getElementById('stickerGrid');
        if (!grid) return;
        grid.innerHTML = stickers.map(s => `<div class="sticker-item" data-sticker="${s}">${emojiImg(s)}</div>`).join('');
        grid.querySelectorAll('.sticker-item').forEach(el => el.addEventListener('click', () => {
            const conv = state.convs.find(c => c.id === state.activeConv);
            if (!conv || !canWrite(conv)) return;
            conv.messages.push({ id: Date.now() + Math.random(), author: state.profile.nickname, time: Date.now(), own: true, sticker: el.dataset.sticker, reactions: [], globalRole: state.role, replyTo: null });
            saveToStorage(); renderMessages(); renderConvList();
            closeModal('stickerModal'); sound.play('send');
        }));
        openModal('stickerModal');
    });
}

/* ============ FILES ============ */
const attachBtn = document.getElementById('attachBtn');
const fileInput = document.getElementById('fileInput');
if (attachBtn && fileInput) {
    attachBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const conv = state.convs.find(c => c.id === state.activeConv);
        if (!conv || !canWrite(conv)) return;
        if (file.size > 5 * 1024 * 1024) { showNotif('Ошибка', 'Файл больше 5 МБ'); return; }
        const reader = new FileReader();
        reader.onload = () => {
            conv.messages.push({ id: Date.now() + Math.random(), author: state.profile.nickname, time: Date.now(), own: true, file: { name: file.name, type: file.type, data: reader.result }, reactions: [], globalRole: state.role, replyTo: null });
            saveToStorage(); renderMessages(); renderConvList(); sound.play('send');
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    });
}

/* ============ VOICE ============ */
const voiceBtn = document.getElementById('voiceBtn');
if (voiceBtn) {
    voiceBtn.addEventListener('click', async () => {
        if (state.recording) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const rec = new MediaRecorder(stream);
            const chunks = [];
            rec.ondataavailable = e => chunks.push(e.data);
            rec.onstop = () => {
                stream.getTracks().forEach(t => t.stop());
                const blob = new Blob(chunks, { type: 'audio/webm' });
                state.voiceBlob = blob;
                const reader = new FileReader();
                reader.onload = () => {
                    const conv = state.convs.find(c => c.id === state.activeConv);
                    if (!conv) return;
                    conv.messages.push({ id: Date.now() + Math.random(), author: state.profile.nickname, time: Date.now(), own: true, voice: reader.result, reactions: [], globalRole: state.role, replyTo: null });
                    saveToStorage(); renderMessages(); renderConvList();
                    const vr = document.getElementById('voiceRecording'); if (vr) vr.style.display = 'none';
                    clearInterval(state.recordTimer);
                    sound.play('send');
                };
                reader.readAsDataURL(blob);
            };
            state.recording = rec;
            state.recordStart = Date.now();
            rec.start();
            const vr = document.getElementById('voiceRecording'); if (vr) vr.style.display = 'flex';
            state.recordTimer = setInterval(() => {
                const sec = Math.floor((Date.now() - state.recordStart) / 1000);
                const rt = document.getElementById('recTime'); if (rt) rt.textContent = formatDuration(sec);
                if (sec > 60) { rec.stop(); state.recording = null; }
            }, 200);
        } catch (e) { showNotif('Ошибка', 'Нет доступа к микрофону'); }
    });
}
const cancelVoice = document.getElementById('cancelVoice');
if (cancelVoice) {
    cancelVoice.addEventListener('click', () => {
        if (state.recording) { state.recording.stop(); state.recording = null; }
        const vr = document.getElementById('voiceRecording'); if (vr) vr.style.display = 'none';
        clearInterval(state.recordTimer);
    });
}
const sendVoice = document.getElementById('sendVoice');
if (sendVoice) sendVoice.addEventListener('click', () => { if (state.recording) state.recording.stop(); state.recording = null; });

/* ============ MENTIONS @ ============ */
const messageInput = document.getElementById('messageInput');
if (messageInput) {
    messageInput.addEventListener('input', (e) => {
        const val = e.target.value;
        const cursor = e.target.selectionStart;
        const before = val.slice(0, cursor);
        const m = before.match(/@([a-zA-Z0-9_]*)$/);
        const popup = document.getElementById('mentionsPopup');
        if (!popup) return;
        if (m) {
            const query = m[1].toLowerCase();
            const conv = state.convs.find(c => c.id === state.activeConv);
            if (conv && conv.members) {
                const matches = conv.members.filter(mem => mem.login !== state.login && mem.login.toLowerCase().includes(query)).slice(0, 5);
                if (matches.length) {
                    popup.style.display = 'block';
                    popup.innerHTML = matches.map(mem => `<div class="mention-item" data-login="${mem.login}"><div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--blue));display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;font-weight:700;">${initials(mem.name)}</div><span>${escapeHtml(mem.name)} <small style="color:var(--text-muted)">@${mem.login}</small></span></div>`).join('');
                    popup.querySelectorAll('.mention-item').forEach(item => item.addEventListener('click', () => {
                        const login = item.dataset.login;
                        e.target.value = before.replace(/@[a-zA-Z0-9_]*$/, '@' + login + ' ') + val.slice(cursor);
                        popup.style.display = 'none';
                        e.target.focus();
                    }));
                    return;
                }
            }
        }
        popup.style.display = 'none';
    });
}

/* ============ SMART REPLIES ============ */
function updateSmartReplies() {
    const conv = state.convs.find(c => c.id === state.activeConv);
    const sr = document.getElementById('smartReplies');
    if (!sr) return;
    if (!conv || !conv.messages.length) { sr.style.display = 'none'; return; }
    const last = conv.messages[conv.messages.length - 1];
    if (last.own) { sr.style.display = 'none'; return; }
    const text = (last.text || '').toLowerCase();
    let suggestions = smartReplyPool.default;
    if (/привет|хай|здрав|добр/.test(text)) suggestions = smartReplyPool.greeting;
    else if (/спасиб|благодар/.test(text)) suggestions = smartReplyPool.thanks;
    else if (/ок|хорошо|ладно|понял/.test(text)) suggestions = smartReplyPool.ok;
    else if (/\?$|как|что|где|когда|почему/.test(text)) suggestions = smartReplyPool.question;
    else if (/да|конечно|соглас/.test(text)) suggestions = smartReplyPool.yes;
    else if (/нет|не/.test(text)) suggestions = smartReplyPool.no;
    sr.innerHTML = suggestions.slice(0, 4).map(s => `<button class="smart-reply-btn">${escapeHtml(s)}</button>`).join('');
    sr.style.display = 'flex';
    sr.querySelectorAll('.smart-reply-btn').forEach(b => b.addEventListener('click', () => {
        const input = document.getElementById('messageInput');
        if (input) input.value = b.textContent;
        sendMessage();
        sr.style.display = 'none';
    }));
}

/* ============ KEYBOARD ============ */
if (messageInput) {
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
}
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        const mp = document.getElementById('mentionsPopup'); if (mp) mp.style.display = 'none';
        if (state.editingMsg) { 
            state.editingMsg = null; 
            const mi = document.getElementById('messageInput'); if (mi) mi.value = ''; 
            const rb = document.getElementById('replyBar'); if (rb) rb.classList.remove('active'); 
        }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openModal('searchModal');
        setTimeout(() => { const si = document.getElementById('msgSearchInput'); if (si) si.focus(); }, 100);
    }
    if (e.key === 'ArrowUp' && document.activeElement.id === 'messageInput' && !document.getElementById('messageInput').value.trim()) {
        e.preventDefault();
        const conv = state.convs.find(c => c.id === state.activeConv);
        if (!conv) return;
        const lastOwn = [...conv.messages].reverse().find(m => m.own && m.text);
        if (lastOwn) {
            state.editingMsg = lastOwn;
            const mi = document.getElementById('messageInput');
            if (mi) { mi.value = lastOwn.text; mi.focus(); }
        }
    }
    state.lastActivity = Date.now();
});

/* ============ FRIENDS ============ */
function renderFriends() {
    const grid = document.getElementById('usersGrid');
    if (!grid) return;
    const users = getAllUsersList().filter(u => u.login !== state.login);
    if (!users.length) { grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Пока нет других пользователей</div>'; return; }
    grid.innerHTML = users.map(u => `<div class="user-row" data-login="${u.login}"><div class="user-row-avatar">${initials(u.nickname)}</div><div class="user-row-info"><div class="user-row-name">${escapeHtml(u.nickname)} ${getGlobalRoleBadge(u.role)}</div><div class="user-row-login">@${u.login}</div></div><div class="user-row-actions"><button data-action="dm" data-login="${u.login}" class="primary">Написать</button></div></div>`).join('');
    grid.querySelectorAll('.user-row-actions button').forEach(b => b.addEventListener('click', () => {
        if (b.dataset.action === 'dm') openOrCreateDM(b.dataset.login);
    }));
    grid.querySelectorAll('.user-row-avatar').forEach(a => a.addEventListener('click', () => openUserProfile(a.parentElement.dataset.login)));
}
const usersSearch = document.getElementById('usersSearch');
if (usersSearch) {
    usersSearch.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('.user-row').forEach(row => { row.style.display = row.dataset.login.includes(q) ? '' : 'none'; });
    });
}

/* ============ DM ============ */
function openOrCreateDM(login) {
    const users = getUsers();
    if (!users[login]) return;
    const dmId = 'dm_' + [state.login, login].sort().join('_');
    let conv = state.convs.find(c => c.id === dmId);
    if (!conv) {
        conv = {
            id: dmId, name: users[login].nickname, description: 'Личные сообщения',
            type: 'dm', color: avatarColors[Math.floor(Math.random() * avatarColors.length)],
            messages: [], unread: 0, archived: false, muted: false,
            creatorLogin: state.login,
            members: [{ login: state.login, name: state.profile.nickname, role: 'creator' }, { login, name: users[login].nickname, role: 'member' }]
        };
        state.convs.unshift(conv);
        saveToStorage(); renderConvList();
    }
    closeModal('userProfileModal');
    const chatsTab = document.querySelector('.nav-item[data-tab="chats"]'); if (chatsTab) chatsTab.click();
    setTimeout(() => openConv(conv.id), 200);
}

/* ============ USER PROFILE ============ */
function openUserProfile(login) {
    if (!login) return;
    const users = getUsers();
    const user = users[login];
    if (!user) return;
    const p = user.profile || {};
    const view = document.getElementById('userProfileView');
    if (!view) return;
    let avatarHtml = '';
    if (p.avatarPhoto) avatarHtml = `<img class="avatar-photo" src="${p.avatarPhoto}">`;
    else if (p.avatarEmoji) avatarHtml = emojiImg(p.avatarEmoji, 'xxl');
    else avatarHtml = initials(user.nickname);
    view.innerHTML = `<div class="avatar-big">${avatarHtml}</div><h3>${escapeHtml(user.nickname)} ${getGlobalRoleBadge(user.role)}</h3><div class="handle">@${login}</div>${p.bio ? `<div class="bio">"${escapeHtml(p.bio)}"</div>` : ''}<div class="actions">${login !== state.login ? `<button class="btn-primary small" id="startDMBtn">Написать</button>` : '<div style="color:var(--text-muted);font-size:13px;">Это вы</div>'}</div>`;
    if (login !== state.login) {
        const sdb = document.getElementById('startDMBtn'); if (sdb) sdb.onclick = () => openOrCreateDM(login);
    }
    openModal('userProfileModal');
}

/* ============ PIN SETTINGS ============ */
const pinSettingsBtn = document.getElementById('pinSettingsBtn');
if (pinSettingsBtn) {
    pinSettingsBtn.addEventListener('click', () => {
        const pi = document.getElementById('pinInput'); if (pi) pi.value = state.pin || '';
        const pa = document.getElementById('pinAutolock'); if (pa) pa.value = state.pinAutolock || 0;
        openModal('pinModal');
    });
}
const savePinBtn = document.getElementById('savePinBtn');
if (savePinBtn) {
    savePinBtn.addEventListener('click', () => {
        const pi = document.getElementById('pinInput');
        const p = pi ? pi.value : '';
        if (p && !/^\d{4,8}$/.test(p)) { showNotif('Ошибка', 'PIN: 4-8 цифр'); return; }
        state.pin = p || null;
        const pa = document.getElementById('pinAutolock');
        state.pinAutolock = pa ? parseInt(pa.value) || 0 : 0;
        saveToStorage();
        closeModal('pinModal');
        showNotif(state.pin ? 'PIN установлен' : 'PIN отключён', '');
        sound.play('success');
    });
}

/* ============ NOTIF SETTINGS ============ */
const notifSettingsBtn = document.getElementById('notifSettingsBtn');
if (notifSettingsBtn) {
    notifSettingsBtn.addEventListener('click', () => {
        document.querySelectorAll('input[name="notifMode"]').forEach(r => r.checked = r.value === state.notifMode);
        openModal('notifModal');
    });
}
const saveNotifBtn = document.getElementById('saveNotifBtn');
if (saveNotifBtn) {
    saveNotifBtn.addEventListener('click', () => {
        const checked = document.querySelector('input[name="notifMode"]:checked');
        if (!checked) return;
        const mode = checked.value;
        state.notifMode = mode;
        localStorage.setItem('lunar_notif_mode', mode);
        if (mode !== 'off') requestNotificationPermission();
        closeModal('notifModal');
        showNotif('Сохранено', 'Режим: ' + (mode === 'all' ? 'все' : mode === 'mentions' ? 'упоминания' : 'выкл'));
    });
}

/* ============ WALLPAPER ============ */
const wallpaperBtn = document.getElementById('wallpaperBtn');
if (wallpaperBtn) {
    wallpaperBtn.addEventListener('click', () => {
        const grid = document.getElementById('wallpaperGrid');
        if (!grid) return;
        grid.innerHTML = `<div class="wallpaper-choice wallpaper-none${!state.chatWallpapers[state.activeConv] ? ' selected' : ''}" data-wp="">✕</div>` +
            wallpapers.filter(w => w).map(w => `<div class="wallpaper-choice${state.chatWallpapers[state.activeConv] === w ? ' selected' : ''}" data-wp="${w}" style="background:${w}"></div>`).join('');
        grid.querySelectorAll('.wallpaper-choice').forEach(el => el.addEventListener('click', () => {
            const wp = el.dataset.wp;
            if (wp) state.chatWallpapers[state.activeConv] = wp;
            else delete state.chatWallpapers[state.activeConv];
            saveToStorage();
            applyChatWallpaper(state.activeConv);
            grid.querySelectorAll('.wallpaper-choice').forEach(x => x.classList.remove('selected'));
            el.classList.add('selected');
            sound.play('click');
        }));
        openModal('wallpaperModal');
    });
}
const wallpaperInput = document.getElementById('wallpaperInput');
if (wallpaperInput) {
    wallpaperInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const dataUrl = await compressPhoto(file, 1024);
            state.chatWallpapers[state.activeConv] = `url(${dataUrl}) center/cover`;
            saveToStorage();
            applyChatWallpaper(state.activeConv);
            closeModal('wallpaperModal');
            showNotif('Обои установлены', '');
        } catch (err) { showNotif('Ошибка', err.message); }
    });
}

/* ============ SOUND ============ */
const soundSettingsBtn = document.getElementById('soundSettingsBtn');
if (soundSettingsBtn) {
    soundSettingsBtn.addEventListener('click', () => {
        const sel = document.getElementById('notifSoundSelect'); if (sel) sel.value = sound.notifSound;
        openModal('soundModal');
    });
}
const saveSoundBtn = document.getElementById('saveSoundBtn');
if (saveSoundBtn) {
    saveSoundBtn.addEventListener('click', () => {
        const sel = document.getElementById('notifSoundSelect'); if (!sel) return;
        sound.notifSound = sel.value;
        localStorage.setItem('lunar_notif_sound', sound.notifSound);
        closeModal('soundModal'); showNotif('Сохранено', '');
        sound.play('notif');
    });
}

/* ============ ACCOUNT ============ */
const accountSettingsBtn = document.getElementById('accountSettingsBtn');
if (accountSettingsBtn) {
    accountSettingsBtn.addEventListener('click', () => {
        const info = document.getElementById('accountInfo');
        if (info) info.innerHTML = `<b>@${state.login}</b><br>${escapeHtml(state.profile.nickname)}<br>Роль: ${state.role}<br>Сообщений: ${state.totalMessages}<br>Чатов: ${state.convs.length}`;
        openModal('accountModal');
    });
}
const exportDataBtn = document.getElementById('exportDataBtn');
if (exportDataBtn) {
    exportDataBtn.addEventListener('click', () => {
        const data = { login: state.login, profile: state.profile, role: state.role, convs: state.convs, totalMessages: state.totalMessages, exportedAt: Date.now() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `lunar_${state.login}_${Date.now()}.json`;
        a.click();
        showNotif('Экспорт', 'Файл скачан');
    });
}
const importDataBtn = document.getElementById('importDataBtn');
const importFileInput = document.getElementById('importFileInput');
if (importDataBtn && importFileInput) {
    importDataBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                if (data.convs) state.convs = data.convs;
                if (data.profile) state.profile = data.profile;
                saveToStorage(); renderConvList(); updateProfileUI();
                closeModal('accountModal');
                showNotif('Импорт', 'Данные загружены');
            } catch (err) { showNotif('Ошибка', 'Неверный формат файла'); }
        };
        reader.readAsText(file);
        e.target.value = '';
    });
}
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', () => {
        if (!confirm('Удалить аккаунт и ВСЕ данные? Это необратимо.')) return;
        if (!confirm('Точно уверены?')) return;
        const users = getUsers();
        delete users[state.login];
        saveUsers(users);
        localStorage.removeItem('lunar_session');
        localStorage.removeItem('lunar_contacts');
        localStorage.removeItem('lunar_stats');
        localStorage.removeItem('lunar_drafts');
        localStorage.removeItem('lunar_wallpapers');
        localStorage.removeItem('lunar_pin');
        location.reload();
    });
}

/* ============ PROFILE CUSTOMIZE ============ */
const editProfileBtn = document.getElementById('editProfileBtn');
if (editProfileBtn) editProfileBtn.addEventListener('click', () => { sound.play('click'); renderCustomizeModal(); openModal('customizeModal'); });
function renderCustomizeModal() {
    state.tempProfile = { ...state.profile };
    updatePreview();
    const cn = document.getElementById('customNickname'); if (cn) cn.value = state.tempProfile.nickname;
    const nc = document.getElementById('nicknameCount'); if (nc) nc.textContent = state.tempProfile.nickname.length;
    const cb = document.getElementById('customBio'); if (cb) cb.value = state.tempProfile.bio || '';
    const bc = document.getElementById('bioCount'); if (bc) bc.textContent = (state.tempProfile.bio || '').length;
    document.querySelectorAll('.avatar-type-switch button').forEach(b => b.classList.toggle('active', b.dataset.avatarType === state.tempProfile.avatarType));
    const aps = document.getElementById('avatarPhotoSection'); if (aps) aps.style.display = state.tempProfile.avatarType === 'photo' ? '' : 'none';
    const aes = document.getElementById('avatarEmojiSection'); if (aes) aes.style.display = state.tempProfile.avatarType === 'emoji' ? '' : 'none';
    const acs = document.getElementById('avatarColorSection'); if (acs) acs.style.display = state.tempProfile.avatarType === 'color' ? '' : 'none';
    if (state.tempProfile.avatarPhoto) {
        const ppb = document.getElementById('photoPreviewBox'); if (ppb) ppb.style.display = 'flex';
        const puz = document.getElementById('photoUploadZone'); if (puz) puz.style.display = 'none';
        const ppi = document.getElementById('photoPreviewImg'); if (ppi) ppi.src = state.tempProfile.avatarPhoto;
        const pfn = document.getElementById('photoFilename'); if (pfn) pfn.textContent = state.tempProfile.avatarPhotoName || 'avatar.jpg';
        const pfs = document.getElementById('photoFilesize'); if (pfs) pfs.textContent = formatFileSize(state.tempProfile.avatarPhotoSize || 0);
    } else {
        const ppb = document.getElementById('photoPreviewBox'); if (ppb) ppb.style.display = 'none';
        const puz = document.getElementById('photoUploadZone'); if (puz) puz.style.display = '';
    }
    const ep = document.getElementById('emojiPicker');
    if (ep) {
        ep.innerHTML = avatarEmojis.map(e => `<button class="emoji-choice${e === state.tempProfile.avatarEmoji ? ' selected' : ''}" data-emoji="${e}">${emojiImg(e)}</button>`).join('');
        ep.querySelectorAll('.emoji-choice').forEach(el => el.addEventListener('click', () => {
            ep.querySelectorAll('.emoji-choice').forEach(x => x.classList.remove('selected'));
            el.classList.add('selected');
            state.tempProfile.avatarEmoji = el.dataset.emoji;
            updatePreview(); sound.play('click');
        }));
    }
    const cg = document.getElementById('avatarColorGrid');
    if (cg) {
        cg.innerHTML = avatarColors.map((c, i) => `<div class="color-swatch${i === state.tempProfile.avatarColor ? ' selected' : ''}" data-idx="${i}" style="background: linear-gradient(135deg, ${c[0]}, ${c[1]})"></div>`).join('');
        cg.querySelectorAll('.color-swatch').forEach(el => el.addEventListener('click', () => {
            cg.querySelectorAll('.color-swatch').forEach(x => x.classList.remove('selected'));
            el.classList.add('selected');
            state.tempProfile.avatarColor = parseInt(el.dataset.idx);
            updatePreview(); sound.play('click');
        }));
    }
    const bg = document.getElementById('bannerGrid');
    if (bg) {
        bg.innerHTML = banners.map(b => `<div class="banner-choice${b.id === state.tempProfile.banner ? ' selected' : ''}" data-banner="${b.id}" style="background: ${b.css}"></div>`).join('');
        bg.querySelectorAll('.banner-choice').forEach(el => el.addEventListener('click', () => {
            bg.querySelectorAll('.banner-choice').forEach(x => x.classList.remove('selected'));
            el.classList.add('selected');
            state.tempProfile.banner = el.dataset.banner;
            updatePreview(); sound.play('click');
        }));
    }
    const fg = document.getElementById('frameGrid');
    if (fg) {
        fg.innerHTML = frames.map(f => `<div class="frame-choice${f.id === state.tempProfile.frame ? ' selected' : ''}" data-frame="${f.id}"><div class="frame-circle ${f.class}"></div></div>`).join('');
        fg.querySelectorAll('.frame-choice').forEach(el => el.addEventListener('click', () => {
            fg.querySelectorAll('.frame-choice').forEach(x => x.classList.remove('selected'));
            el.classList.add('selected');
            state.tempProfile.frame = el.dataset.frame;
            updatePreview(); sound.play('click');
        }));
    }
}
function updatePreview() {
    const p = state.tempProfile;
    const pn = document.getElementById('previewName'); if (pn) pn.textContent = p.nickname || 'Никнейм';
    const pb = document.getElementById('previewBio'); if (pb) pb.textContent = p.bio || '';
    const b = banners.find(x => x.id === p.banner);
    const pba = document.getElementById('previewBanner'); if (pba) pba.style.background = b ? b.css : banners[0].css;
    const a = document.getElementById('previewAvatar');
    if (!a) return;
    if (p.avatarType === 'photo' && p.avatarPhoto) { a.innerHTML = `<img class="avatar-photo" src="${p.avatarPhoto}">`; a.style.background = 'var(--bg-tertiary)'; }
    else if (p.avatarType === 'emoji') { a.innerHTML = `<div class="avatar-emoji-wrap">${emojiImg(p.avatarEmoji)}</div>`; a.style.background = 'linear-gradient(135deg,#38bdf8,#60a5fa)'; }
    else { a.textContent = (p.nickname || 'A').charAt(0).toUpperCase(); const c = avatarColors[p.avatarColor]; a.style.background = `linear-gradient(135deg,${c[0]},${c[1]})`; }
    const fc = frames.find(f => f.id === p.frame);
    a.className = 'preview-avatar ' + (fc ? fc.class : 'avatar-frame-none');
}
const customNickname = document.getElementById('customNickname');
if (customNickname) {
    customNickname.addEventListener('input', (e) => {
        const nc = document.getElementById('nicknameCount'); if (nc) nc.textContent = e.target.value.length;
        state.tempProfile.nickname = e.target.value; updatePreview();
    });
}
const customBio = document.getElementById('customBio');
if (customBio) {
    customBio.addEventListener('input', (e) => {
        const bc = document.getElementById('bioCount'); if (bc) bc.textContent = e.target.value.length;
        state.tempProfile.bio = e.target.value; updatePreview();
    });
}
document.querySelectorAll('.avatar-type-switch button').forEach(btn => btn.addEventListener('click', () => {
    sound.play('click');
    document.querySelectorAll('.avatar-type-switch button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.tempProfile.avatarType = btn.dataset.avatarType;
    const aps = document.getElementById('avatarPhotoSection'); if (aps) aps.style.display = state.tempProfile.avatarType === 'photo' ? '' : 'none';
    const aes = document.getElementById('avatarEmojiSection'); if (aes) aes.style.display = state.tempProfile.avatarType === 'emoji' ? '' : 'none';
    const acs = document.getElementById('avatarColorSection'); if (acs) acs.style.display = state.tempProfile.avatarType === 'color' ? '' : 'none';
    updatePreview();
}));
const puz = document.getElementById('photoUploadZone');
const pinp = document.getElementById('photoInput');
if (puz && pinp) {
    puz.addEventListener('click', () => pinp.click());
    puz.addEventListener('dragover', (e) => { e.preventDefault(); puz.classList.add('dragover'); });
    puz.addEventListener('dragleave', () => puz.classList.remove('dragover'));
    puz.addEventListener('drop', async (e) => { e.preventDefault(); puz.classList.remove('dragover'); if (e.dataTransfer.files[0]) await handlePhotoUpload(e.dataTransfer.files[0]); });
    pinp.addEventListener('change', async (e) => { if (e.target.files[0]) await handlePhotoUpload(e.target.files[0]); e.target.value = ''; });
}
async function handlePhotoUpload(file) {
    try {
        if (puz) puz.innerHTML = '<p>Обработка...</p>';
        const dataUrl = await compressPhoto(file, 256);
        state.tempProfile.avatarPhoto = dataUrl;
        state.tempProfile.avatarPhotoName = file.name;
        state.tempProfile.avatarPhotoSize = file.size;
        state.tempProfile.avatarType = 'photo';
        const aps = document.getElementById('avatarPhotoSection'); if (aps) aps.style.display = '';
        const ppb = document.getElementById('photoPreviewBox'); if (ppb) ppb.style.display = 'flex';
        const ppi = document.getElementById('photoPreviewImg'); if (ppi) ppi.src = dataUrl;
        const pfn = document.getElementById('photoFilename'); if (pfn) pfn.textContent = file.name;
        const pfs = document.getElementById('photoFilesize'); if (pfs) pfs.textContent = formatFileSize(file.size);
        if (puz) {
            puz.style.display = 'none';
            puz.innerHTML = '<p>Нажмите или перетащите фото</p><div class="hint">PNG, JPG до 5 МБ</div>';
        }
        document.querySelectorAll('.avatar-type-switch button').forEach(b => b.classList.toggle('active', b.dataset.avatarType === 'photo'));
        updatePreview(); sound.play('photo');
    } catch (e) { showNotif('Ошибка', e.message); }
}
const photoRemoveBtn = document.getElementById('photoRemoveBtn');
if (photoRemoveBtn) {
    photoRemoveBtn.addEventListener('click', () => {
        state.tempProfile.avatarPhoto = null;
        state.tempProfile.avatarType = 'emoji';
        document.querySelectorAll('.avatar-type-switch button').forEach(b => b.classList.toggle('active', b.dataset.avatarType === 'emoji'));
        const aps = document.getElementById('avatarPhotoSection'); if (aps) aps.style.display = 'none';
        const aes = document.getElementById('avatarEmojiSection'); if (aes) aes.style.display = '';
        const ppb = document.getElementById('photoPreviewBox'); if (ppb) ppb.style.display = 'none';
        const puz = document.getElementById('photoUploadZone'); if (puz) puz.style.display = '';
        updatePreview();
    });
}
const saveCustomizationBtn = document.getElementById('saveCustomizationBtn');
if (saveCustomizationBtn) {
    saveCustomizationBtn.addEventListener('click', () => {
        const n = state.tempProfile.nickname.trim();
        if (!n || n.length < 2) { showNotif('Ошибка', 'Никнейм 2+ символа'); return; }
        state.profile = { ...state.tempProfile, nickname: n };
        state.user = n;
        updateProfileUI(); saveToStorage(); closeModal('customizeModal');
        sound.play('success');
        if (state.activeConv) renderMessages();
        renderConvList();
    });
}
const qpi = document.createElement('input');
qpi.type = 'file'; qpi.accept = 'image/*'; qpi.style.display = 'none';
document.body.appendChild(qpi);
const quickUploadPhotoBtn = document.getElementById('quickUploadPhotoBtn');
if (quickUploadPhotoBtn) quickUploadPhotoBtn.addEventListener('click', () => qpi.click());
qpi.addEventListener('change', async (e) => {
    if (!e.target.files[0]) return;
    try {
        state.profile.avatarPhoto = await compressPhoto(e.target.files[0], 256);
        state.profile.avatarType = 'photo';
        state.profile.avatarPhotoName = e.target.files[0].name;
        state.profile.avatarPhotoSize = e.target.files[0].size;
        updateProfileUI(); saveToStorage(); sound.play('photo');
    } catch (err) { showNotif('Ошибка', err.message); }
    e.target.value = '';
});
const quickRemovePhotoBtn = document.getElementById('quickRemovePhotoBtn');
if (quickRemovePhotoBtn) {
    quickRemovePhotoBtn.addEventListener('click', () => {
        state.profile.avatarPhoto = null;
        state.profile.avatarType = 'emoji';
        updateProfileUI(); saveToStorage();
    });
}

/* ============ FEED ============ */
const newPostBtn = document.getElementById('newPostBtn');
if (newPostBtn) newPostBtn.addEventListener('click', () => { const np = document.getElementById('newPost'); if (np) np.style.display = ''; });
const cancelPost = document.getElementById('cancelPost');
if (cancelPost) cancelPost.addEventListener('click', () => { const np = document.getElementById('newPost'); if (np) np.style.display = 'none'; const pc = document.getElementById('postContent'); if (pc) pc.value = ''; });
const publishPost = document.getElementById('publishPost');
if (publishPost) {
    publishPost.addEventListener('click', () => {
        const pc = document.getElementById('postContent');
        const text = pc ? pc.value.trim() : '';
        if (!text) return;
        state.totalPosts++;
        let ab = 'linear-gradient(135deg,#38bdf8,#60a5fa)';
        if (state.profile.avatarType === 'color') ab = `linear-gradient(135deg,${avatarColors[state.profile.avatarColor][0]},${avatarColors[state.profile.avatarColor][1]})`;
        const post = { id: Date.now(), author: state.profile.nickname, login: state.login, text, time: Date.now(), likes: 0, liked: false, comments: [] };
        const posts = JSON.parse(localStorage.getItem('lunar_posts') || '[]');
        posts.unshift(post);
        localStorage.setItem('lunar_posts', JSON.stringify(posts));
        if (pc) pc.value = '';
        const np = document.getElementById('newPost'); if (np) np.style.display = 'none';
        renderPosts(); sound.play('send');
    });
}
function renderPosts() {
    const postsEl = document.getElementById('posts');
    if (!postsEl) return;
    const posts = JSON.parse(localStorage.getItem('lunar_posts') || '[]');
    if (!posts.length) { postsEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Нет постов</div>'; return; }
    postsEl.innerHTML = posts.map(p => `<div class="post" data-post="${p.id}"><div class="post-header"><div class="post-avatar" data-user="${p.login}">${initials(p.author)}</div><div class="post-meta"><div class="post-author">${escapeHtml(p.author)}</div><div class="post-time">${formatTime(p.time)}</div></div></div><div class="post-content">${escapeHtml(p.text)}</div><div class="post-actions"><button class="post-action like-btn${p.liked ? ' liked' : ''}" data-post="${p.id}">${emojiImg('❤️')} <span>${p.likes || 0}</span></button><button class="post-action comment-btn" data-post="${p.id}">💬 <span>${(p.comments || []).length}</span></button></div></div>`).join('');
    postsEl.querySelectorAll('.like-btn').forEach(b => b.addEventListener('click', () => {
        const posts = JSON.parse(localStorage.getItem('lunar_posts') || '[]');
        const p = posts.find(x => x.id == b.dataset.post);
        if (p) { p.liked = !p.liked; p.likes = (p.likes || 0) + (p.liked ? 1 : -1); localStorage.setItem('lunar_posts', JSON.stringify(posts)); renderPosts(); sound.play('like'); }
    }));
    postsEl.querySelectorAll('.comment-btn').forEach(b => b.addEventListener('click', () => openComments(b.dataset.post)));
    postsEl.querySelectorAll('.post-avatar').forEach(a => a.addEventListener('click', () => openUserProfile(a.dataset.user)));
}
function openComments(postId) {
    state.activeCommentPost = postId;
    const posts = JSON.parse(localStorage.getItem('lunar_posts') || '[]');
    const post = posts.find(x => x.id == postId);
    if (!post) return;
    const list = document.getElementById('commentsList');
    if (!list) return;
    if (!post.comments || !post.comments.length) { list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">Пока нет комментариев</div>'; }
    else {
        list.innerHTML = post.comments.map(c => `<div class="comment-item"><div class="comment-avatar">${initials(c.author)}</div><div class="comment-body"><div class="comment-author">${escapeHtml(c.author)}</div><div class="comment-text">${escapeHtml(c.text)}</div><div class="comment-time">${formatTime(c.time)}</div></div></div>`).join('');
    }
    openModal('commentModal');
}
const sendCommentBtn = document.getElementById('sendCommentBtn');
if (sendCommentBtn) {
    sendCommentBtn.addEventListener('click', () => {
        const ci = document.getElementById('commentInput');
        const text = ci ? ci.value.trim() : '';
        if (!text) return;
        const posts = JSON.parse(localStorage.getItem('lunar_posts') || '[]');
        const post = posts.find(x => x.id == state.activeCommentPost);
        if (!post) return;
        if (!post.comments) post.comments = [];
        post.comments.push({ author: state.profile.nickname, login: state.login, text, time: Date.now() });
        localStorage.setItem('lunar_posts', JSON.stringify(posts));
        if (ci) ci.value = '';
        openComments(state.activeCommentPost);
        renderPosts(); sound.play('send');
    });
}

/* ============ ПОДАРКИ (LOGIC) ============ */
function renderGifts() {
    const grid = document.getElementById('giftsGrid');
    if (!grid) return;
    const ba = document.getElementById('balanceAmount'); if (ba) ba.textContent = state.balance;
    const oc = document.getElementById('ownedCount'); if (oc) oc.textContent = state.ownedGifts.length;
    if (state.giftTab === 'owned') {
        if (!state.ownedGifts.length) {
            grid.innerHTML = `<div class="gifts-empty" style="grid-column: 1/-1;"><div style="font-size:40px;">🎁</div><div style="font-size: 16px; font-weight: 600; color: var(--text-secondary);">Подарков пока нет</div></div>`;
            return;
        }
        grid.innerHTML = state.ownedGifts.map(g => `
            <div class="gift-item rarity-${g.rarity}" style="cursor: default;">
                <img src="${g.img}" alt="${g.name}" style="width:64px;height:64px;object-fit:contain;">
                <div class="g-name">${escapeHtml(g.name)}</div>
                <div class="g-collection">${escapeHtml(g.collection)}</div>
                <div class="g-rarity rarity-${g.rarity}">${rarityLabel[g.rarity]}</div>
                <div class="g-price">💎 ${g.price}</div>
                <div class="g-owned" style="background: var(--emerald);">#${g.number}</div>
            </div>`).join('');
        return;
    }
    grid.innerHTML = giftCatalog.map(g => `
        <div class="gift-item rarity-${g.rarity}" data-gift-id="${g.id}">
            <img src="${g.img}" alt="${g.name}" style="width:64px;height:64px;object-fit:contain;margin-bottom:8px;">
            <div class="g-name">${escapeHtml(g.name)}</div>
            <div class="g-collection">${escapeHtml(g.collection)}</div>
            <div class="g-rarity rarity-${g.rarity}">${rarityLabel[g.rarity]}</div>
            <div class="g-price">💎 ${g.price}</div>
        </div>`).join('');
    grid.querySelectorAll('.gift-item').forEach(el => {
        el.addEventListener('click', () => {
            const gift = giftCatalog.find(g => g.id === el.dataset.giftId);
            if (gift) openSendGiftModal(gift);
        });
    });
}
document.querySelectorAll('.gifts-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        sound.play('click');
        document.querySelectorAll('.gifts-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.giftTab = tab.dataset.giftTab;
        renderGifts();
    });
});
const topupBtn = document.getElementById('topupBtn');
if (topupBtn) topupBtn.addEventListener('click', () => { sound.play('click'); openModal('topupModal'); });
document.querySelectorAll('.topup-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const amount = parseInt(btn.dataset.amount);
        state.balance += amount;
        saveToStorage();
        const ba = document.getElementById('balanceAmount'); if (ba) ba.textContent = state.balance;
        const mb = document.getElementById('modalBalance'); if (mb) mb.textContent = state.balance + ' 💎';
        sound.play('success');
        showNotif('Изумруды пополнены', `+${amount} 💎`);
        closeModal('topupModal');
    });
});
function openSendGiftModal(gift) {
    if (state.balance < gift.price) {
        sound.play('error'); showNotif('Недостаточно изумрудов', `Нужно ещё ${gift.price - state.balance} 💎`); return;
    }
    state.pendingGift = gift;
    const recipientConv = state.convs.find(c => c.id === state.activeConv);
    state.giftRecipientConv = recipientConv;
    const preview = document.getElementById('giftPreview');
    if (preview) preview.innerHTML = `<img src="${gift.img}" alt="${gift.name}" style="width:100px;height:100px;object-fit:contain;"><div class="gp-name">${escapeHtml(gift.name)}</div><div class="gp-collection">${escapeHtml(gift.collection)}</div><div class="gp-rarity rarity-${gift.rarity}">${rarityLabel[gift.rarity]}</div><div class="gp-price">💎 ${gift.price}</div>`;
    const gr = document.getElementById('giftRecipient'); if (gr) gr.value = recipientConv ? recipientConv.name : 'Выберите чат';
    const gm = document.getElementById('giftMessage'); if (gm) gm.value = '';
    const mb = document.getElementById('modalBalance'); if (mb) mb.textContent = state.balance + ' 💎';
    openModal('sendGiftModal');
}
const sendGiftFromChatBtn = document.getElementById('sendGiftFromChatBtn');
if (sendGiftFromChatBtn) {
    sendGiftFromChatBtn.addEventListener('click', () => {
        if (!state.activeConv) { sound.play('error'); showNotif('Ошибка', 'Сначала откройте чат'); return; }
        sound.play('click');
        const giftsTab = document.querySelector('.nav-item[data-tab="gifts"]'); if (giftsTab) giftsTab.click();
        setTimeout(() => { showNotif('Выберите подарок', 'Нажмите на подарок'); }, 300);
    });
}
const confirmSendGiftBtn = document.getElementById('confirmSendGiftBtn');
if (confirmSendGiftBtn) {
    confirmSendGiftBtn.addEventListener('click', () => {
        const gift = state.pendingGift, conv = state.giftRecipientConv;
        if (!gift) return;
        if (!conv) { sound.play('error'); showNotif('Ошибка', 'Откройте чат'); return; }
        if (state.balance < gift.price) { sound.play('error'); showNotif('Недостаточно изумрудов', 'Пополните баланс'); return; }
        state.balance -= gift.price;
        const giftNumber = Math.floor(Math.random() * 9000) + 1000;
        const gm = document.getElementById('giftMessage');
        const giftMessage = gm ? gm.value.trim() : '';
        const giftData = { id: gift.id, name: gift.name, img: gift.img, collection: gift.collection, rarity: gift.rarity, price: gift.price, number: giftNumber };
        const msg = { id: Date.now() + Math.random(), author: state.profile.nickname, text: giftMessage, time: Date.now(), own: true, reactions: [], gift: giftData };
        conv.messages.push(msg);
        state.ownedGifts.push({ ...giftData, receivedAt: Date.now(), from: conv.name });
        state.userProfileGifts.push({ ...giftData, from: conv.name, receivedAt: Date.now() });
        saveToStorage();
        const ba = document.getElementById('balanceAmount'); if (ba) ba.textContent = state.balance;
        const sg = document.getElementById('statGifts'); if (sg) sg.textContent = state.userProfileGifts.length;
        if (gift.rarity === 'legend') { sound.play('legend'); showNotif('🎉 Легендарный подарок!', `${gift.name} → ${conv.name}`, '', true); }
        else { sound.play('gift'); showNotif('Подарок отправлен', `${gift.name} → ${conv.name}`, '', true); }
        closeModal('sendGiftModal');
        state.pendingGift = null; state.giftRecipientConv = null;
        if (state.activeConv === conv.id) renderMessages();
        renderConvList(); renderGifts(); renderProfileGifts();
        setTimeout(() => { const chatsTab = document.querySelector('.nav-item[data-tab="chats"]'); if (chatsTab) chatsTab.click(); setTimeout(() => openConv(conv.id), 150); }, 600);
    });
}
function renderProfileGifts() {
    const container = document.getElementById('profileGifts');
    if (!container) return;
    const sg = document.getElementById('statGifts'); if (sg) sg.textContent = state.userProfileGifts.length;
    const pb = document.getElementById('profileBalance'); if (pb) pb.textContent = state.balance;
    if (!state.userProfileGifts.length) {
        container.innerHTML = '<div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 20px; grid-column: 1/-1;">Пока нет подарков</div>';
        return;
    }
    container.innerHTML = state.userProfileGifts.slice(-12).map(g => `
        <div style="background: linear-gradient(160deg, #1a2235, #0f172a); border: 1px solid var(--border); border-radius: 12px; padding: 10px 6px; text-align: center; ${g.rarity === 'legend' ? 'border-color: #fbbf24;' : ''}">
            <img src="${g.img}" alt="${g.name}" style="width:40px;height:40px;object-fit:contain;margin-bottom:4px;">
            <div style="font-size: 11px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(g.name)}</div>
            <div style="font-size: 9px; color: var(--text-muted); font-family: monospace;">#${g.number}</div>
        </div>`).join('');
}

/* ============ MULTI ACCOUNTS ============ */
function renderSavedAccounts() {
    const container = document.getElementById('savedAccounts');
    if (!container) return;
    const accounts = JSON.parse(localStorage.getItem('lunar_multi_accounts') || '[]');
    if (!accounts.length) { container.innerHTML = ''; return; }
    container.innerHTML = accounts.map(login => {
        const users = getUsers();
        const user = users[login];
        if (!user) return '';
        return `<div class="saved-account-row" data-login="${login}"><div class="saved-account-avatar">${initials(user.nickname)}</div><div class="saved-account-name">${escapeHtml(user.nickname)}</div><span class="remove" data-remove="${login}">×</span></div>`;
    }).join('');
    container.querySelectorAll('.saved-account-row').forEach(row => row.addEventListener('click', (e) => {
        if (e.target.dataset.remove) {
            const accounts = JSON.parse(localStorage.getItem('lunar_multi_accounts') || '[]').filter(l => l !== e.target.dataset.remove);
            localStorage.setItem('lunar_multi_accounts', JSON.stringify(accounts));
            renderSavedAccounts();
            e.stopPropagation();
            return;
        }
        const lu = document.getElementById('loginUsername'); if (lu) lu.value = row.dataset.login;
        const lp = document.getElementById('loginPassword'); if (lp) lp.focus();
    }));
}
renderSavedAccounts();

/* ============ LIVE UPDATES ============ */
setInterval(() => {
    if (!state.user) return;
    checkAutoLock();
    const oc = document.getElementById('onlineCount');
    if (oc) oc.textContent = Math.max(1, state.convs.filter(c => c.type === 'group').length + 1);
}, 5000);

/* ============ EXPIRING MESSAGES ============ */
setInterval(() => {
    let changed = false;
    state.convs.forEach(conv => {
        const before = conv.messages.length;
        conv.messages = conv.messages.filter(m => !m.expiresAt || m.expiresAt > Date.now());
        if (conv.messages.length !== before) changed = true;
    });
    if (changed) { if (state.activeConv) renderMessages(); renderConvList(); saveToStorage(); }
}, 10000);

/* ============ INIT ============ */
document.addEventListener('DOMContentLoaded', () => {
    applyEmojiToStatic();
    initTheme();
    state.notifMode = localStorage.getItem('lunar_notif_mode') || 'all';
    sound.notifSound = localStorage.getItem('lunar_notif_sound') || 'default';
    renderPosts();
    renderPinPad();
    updatePinDots();
    renderEmojiPicker();
    document.addEventListener('click', () => { state.lastActivity = Date.now(); });
    document.addEventListener('keydown', () => { state.lastActivity = Date.now(); });
});
