const tg = window.Telegram?.WebApp;
const SERVER_URL = 'http://45.128.204.64'; // Твой IP
let userId = tg?.initDataUnsafe?.user?.id || 12345;
let currentHeroId = null;
let currentPage = 1;

// ТВОИ КООРДИНАТЫ И ЛОГИКА (БЕЗ ИЗМЕНЕНИЙ)
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

const iconNames = { quests: "Задания", battle: "Бой", alliance: "Союз", shop: "Магазин", inventory: "Инвентарь", community: "Сообщество" };

const isTablet = window.innerWidth > 1024;
const config = isTablet ? {
    panel: { x: -17, y: 880, w: 854, h: 130 },
    layout: { quests: {x:-19, y:877, s:145}, battle: {x:102, y:880, s:160}, alliance: {x:237, y:882, s:150}, shop: {x:357, y:886, s:152}, inventory: {x:487, y:872, s:150} }
} : {
    panel: { x: -24, y: 551, w: 448, h: 99 },
    layout: { quests: {x:-22, y:551, s:106}, battle: {x:59, y:553, s:119}, alliance: {x:154, y:554, s:110}, inventory: {x:248, y:547, s:112} }
};

// ФУНКЦИИ
function selectHero(name, id) {
    currentHeroId = id;
    document.querySelectorAll('.hero-card').forEach(c => c.classList.remove('active'));
    document.getElementById('c-'+id).classList.add('active');
    document.getElementById('final-confirm-btn').disabled = false;
}

async function confirmHeroSelection() {
    try {
        await fetch(`${SERVER_URL}/set_hero/${userId}/${currentHeroId}`, { method: 'POST' });
        showMenu();
    } catch(e) { showMenu(); }
}

function showMenu() {
    document.getElementById('selection-screen').style.display = 'none';
    const menu = document.getElementById('menu-screen');
    menu.style.display = 'block';
    setTimeout(() => menu.style.opacity = '1', 50);
    const hero = heroesData[currentHeroId] || heroesData.tsar;
    document.getElementById('menu-avatar').src = hero.face;
    document.getElementById('p-name-display').textContent = hero.name;
    document.getElementById('inv-hero-img').src = hero.image;
    buildUI();
}

function buildUI() {
    const layer = document.getElementById('ui-dynamic-layer');
    layer.innerHTML = '';
    const bg = document.createElement('div');
    bg.className = 'bottom-panel-bg';
    Object.assign(bg.style, { left: config.panel.x+'px', top: config.panel.y+'px', width: config.panel.w+'px', height: config.panel.h+'px' });
    layer.appendChild(bg);

    Object.keys(config.layout).forEach(id => {
        const d = config.layout[id];
        const icon = document.createElement('div');
        icon.className = 'game-icon';
        Object.assign(icon.style, { width: d.s+'px', height: d.s+'px', left: d.x+'px', top: d.y+'px' });
        icon.innerHTML = `<img src="icon_${id}.png" style="width:100%;">`;
        icon.onclick = () => { if(id === 'inventory') openInventory(); };
        layer.appendChild(icon);
    });
}

function openInventory() {
    document.getElementById('inventory-screen').style.display = 'block';
    setTimeout(() => {
        document.getElementById('inventory-screen').style.opacity = '1';
        const isMobile = window.innerWidth <= 599;
        const pos = isMobile ? phonePositions : tabletPositions;
        Object.keys(pos).forEach(id => {
            const s = document.getElementById(id);
            if(s) {
                s.style.left = pos[id].x+'%'; s.style.top = pos[id].y+'%';
                s.style.width = pos[id].width+'px'; s.style.height = pos[id].height+'px';
            }
        });
    }, 50);
}

function closeInventory() { document.getElementById('inventory-screen').style.display = 'none'; }

window.onload = async () => {
    if(tg) { tg.expand(); tg.ready(); }
    let p = 0;
    const interval = setInterval(() => {
        p += 5;
        document.getElementById('progress-fill').style.width = p+'%';
        document.getElementById('loading-pct').textContent = p+'%';
        if(p >= 100) {
            clearInterval(interval);
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('selection-screen').style.display = 'flex';
            setTimeout(() => document.getElementById('selection-screen').style.opacity = '1', 50);
        }
    }, 30);
};
