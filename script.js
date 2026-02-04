const tg = window.Telegram?.WebApp;
const SERVER_URL = 'http://45.128.204.64'; 
let userId = tg?.initDataUnsafe?.user?.id || 12345;
let currentPage = 1;
let currentHeroId = null;

const tabletPositions = {
    'helmet-slot': { x: 14.21, y: 26.51, width: 235, height: 235 },
    'chestplate-slot': { x: 13.98, y: 37.87, width: 235, height: 235 },
    'hammer-slot': { x: 15.24, y: 47.98, width: 235, height: 235 },
    'ring-slot': { x: 15.68, y: 57.19, width: 235, height: 235 },
    'bracers-slot': { x: 55.51, y: 26.39, width: 235, height: 235 },
    'boots-slot': { x: 55.28, y: 36.96, width: 235, height: 235 },
    'hammer2-slot': { x: 55.78, y: 47.74, width: 235, height: 235 },
    'ring2-slot': { x: 55.96, y: 57.14, width: 235, height: 235 }
};

const phonePositions = {
    'helmet-slot': { x: 5.23, y: 28.63, width: 144, height: 144 },
    'chestplate-slot': { x: 5.55, y: 40.42, width: 144, height: 144 },
    'hammer-slot': { x: 6.80, y: 50.75, width: 144, height: 144 },
    'ring-slot': { x: 7.22, y: 59.82, width: 144, height: 144 },
    'bracers-slot': { x: 60.00, y: 27.90, width: 144, height: 144 },
    'boots-slot': { x: 59.86, y: 39.20, width: 144, height: 144 },
    'hammer2-slot': { x: 60.00, y: 50.64, width: 144, height: 144 },
    'ring2-slot': { x: 60.00, y: 59.33, width: 144, height: 144 }
};

const heroesData = {
    tsar: { name: "Царь", image: "hero_tsar.png", face: "face_1.png" },
    sultan: { name: "Султан", image: "hero_sultan.png", face: "face_2.png" },
    king: { name: "Король", image: "hero_king.png", face: "face_3.png" }
};

const pages = { 1: ["quests", "battle", "alliance", "shop", "inventory", "community"], 2: ["benchmark", "rating", "profile", "lotto", "calendar", "mail"] };
const iconNames = { quests: "Задания", battle: "Бой", community: "Сообщество", mail: "Письмо", calendar: "Календарь", alliance: "Союз", shop: "Магазин", inventory: "Инвентарь", profile: "Профиль", rating: "Рейтинг", lotto: "Лотерея", benchmark: "Эталон" };
const textPositions = { quests: {x: 59, y: 985}, battle: {x: 183, y: 985}, profile: {x: 179, y: 986}, mail: {x: 41, y: 988}, community: {x: 64, y: 234}, calendar: {x: 70, y: 583}, alliance: {x: 312, y: 988}, shop: {x: 438, y: 987}, inventory: {x: 565, y: 986}, rating: {x: 313, y: 987}, lotto: {x: 430, y: 987}, benchmark: {x: 565, y: 986} };

const isTablet = window.innerWidth > 1024 || (window.innerWidth <= 1024 && window.innerHeight > 1024);
const config = isTablet ? {
    panel: { x: -17, y: 880, w: 854, h: 130 },
    layout: {
        quests: {x:-19, y:877, s:145}, battle: {x:102, y:880, s:160}, alliance: {x:237, y:882, s:150},
        shop: {x:357, y:886, s:152}, inventory: {x:487, y:872, s:150}, community: {x:-15, y:127, s:153, static: true},
        benchmark: {x:477, y:868, s:162}, rating: {x:229, y:871, s:162}, profile: {x:99, y:867, s:165},
        lotto: {x:344, y:870, s:167}, calendar: {x:-69, y:414, s:256, static: true}, mail: {x:-79, y:835, s:243}
    }
} : {
    panel: { x: -24, y: 551, w: 448, h: 99 },
    layout: {
        quests: {x:-22, y:551, s:106}, battle: {x:59, y:553, s:119}, alliance: {x:154, y:554, s:110},
        shop: {x:246, y:94, s:115, static: true}, inventory: {x:248, y:547, s:112}, community: {x:-10, y:150, s:114, static: true},
        benchmark: {x:238, y:542, s:127}, rating: {x:57, y:544, s:127}, profile: {x:-27, y:543, s:123},
        lotto: {x:143, y:543, s:131}, calendar: {x:218, y:358, s:188, static: true}, mail: {x:-47, y:250, s:190, static: true}
    }
};

function initInventory() {
    const pos = (window.innerWidth <= 599) ? phonePositions : tabletPositions;
    Object.keys(pos).forEach(id => {
        const slot = document.getElementById(id);
        if (slot) {
            slot.style.left = pos[id].x + '%';
            slot.style.top = pos[id].y + '%';
            slot.style.width = pos[id].width + 'px';
            slot.style.height = pos[id].height + 'px';
        }
    });
}

function selectHero(name, id) {
    document.querySelectorAll('.hero-card').forEach(c => c.classList.remove('active'));
    document.getElementById('c-' + id)?.classList.add('active');
    currentHeroId = id;
    const btn = document.getElementById('final-confirm-btn');
    btn.disabled = false;
    btn.textContent = `ПОДТВЕРДИТЬ: ${name}`;
    document.getElementById('inv-hero-img').src = heroesData[id].image;
}

async function confirmHeroSelection() {
    try {
        await fetch(`${SERVER_URL}/set_hero/${userId}/${currentHeroId}`, { method: 'POST' });
        showMenu();
    } catch (e) { showMenu(); }
}

function showMenu() {
    document.getElementById('selection-screen').style.display = 'none';
    const menu = document.getElementById('menu-screen');
    menu.style.display = 'block';
    setTimeout(() => menu.style.opacity = '1', 50);
    const hero = heroesData[currentHeroId] || heroesData.tsar;
    document.getElementById('menu-avatar').src = hero.face;
    document.getElementById('p-name-display').textContent = hero.name;
    buildDynamicUI();
}

function buildDynamicUI() {
    const layer = document.getElementById('ui-dynamic-layer');
    layer.innerHTML = '';
    const bg = document.createElement('div');
    bg.id = 'bottom-panel-main'; bg.className = 'bottom-panel-bg';
    Object.assign(bg.style, { left: config.panel.x+'px', top: config.panel.y+'px', width: config.panel.w+'px', height: config.panel.h+'px' });
    const arrow = document.createElement('div');
    arrow.className = 'nav-arrow-custom';
    arrow.onclick = (e) => { e.stopPropagation(); currentPage = (currentPage === 1) ? 2 : 1; bg.classList.toggle('page2', currentPage === 2); arrow.classList.toggle('flip', currentPage === 2); updateIconVisibility(); };
    bg.appendChild(arrow);
    layer.appendChild(bg);

    Object.keys(config.layout).forEach(id => {
        const d = config.layout[id];
        const icon = document.createElement('div');
        icon.id = 'icon-' + id; icon.className = 'game-icon';
        Object.assign(icon.style, { width: d.s+'px', height: d.s+'px', left: d.x+'px', top: d.y+'px' });
        icon.innerHTML = `<img src="icon_${id}.png" style="width:100%; height:100%;">`;
        icon.onclick = () => { if(id === 'inventory') openInventory(); else alert(iconNames[id]); };
        layer.appendChild(icon);
        const label = document.createElement('div');
        label.id = 'label-' + id; label.textContent = iconNames[id]; label.className = 'icon-label';
        const tPos = textPositions[id] || {x: d.x + (d.s/2), y: d.y + d.s + 5};
        Object.assign(label.style, { top: tPos.y + 'px', left: tPos.x + 'px' });
        layer.appendChild(label);
    });
    updateIconVisibility();
}

function updateIconVisibility() {
    Object.keys(config.layout).forEach(id => {
        const isVisible = config.layout[id].static || pages[currentPage].includes(id);
        document.getElementById('icon-' + id)?.classList.toggle('hidden', !isVisible);
        document.getElementById('label-' + id)?.classList.toggle('hidden', !isVisible);
    });
}

function openInventory() { 
    document.getElementById('inventory-screen').style.display = 'block';
    setTimeout(() => { document.getElementById('inventory-screen').style.opacity = '1'; initInventory(); }, 50);
}
function closeInventory() { 
    document.getElementById('inventory-screen').style.opacity = '0';
    setTimeout(() => { document.getElementById('inventory-screen').style.display = 'none'; }, 400);
}

window.onload = () => {
    if(tg) { tg.expand(); tg.ready(); }
    let p = 0;
    const interval = setInterval(() => {
        p += 5;
        document.getElementById('progress-fill').style.width = p + '%';
        document.getElementById('loading-pct').textContent = p + '%';
        if(p >= 100) { clearInterval(interval); document.getElementById('loading-screen').style.display = 'none'; document.getElementById('selection-screen').style.display = 'block'; setTimeout(() => { document.getElementById('selection-screen').style.opacity = '1'; }, 50); }
    }, 30);
};
