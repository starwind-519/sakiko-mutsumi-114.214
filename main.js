// 【游戏结构总览】
// 阶段Ⅰ：启动流程（主菜单 → 序章 → 数值说明 → 教程 → 开始）
// 阶段Ⅱ：每日循环（五个时段行动）
// 阶段Ⅲ：盲盒系统（探索类行动）
// 阶段Ⅳ：剧情触发（累计 / 特殊事件）
// 阶段Ⅴ：每日结算（体力恢复 + 清晨主线）
// 阶段Ⅵ：主线剧情 / 结局判断
// 阶段Ⅶ：存档系统
// 阶段Ⅷ：杂项（ESC关闭 / 初始化)
// =========================================================


// =========================================================
// I. 全局游戏状态
// =========================================================
const gameState = {
  day: 1,
  time: 'morning', 
  stamina: 100,   
  sakikoMood: 50,  
  mutsumiMood: 50, 
  infection: 20,   
  supplies: 20,    
  love: 0,       

  houseSecurity: 0,   
  daysWithoutSupplies: 0, 
  usedSuppliesToday: false,

  acceptedConfession: false, // 告白事件
  actionCounts: {},          // 行动次数统计
  triggeredEvents: {},       // 已触发事件记录

  actionTakenThisTime: false // 当前时段是否已执行行动

};

// =========================================================
// II. DOM元素
// =========================================================
const $ = (sel) => document.querySelector(sel);
const mainMenu = $('#mainMenu');
const startGameBtn = $('#startGameBtn');
const loadGameBtn = $('#loadGameBtn');
const exitGameBtn = $('#exitGameBtn');
const gameContainer = $('#gameContainer')|| document.querySelector('.game-container');
const dayTimeDisplay = $('#dayTimeDisplay');

const staminaValue = $('#staminaValue'), staminaBar = $('#staminaBar');
const sakikoMoodValue = $('#sakikoMoodValue'), sakikoMoodBar = $('#sakikoMoodBar');
const mutsumiMoodValue = $('#mutsumiMoodValue'), mutsumiMoodBar = $('#mutsumiMoodBar');
const infectionValue = $('#infectionValue'), infectionBar = $('#infectionBar');
const suppliesValue = $('#suppliesValue'), suppliesBar = $('#suppliesBar');
const loveValue = $('#loveValue'), loveBar = $('#loveBar');

const saveBtn = $('#saveBtn'), loadBtn = $('#loadBtn'), menuBtn = $('#menuBtn');

const storyText = $('#storyText');
const actionsContainer = $('#actionsContainer');

const saveMenu = $('#saveMenu');
const saveSlots = $('#saveSlots');
const saveSlotsBtn =$('#saveSlotsBtn');

// ---  序章 / 数值说明 / 教程 ---
const introModal = $('#introModal');
const continueIntroBtn = $('#continueIntroBtn');
const introtextEl = $('#introtext');

const statsIntroModal = $('#statsIntroModal');
const startDay1Btn = $('#startDay1Btn');
const statsIntroText = $('#statsIntroText');

const tutorialModal = $('#tutorialModal');
const tutorialText = $('#tutorialText');
const step1 = $('#step1'), step2 = $('#step2'), step3 = $('#step3');
const nextTutorialBtn = $('#nextTutorialBtn');
const skipTutorialBtn = $('#skipTutorialBtn');

// --- 通知与提示 ---
const notification = $('#notification');
const notificationText = $('#notificationText');

// --- 对话 / 特殊事件弹窗 ---
const dialogPopup = $('#dialogPopup');
const dialogContent = $('#dialogContent');
const dialogOptions = $('#dialogOptions');

// --- 盲盒相关元素 ---
const blindBoxModal = $('#blindBoxModal');
const blindBoxTitle = $('#blindBoxTitle');
const blindBoxMessage = $('#blindBoxMessage');
const blindBoxImageArea = $('#blindBoxImageArea');
const blindBoxOptions = $('#blindBoxOptions');
const blindBoxResult = $('#blindBoxResult');
const blindBoxResultText = $('#blindBoxResultText');
const closeBlindBoxBtn = $('#closeBlindBoxBtn');

// --- 结局弹窗 ---
const endingModal = $('#endingModal');
const endingTitle = $('#endingTitle');
const endingText = $('#endingText');
const nextEndingBtn = $('#nextEndingBtn');
const restartGameBtn = $('#restartGameBtn');

// --- 模态层遮罩 ---
const overlay = $('#overlay');


// =========================================================
// III. 工具函数（容错 / 范围约束）
// ---------------------------------------------------------
//   - clamp：限制数值范围
//   - showNotification：显示右下角通知
//   - openModal / closeModal：统一模态框显示
//   - storyManager：负责故事文字更新（覆盖 / 追加）
// =========================================================
function clamp(value, min = 0, max = 100) {
  if (typeof value !== 'number' || Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

// === 通知系统（支持排队）===
const notificationQueue = [];
let isShowingNotification = false;

function showNotification(text, ms = 3000) {
  if (!notification || !notificationText) {
    console.warn('通知元素未找到');
    return;
  }

  // 将消息加入队列
  notificationQueue.push({ text, ms });

  // 如果当前没有在显示，启动显示流程
  if (!isShowingNotification) {
    processNotificationQueue();
  }
}

function processNotificationQueue() {
  if (notificationQueue.length === 0) {
    isShowingNotification = false;
    return;
  }

  isShowingNotification = true;
  const { text, ms } = notificationQueue.shift(); // 取出第一条

  try {
    notificationText.innerHTML = text;
    notification.style.display = 'block';
    notification.style.zIndex = 1050;
    notification.classList.add('show');

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        const modalOpen = document.querySelector(
          '.modal[style*="display:flex"], .dialog-popup[style*="display:flex"], .modal[style*="display: block"]'
        );
        if (!modalOpen) notification.style.display = 'none';
        // 显示下一条
        processNotificationQueue();
      }, 300);
    }, ms);
  } catch (e) {
    console.warn('showNotification render error', e);
    processNotificationQueue();
  }
}

function closeModal(el) {
  if (!el) return;
  el.style.display = 'none';
  if (overlay) overlay.style.display = 'none';
}

function openModal(el) {
  if (!el) return;
  el.style.display = 'flex';
  if (overlay) overlay.style.display = 'block';
}

// --- 故事输出管理器 ---
const storyManager = {
  show(text) {
    if (!storyText) return;
    storyText.innerHTML = text || '';
    storyText.scrollTop = 0; //先看第一排
  },
  append(text) {
    if (!storyText) return;
    storyText.innerHTML += `<br>${text}`;
    storyText.scrollTop = storyText.scrollHeight;
  },
  appendResponse(text) {
    if (!storyText) return;
    storyText.innerHTML += `<div class="response-text">${text}</div>`;
    storyText.scrollTop = storyText.scrollHeight;
  }
};

// =========================================================
// IV. 载入外部配置与容错
// ---------------------------------------------------------
// 用途：确保外部脚本缺失时不会报错。
// =========================================================
const ACTIONS = window.actions || {};
const ACTION_EVENTS = window.actionEvents || {};
const TIME_SLOTS = window.timeSlots || [
  { id: 'morning', name: '早晨', actions: [] },
  { id: 'noon', name: '中午', actions: [] },
  { id: 'afternoon', name: '下午', actions: [] },
  { id: 'evening', name: '傍晚', actions: [] },
  { id: 'night', name: '夜晚', actions: [] }
];
const MODE_LABELS = window.modeLabels || {};
const RANDOM_EVENTS = window.randomEvents || {};
const EVENTS = window.events || [];
const SPECIAL_EVENTS = window.specialEvents || [];
const ENDINGS = window.endings || {};

// =========================================================
// V. 初始化 / 重置逻辑
// ---------------------------------------------------------
// 用途：用于新游戏开始或读档后恢复初始状态。
// =========================================================
function resetGameState() {
  gameState.day = 1;
  gameState.time = 'morning';
  gameState.stamina = 100;
  gameState.sakikoMood = 50;
  gameState.mutsumiMood = 50;
  gameState.infection = 20;
  gameState.supplies = 20;
  gameState.love = 0;

  gameState.houseSecurity = 0;
  gameState.daysWithoutSupplies = 0;
  gameState.usedSuppliesToday = false;

  gameState.acceptedConfession = false;
  gameState.actionCounts = {};
  gameState.triggeredEvents = {};

  gameState.actionTakenThisTime = false;

  // 初始化每个行动的计数
  Object.keys(ACTIONS).forEach(actionId => {
    gameState.actionCounts[actionId] = 0;
    const a = ACTIONS[actionId];
    if (a && a.variants)
      Object.keys(a.variants).forEach(k => gameState.actionCounts[`${actionId}_${k}`] = 0);
    if (a && a.responses && typeof a.responses === 'object')
      Object.keys(a.responses).forEach(k => gameState.actionCounts[`${actionId}_${k}`] = 0);
  });
}

// =========================================================
// VI. UI 更新 / 数值约束
// ---------------------------------------------------------
// 用途：实时更新游戏主界面的数值条。
// =========================================================
function updateUI() {
  const currentTimeSlot = TIME_SLOTS.find(t => t.id === gameState.time);
  if (dayTimeDisplay)
    dayTimeDisplay.textContent = `第 ${gameState.day} 天 - ${currentTimeSlot ? currentTimeSlot.name : gameState.time}`;

  if (staminaValue) staminaValue.textContent = String(Math.round(gameState.stamina));
  if (staminaBar) staminaBar.style.width = `${clamp(gameState.stamina)}%`;
  if (sakikoMoodValue) sakikoMoodValue.textContent = String(Math.round(gameState.sakikoMood));
  if (sakikoMoodBar) sakikoMoodBar.style.width = `${clamp(gameState.sakikoMood)}%`;
  if (mutsumiMoodValue) mutsumiMoodValue.textContent = String(Math.round(gameState.mutsumiMood));
  if (mutsumiMoodBar) mutsumiMoodBar.style.width = `${clamp(gameState.mutsumiMood)}%`;
  if (infectionValue) infectionValue.textContent = String(Math.round(gameState.infection));
  if (infectionBar) infectionBar.style.width = `${clamp(gameState.infection, 5)}%`;
  if (suppliesValue) suppliesValue.textContent = String(Math.round(gameState.supplies));
  if (suppliesBar) suppliesBar.style.width = `${clamp(gameState.supplies)}%`;
  if (loveValue) loveValue.textContent = String(Math.round(gameState.love));
  if (loveBar) loveBar.style.width = `${clamp(gameState.love)}%`;
}

function clampValues() {
  gameState.stamina = clamp(gameState.stamina);
  gameState.sakikoMood = clamp(gameState.sakikoMood);
  gameState.mutsumiMood = clamp(gameState.mutsumiMood);
  gameState.infection = clamp(gameState.infection, 5); //保底5，睦的感染永远5
  gameState.supplies = clamp(gameState.supplies);
  gameState.love = clamp(gameState.love);
}

// =========================================================
// VII. 开局流程（序章 → 数值说明 → 教程 → 正式开始）
// ---------------------------------------------------------
//  用途：控制游戏的最初进入顺序。
//   1. 显示主菜单 → 点击“开始游戏”。
//   2. 播放 introTexts（序章文字分段点击）。
//   3. 显示数值说明（statsIntroTexts）。
//   4. 若有教程则依次播放 tutorialSteps。 新加了跳过教程按钮，加油啊小风。 测试的想吐了，加油desuwa
//   5. 最后进入正式游戏 beginGameplay().
// =========================================================
let introIndex = 0;
function updateIntroModalText() {
  const texts = window.introTexts || [];
  if (!introtextEl) return;
  introtextEl.innerHTML = texts[introIndex] || '';
  if (continueIntroBtn)
    continueIntroBtn.textContent = (introIndex >= texts.length - 1) ? '进入数值说明' : '继续';
}

function updateStatsIntroText() {
  const texts = window.statsIntroTexts || [];
  if (!statsIntroText) return;
  statsIntroText.innerHTML = texts.join('');
}

// --- 开始游戏按钮：启动整个开场流程 ---
function startIntroFlow() {
  resetGameState();
  introIndex = 0; // 重置序章进度，防止重复开启时从中间开始
  updateIntroModalText();
  openModal(introModal);
  closeModal(statsIntroModal);
  closeModal(tutorialModal);
  if (mainMenu) mainMenu.style.display = 'none';
}
if (startGameBtn) startGameBtn.addEventListener('click', startIntroFlow);

// --- 序章点击“继续”逻辑 ---
if (continueIntroBtn)
  continueIntroBtn.addEventListener('click', () => {
    const texts = window.introTexts || [];
    introIndex++;
    if (introIndex < texts.length) updateIntroModalText();
    else {
      closeModal(introModal);
      updateStatsIntroText();
      openModal(statsIntroModal);
    }
  });

// --- 数值介绍结束后，进入教程或直接开始游戏 ---
if (startDay1Btn)
  startDay1Btn.addEventListener('click', () => {
    closeModal(statsIntroModal);
    const tutorialArr = window.tutorialSteps || [];
    if (tutorialArr && tutorialArr.length > 0) {
      gameState.tutorialStep = 1;
      updateTutorialUI();
      openModal(tutorialModal);
    } else {
      beginGameplay();
    }
  });

// --- 教程分步更新 ---
function updateTutorialUI() {
  const t = gameState.tutorialStep || 1;
  step1 && step1.classList.toggle('active', t === 1);
  step2 && step2.classList.toggle('active', t === 2);
  step3 && step3.classList.toggle('active', t === 3);
  const ts = window.tutorialSteps || [];
  tutorialText && (tutorialText.innerHTML = ts[t - 1] || '');
  nextTutorialBtn && (nextTutorialBtn.textContent = (t >= ts.length ? '开始游戏' : '下一步'));
}

// --- 教程“下一步”按钮逻辑 ---
if (nextTutorialBtn)
  nextTutorialBtn.addEventListener('click', () => {
    const ts = window.tutorialSteps || [];
    if (gameState.tutorialStep < (ts.length || 1)) {
      gameState.tutorialStep++;
      updateTutorialUI();
    } else {
      closeModal(tutorialModal);
      beginGameplay();
    }
  });

if (skipTutorialBtn)
  skipTutorialBtn.addEventListener('click', () => {
    closeModal(tutorialModal);
    beginGameplay();
  });

// --- 正式进入游戏主界面 ---
function beginGameplay() {
  if (gameContainer) gameContainer.style.display = 'block';
  if (mainMenu) mainMenu.style.display = 'none';
  clampValues();
  updateUI();

  //启动时进入「当日主线」
  const hadMain = checkMainStoryEvents();
  if (!hadMain) storyManager.show(getMorningStory());

  generateActions(); // 生成时段行动
  bindSaveLoadButtons(); // 启用存读档按钮
}


// =========================================================
// VIII. 行动生成与执行 改了不懂第几次了ver
// ---------------------------------------------------------
// 用途：
//   - 生成当前时段可选的行动按钮（基于 timeSlots）
//   - 点击后执行对应行动（消耗 / 效果 / 剧情）
//   - 执行后进入盲盒或普通剧情分支
// =========================================================

// --- 累加行动次数 --- 都怪我设置那么多变体干嘛
function incrementActionCount(actionId, variant = null) {
  if (!gameState.actionCounts) gameState.actionCounts = {};
  gameState.actionCounts[actionId] = (gameState.actionCounts[actionId] || 0) + 1;
  if (variant) {
    const key = `${actionId}_${variant}`;
    gameState.actionCounts[key] = (gameState.actionCounts[key] || 0) + 1;
  }
}

// --- 生成行动按钮 ---
function generateActions() {
  if (!actionsContainer) return;
  actionsContainer.innerHTML = '';

  const currentSlot = TIME_SLOTS.find(ts => ts.id === gameState.time);
  if (!currentSlot || !Array.isArray(currentSlot.actions)) return;

  gameState.actionTakenThisTime = false;

  currentSlot.actions.forEach(a => {
    const actionId = a.action;
    const actionDef = ACTIONS[actionId];

    const label = (actionDef?.name || a.label || actionId || "未知行动");
    const desc = actionDef?.description || a.description || '';

    const button = document.createElement('button');
    button.className = 'action-btn';
    button.innerHTML = `
      <div class="action-label">${label}</div>
      <div class="action-desc">${desc}</div>
    `;

    // 若该行动未定义，禁用
    if (!actionDef) {
      button.disabled = true;
      button.title = `未在 actions.js 中定义: ${actionId}`;
    } else {
      let variant = null;
      if (a.mode) variant = a.mode;
      else if (a.time) variant = a.time;
      
      // 判断资源是否足够执行行动
      const cost = variant && actionDef.variants?.[variant]?.cost
        ? actionDef.variants[variant].cost
        : (actionDef.cost || {});

      const canAfford = !((cost.stamina && cost.stamina > gameState.stamina) ||
                          (cost.supplies && cost.supplies > gameState.supplies));
      button.disabled = !canAfford;

      // 点击执行行动
      button.addEventListener('click', () => {
        if (gameState.actionTakenThisTime) return;
        gameState.actionTakenThisTime = true;
        performAction(actionId, variant, a);
      });
    }

    actionsContainer.appendChild(button);
  });
}

// --- 执行行动主函数 ---
function performAction(actionId, variant = null, actionSlot = {}) {
  const actionDef = ACTIONS[actionId];
  if (!actionDef) {
    showNotification('未知操作，已被忽略');
    generateActions();
    return;
  }

  // --- 解析消耗与效果 ---
  let cost = actionDef.cost ? { ...actionDef.cost } : {};
  let effect = actionDef.effect ? { ...actionDef.effect } : {};
  let responses = actionDef.responses || [];

  // --- 若有变体，则使用 variant 数据 ---
  if (variant) {
    if (actionDef.variants && actionDef.variants[variant]) {
      const v = actionDef.variants[variant];
      cost = v.cost ? { ...v.cost } : cost;
      effect = v.effect ? { ...v.effect } : effect;
    }
    if (actionDef.responses && actionDef.responses[variant]) {
      responses = actionDef.responses[variant];
    }
  }

  // --- 扣除体力 / 物资 ---
  if (cost.stamina) gameState.stamina -= cost.stamina;
  if (cost.supplies) {
    gameState.supplies = Math.max(0, gameState.supplies - cost.supplies);
    gameState.usedSuppliesToday = true;
  }

  // --- 应用效果（加减数值） ---
  Object.keys(effect || {}).forEach(k => {
    if (typeof effect[k] === 'number')
      gameState[k] = (gameState[k] || 0) + effect[k];
    else
      gameState[k] = effect[k];
  });

  // --- 特殊行为：加固计数 ---
  if (actionId === 'fortify') {
    // 不设上限，但3次及以上视为安全
    gameState.houseSecurity = (gameState.houseSecurity || 0) + 1;

    // 自动保存进度，避免第八天最后一次没写入导致第九天误判
    try {
      autosave();
    } catch (e) {
      console.warn('autosave failed after fortify', e);
    }
  }

  if (actionDef.usesSupplies) gameState.usedSuppliesToday = true;

  clampValues();
  updateUI();

  // --- 图片展示逻辑，要在显示对白之前啊 ---
  if (actionDef.image) {
    const imgBox = document.getElementById('actionImage');
    const img = imgBox ? imgBox.querySelector('img') : null;

    if (img) {
      // 第一步：立即清除旧图片！！！（只添加这一行）
      img.src = '';
      
      // 开始隐藏过渡
      imgBox.classList.remove('visible');
      imgBox.classList.add('hidden');

      // 预加载新图片
      const newImage = new Image();
      newImage.onload = () => {
        // 图片加载完成后，等待过渡完成再显示
        setTimeout(() => {
          // 第二步：设置已加载的图片源
          img.src = actionDef.image;
          
          // 第三步：开始显示过渡
          imgBox.classList.remove('hidden');
          imgBox.classList.add('visible');

          // 延迟1秒后隐藏并输出对白
          setTimeout(() => {
            imgBox.classList.remove('visible');
            setTimeout(() => {
              imgBox.classList.add('hidden');
              showActionResponse(responses);
              continueActionFlow(actionId, variant, actionSlot);
            }, 500);
          }, 1000);
        }, 300);
      };
      
      // 开始加载图片
      newImage.src = actionDef.image;
      
      // 设置加载超时保护（5秒）
      setTimeout(() => {
        if (!newImage.complete) {
          console.warn('图片加载超时，强制继续流程');
          // 即使图片没加载完也继续流程
          img.src = actionDef.image;
          imgBox.classList.remove('hidden');
          imgBox.classList.add('visible');
          
          setTimeout(() => {
            imgBox.classList.remove('visible');
            setTimeout(() => {
              imgBox.classList.add('hidden');
              showActionResponse(responses);
              continueActionFlow(actionId, variant, actionSlot);
            }, 500);
          }, 1000);
        }
      }, 5000);
      
    } else {
      showActionResponse(responses);
      continueActionFlow(actionId, variant, actionSlot);
    }
  } else {
    showActionResponse(responses);
    continueActionFlow(actionId, variant, actionSlot);
  }
}

// --- 输出对白函数 ---
function showActionResponse(responses) {
  if (!responses) return;
  const respText = Array.isArray(responses)
    ? responses[Math.floor(Math.random() * responses.length)]
    : responses;
  storyManager.appendResponse(respText || '');
}

// --- 后续流程函数（事件检查 / 时间推进） ---
function continueActionFlow(actionId, variant, actionSlot = {}) {
  // 先累加计数
  incrementActionCount(actionId, variant);

  const exploreActions = ['explore_house', 'explore_alone', 'explore_withMutsumi'];

  if (exploreActions.includes(actionId)) {
    handleRandomEvent(actionId, () => {
      checkActionEvents(actionId, () => {
        checkAllSpecialEvents(() => {
          if (!actionSlot.noTime)
            setTimeout(() => advanceTime(), 700);
          else
            generateActions();
        });
      });
    });
  } else {
    checkActionEvents(actionId, () => {
      checkAllSpecialEvents(() => {
        if (!actionSlot.noTime)
          setTimeout(() => advanceTime(), 700);
        else
          generateActions();
      });
    });
  }
}

// =========================================================
// IX. 随机盲盒系统（探索类行动触发）
// ---------------------------------------------------------
// 「盲盒小游戏」。
//   - 玩家从5个盒子中随机选择一个。
//   - 打开后显示奖励或惩罚（文字 + 数值效果）。
//   - 之后再进入行动故事文本。
// =========================================================
function handleRandomEvent(actionId, onComplete) {
  const pool = (RANDOM_EVENTS || {})[actionId];
  if (!pool || !Array.isArray(pool) || pool.length === 0) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  const choices = Array.from({ length: 5 }).map(() => pool[Math.floor(Math.random() * pool.length)]);

  if (!blindBoxModal || !blindBoxOptions || !blindBoxResult || !blindBoxResultText) {
    const ev = choices[0];
    if (ev && ev.effect) {
      Object.keys(ev.effect).forEach(k => { if (typeof ev.effect[k] === 'number') gameState[k] = (gameState[k] || 0) + ev.effect[k]; });
      clampValues(); updateUI();
    }
    storyManager.append(`<em>${choices[0].description || ''}</em>`);
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  // 初始化盲盒界面
  blindBoxTitle && (blindBoxTitle.textContent = '随机盲盒');
  blindBoxMessage && (blindBoxMessage.textContent ='请选择一个盲盒');
  if (blindBoxImageArea) blindBoxImageArea.innerHTML = '';
  blindBoxResult.style.display = 'none';
  blindBoxResultText.innerHTML = '';
  while (blindBoxOptions.firstChild) blindBoxOptions.removeChild(blindBoxOptions.firstChild);

  // 创建5个盒子按钮
  const boxButtons = [];
  for (let i = 0; i < 5; i++) {
    const b = document.createElement('button');
    b.className = 'blind-box';
    b.type = 'button';
    b.dataset.index = String(i);
    b.textContent = '';
    boxButtons.push(b);
    blindBoxOptions.appendChild(b);

    b.addEventListener('click', () => {
      if (b.disabled) return;
      boxButtons.forEach(x => x.disabled = true);
      b.classList.add('shaking');
      if (blindBoxImageArea) blindBoxImageArea.innerHTML = '<div style="padding:8px">盒子开始晃动……</div>';

      const chosen = choices[i];
      setTimeout(() => {
        b.classList.remove('shaking');
        if (blindBoxResultText)
          blindBoxResultText.innerHTML = chosen.description || '空盒子……';
        blindBoxResult.style.display = 'block';

        // 应用数值效果
        if (chosen.effect && typeof chosen.effect === 'object') {
          Object.keys(chosen.effect).forEach(k => {
            if (typeof chosen.effect[k] === 'number')
              gameState[k] = (gameState[k] || 0) + chosen.effect[k];
          });
          clampValues(); updateUI();
        }

        // 关闭行为
        if (closeBlindBoxBtn) {
          // 使用 addEventListener 防止重复覆盖逻辑
          const handler = () => {
            closeModal(blindBoxModal);
            closeBlindBoxBtn.removeEventListener('click', handler);
            setTimeout(() => { if (typeof onComplete === 'function') onComplete(); }, 120);
          };
          closeBlindBoxBtn.addEventListener('click', handler);
        } else {
          setTimeout(() => { closeModal(blindBoxModal); if (typeof onComplete === 'function') onComplete(); }, 800);
        }
      }, 1000); // 1秒晃动动画
    });
  }

  openModal(blindBoxModal);
}

// =========================================================
// X. 累计事件与特殊事件系统 非常重要的重点错误区域，记得注意
// ---------------------------------------------------------
// 用途：
//   - 检查是否达成某个累计行动次数触发的事件（actionEvents）。
//   - 检查全局条件触发的特殊剧情（specialEvents）。
//   - 可附带选项与数值奖励。
// =========================================================

// --- 累计行动触发事件 ---
function checkActionEvents(actionId, doneCallback) {
  const candidates = [];
  Object.keys(ACTION_EVENTS || {}).forEach(key => {
    const arr = ACTION_EVENTS[key] || [];
    arr.forEach((ev, idx) => {
      const uniqueKey = ev._key || `${key}_${idx}`;
      const count = gameState.actionCounts[key] || gameState.actionCounts[ev.key] || 0;
      let should = false;
      if (typeof ev.condition === 'function') {
        try {
          // 优先尝试最通用的 (count, gameState)
          should = Boolean(ev.condition(count, gameState));
        } catch (e1) {
          try { should = Boolean(ev.condition(gameState)); } catch (e2) {
            try { should = Boolean(ev.condition()); } catch (e3) { should = false; }
          }
        }
      }
      if (should && !gameState.triggeredEvents[uniqueKey]) {
        const opts = ev.choices || ev.options || [{ text: '继续', feedback: ev.feedback, effect: ev.effect || ev.effects }];
        candidates.push({ uniqueKey, text: ev.text, options: opts, evObj: ev });
      }
    });
  });

  if (candidates.length === 0) { if (doneCallback) doneCallback(); return; }

  const next = () => {
    if (candidates.length === 0) { if (doneCallback) doneCallback(); return; }
    const cur = candidates.shift();
    showSpecialEventModal(cur.uniqueKey, cur.text, cur.options, () => {
      gameState.triggeredEvents[cur.uniqueKey] = true;
      next();
    });
  };
  next();
}

// --- 检查全局特殊事件（非累计事件就对啦） ---
function checkAllSpecialEvents(doneCallback) {
  const pending = [];
  (SPECIAL_EVENTS || []).forEach(ev => {
    try {
      if (typeof ev.condition === 'function' && ev.condition(gameState) && !gameState.triggeredEvents[ev.key])
        pending.push(ev);
    } catch (e) {}
  });
  if (pending.length === 0) { if (doneCallback) doneCallback(); return; }

  const next = () => {
    if (pending.length === 0) { if (doneCallback) doneCallback(); return; }
    const ev = pending.shift();
    showSpecialEventModal(ev.key, ev.text, ev.options, () => {
      gameState.triggeredEvents[ev.key] = true;
      next();
    });
  };
  next();
}

// --- 通用剧情弹窗（含选项） --- 
function showSpecialEventModal(eventKey, text, options, onClose) {
  if (!dialogPopup || !dialogContent || !dialogOptions) {
    storyManager.append(typeof text === 'string' ? text : String(text));
    if (onClose) onClose();
    return;
  }

  let titleText = '特殊剧情';
  let matched = false;

  // --- 累计剧情彩蛋（ActionEvents） --- 应该有问题但不改了我好累先标记
  if (window.actionEvents) {
    for (const [groupKey, arr] of Object.entries(window.actionEvents)) {
      if (groupKey === eventKey) { // 兼容 group 自身为 key 的情况
        titleText = '累计剧情彩蛋';
        matched = true;
        break;
      }
      if (Array.isArray(arr) && arr.some(ev => ev.key === eventKey || ev._key === eventKey)) {
        titleText = '累计剧情彩蛋';
        matched = true;
        break;
      }
    }
  }

  // --- 主线剧情（Events） ---
  if (!matched && window.events) {
    for (const ev of window.events) {
      const evKey = ev.key || `day${ev.day || ''}`; // 自动识别 dayX
      if (evKey === eventKey || ev._key === eventKey) {
        titleText = '主线剧情';
        matched = true;
        break;
      }
    }
  }

  // --- 恋爱支线（SpecialEvents） ---
  if (!matched && window.specialEvents) {
    for (const ev of window.specialEvents) {
      if (ev.key === eventKey || ev._key === eventKey) {
        titleText = '恋爱支线';
        matched = true;
        break;
      }
    }
  }

  // 应用标题到弹窗
  const titleElement = dialogPopup.querySelector('.dialog-title');
  if (titleElement) titleElement.textContent = titleText;

  // 填充内容与选项
  dialogContent.innerHTML = `<div class="dialog-content">${text}</div>`;
  dialogContent.scrollTop = 0;  // 新增：重置到顶部
  dialogOptions.innerHTML = '';

  const opts = Array.isArray(options) && options.length > 0 ? options : [{ text: '继续' }];

  const finalize = (applyEffect) => {
    if (typeof applyEffect === 'function') {
      try { applyEffect(gameState); } catch (e) {}
    }
    clampValues(); updateUI();
    closeModal(dialogPopup);
    if (typeof onClose === 'function') onClose();
  };

  // 生成选项按钮
  opts.forEach(opt => {
    const b = document.createElement('button');
    b.className = 'dialog-btn';
    b.textContent = opt.text || '继续';
    b.addEventListener('click', () => {
      Array.from(dialogOptions.querySelectorAll('button')).forEach(x => x.disabled = true);

   const fb = typeof opt.feedback === 'function' ? opt.feedback(gameState) : opt.feedback;
   if (fb) {
   dialogContent.innerHTML = `<div class="dialog-content">${fb}</div>`; // 这里没有重置滚动位置
   dialogContent.scrollTop = 0; // 新增：显示反馈时重置滚动条
   dialogOptions.innerHTML = '';

        const cont = document.createElement('button');
        cont.className = 'dialog-btn';
        cont.textContent = '继续';
        cont.addEventListener('click', () => {
          //兼容 effects / effect 两种写法 （人啊打字就是容易写叉）
          try {
            if (opt.effects && typeof opt.effects === 'object') {
              applyEffects(opt.effects);
            } else if (opt.effect) {
              if (typeof opt.effect === 'function') opt.effect(gameState);
              else if (typeof opt.effect === 'object')
                Object.keys(opt.effect).forEach(k => gameState[k] = (gameState[k] || 0) + opt.effect[k]);
            }
          } catch (e) { console.warn('applyEffects failed', e, opt); }

          finalize(opt.onFinish || opt.callback);
        });
        dialogOptions.appendChild(cont);
      } else {
        // 又是你两effects / effect 
        try {
          if (opt.effects && typeof opt.effects === 'object') {
            applyEffects(opt.effects);
          } else if (opt.effect) {
            if (typeof opt.effect === 'function') opt.effect(gameState);
            else if (typeof opt.effect === 'object')
              Object.keys(opt.effect).forEach(k => gameState[k] = (gameState[k] || 0) + opt.effect[k]);
          }
        } catch (e) { console.warn('applyEffects failed', e, opt); }

        finalize(opt.onFinish || opt.callback);
      }
    });
    dialogOptions.appendChild(b);
  });

  openModal(dialogPopup);
}

// =========================================================
// XI. 时间推进 / 日终结算
// ---------------------------------------------------------
// 用途：
// 每天结算并恢复体力 -> 检查结局 -> 播放当日晨间主线文本 -> 生成当天行动
// =========================================================

function advanceTime() {
  const idx = TIME_SLOTS.findIndex(t => t.id === gameState.time);
  if (idx >= 0 && idx < TIME_SLOTS.length - 1) {
    // 推进到下一个时段
    gameState.time = TIME_SLOTS[idx + 1].id;
    clampValues();
    updateUI();
    storyManager.append(`时间来到了${TIME_SLOTS[idx + 1].name}，接下来你要怎么做？`);
    generateActions();
  } else {
    // 到了夜晚后结算一天
    endDay();
  }
}

// 自动存档
function autosave() {
  try {
    const payload = { gameState: JSON.parse(JSON.stringify(gameState)), timestamp: new Date().toISOString() };
    localStorage.setItem('autosave', JSON.stringify(payload));
  } catch (e) {
    console.warn('autosave failed', e);
  }
}

function endDay() {
  gameState.stamina = 100;
  gameState.infection = (gameState.infection || 0) + 12;
  gameState.sakikoMood = (gameState.sakikoMood || 0) - 8;
  gameState.mutsumiMood = (gameState.mutsumiMood || 0) - 8;
  gameState.houseSecurity = gameState.houseSecurity || 0;

  //若当天未使用物资，消耗自然物资并造成心情下降
  if (!gameState.usedSuppliesToday) {
    gameState.supplies = Math.max(0, (gameState.supplies || 0) - 3);
    gameState.sakikoMood = Math.max(0, gameState.sakikoMood - 2);
    gameState.mutsumiMood = Math.max(0, gameState.mutsumiMood - 2);
    // 显示右下角通知（每日惩罚）
    showNotification('今天没有使用物资，两人略显疲惫。（物资 -3，双方心情 -2）', 2000);
    gameState.daysWithoutSupplies = (gameState.daysWithoutSupplies || 0) + 1;
  } else {
    gameState.daysWithoutSupplies = 0;
  }

  //重置每日标记
  gameState.usedSuppliesToday = false;
  gameState.actionTakenThisTime = false;

  clampValues();
  updateUI();

  // 显示夜晚结算信息
  storyManager.append("<br><br>--- 第 " + gameState.day + " 天结束 ---");
  storyManager.append("夜晚降临，祥子和睦都累了...");
  
  // 禁用所有行动按钮
  if (actionsContainer) {
    actionsContainer.innerHTML = '';
    const nextDayBtn = document.createElement('button');
    nextDayBtn.className = 'action-btn';
    nextDayBtn.innerHTML = `
      <div class="action-label">进入第 ${gameState.day + 1} 天</div>
      <div class="action-desc">点击开始新的一天</div>
    `;
    nextDayBtn.addEventListener('click', () => {
      proceedToNextDay();
    });
    actionsContainer.appendChild(nextDayBtn);
  }
}

function proceedToNextDay() {
  // 检查是否触发结局
  if (checkEndings()) return;

  // 前进至下一日早晨
  gameState.day = (gameState.day || 1) + 1;
  gameState.time = 'morning';
  autosave();
  saveToSlot(LEGACY_KEY, true);
  updateUI();

  if (checkEndings()) return;

  const hadMain = checkMainStoryEvents();
  if (!hadMain) storyManager.show(getMorningStory());

  generateActions();
}

// 保底测试
function getMorningStory() {
  return "早上了，睦睦祥祥幸福的do了。";
}

// =========================================================
// XII. 主线事件（每天清晨播放） / 结局判断
// ---------------------------------------------------------
// 用途：
//   - 每天早晨根据 day 字段匹配主线剧情。
//   - 若无当天剧情，则播放默认晨间文本。
//   - 支持普通剧情与带选项剧情两种形式。
// =========================================================

function checkMainStoryEvents() {
  const today = (EVENTS || []).find(e => e && e.day === gameState.day);

  // --- 若当日没有主线剧情，则播放默认早晨文本 ---
  if (!today) {
    storyManager.show(getMorningStory());
    return false;
  }

  // --- 纯文本 ---
  if (today.type === 'story') {
    storyManager.show(today.text);
    return true;
  }

  // --- 带选项 ---
  if (today.type === 'event') {
    const eventKey = today.key || today._key || `day${gameState.day}`;

    //记得清空故事板
    storyManager.show(`第 ${gameState.day} 天 - 早晨`);
    storyManager.append(`<em>（主线剧情触发）</em>`);

    //延迟一点点再弹窗，避免显示冲突
    setTimeout(() => {
      showSpecialEventModal(
        eventKey,
        today.text,
        today.options,
        () => {
          storyManager.append(`<em>主线剧情结束，新的早晨开始，你会选择做什么？。</em>`);
        }
      );
    }, 100);

    return true;
  }

  // --- 其他类型（兜底的） ---
  storyManager.show(today.text || getMorningStory());
  return true;
}

function checkEndings() {
  for (const [key, ending] of Object.entries(ENDINGS || {})) {
    try {
      if (typeof ending.condition === 'function' && ending.condition(gameState)) {
        showEnding(ending);   //播结局
        return true;         //只放一个
      }
    } catch (e) {
      console.warn('ending condition error', e);
    }
  }
  return false;
}

// 结局展示
function showEnding(ending) {
  if (!ending) return;
  //Check行不行，别写错啊（但我好困）
  if (!(endingModal && endingTitle && endingText && nextEndingBtn && restartGameBtn)) {
    alert(
      (ending.title || '结局') + '\n\n' +
      (Array.isArray(ending.story) ? ending.story.join('\n\n') : ending.story)
    );
    location.reload();
    return;
  }

  let idx = 0;
  const parts = Array.isArray(ending.story) ? ending.story : [String(ending.story || '')];

  endingTitle.textContent = ending.title || '结局';
  endingText.innerHTML = '';
  gameContainer && (gameContainer.style.display = 'none');
  openModal(endingModal);

  // 设置按钮初始显示
  nextEndingBtn.style.display = 'inline-block';
  restartGameBtn.style.display = 'none';

  function update() {
    endingText.innerHTML = parts[idx] || '';
    nextEndingBtn.textContent = (idx >= parts.length - 1) ? '重新开始游戏' : '继续';
    if (idx >= parts.length - 1) {
      nextEndingBtn.style.display = 'none';
      restartGameBtn.style.display = 'inline-block';
    }
  }

  nextEndingBtn.onclick = () => {
    if (idx < parts.length - 1) {
      idx++;
      update();
    } else {
      location.reload();
    }
  };

  restartGameBtn.onclick = () => location.reload();
  update();
}

// =========================================================
// XIII. 存档系统（手动档 + 自动存档）
// =========================================================

const SAVE_SLOT_COUNT = 14;
const LEGACY_KEY = 'sakikoMutsumi_save';

function saveToSlot(slotKey) {
  try {
    const payload = { gameState: JSON.parse(JSON.stringify(gameState)), timestamp: new Date().toISOString() };
    localStorage.setItem(slotKey, JSON.stringify(payload));
    showNotification(`已保存至【${slotKey}】`);
    renderSaveSlots();
    return true;
  } catch (e) {
    console.error('存档失败', e);
    showNotification('存档失败（请检查浏览器存储）');
    return false;
  }
}

function loadFromSlot(slotKey) {
  const raw = localStorage.getItem(slotKey);
  if (!raw) { showNotification('该存档槽为空'); return false; }
  try {
    const loaded = JSON.parse(raw);
    // 全量替换 gameState 内容（保持对象引用不变）
    Object.keys(gameState).forEach(k => delete gameState[k]);
    Object.assign(gameState, loaded.gameState);
    clampValues();
    updateUI();
    // 显示游戏界面
    gameContainer && (gameContainer.style.display = 'block');
    mainMenu && (mainMenu.style.display = 'none');
    // 加载后展示当日晨间主线（如有）
    const hadMain = checkMainStoryEvents();
    if (!hadMain) storyManager.show(getMorningStory());
    generateActions();
    showNotification(`已加载存档（${new Date(loaded.timestamp).toLocaleString()}）`);
    saveMenu && (saveMenu.style.display = 'none');
    return true;
  } catch (e) {
    console.error('读档失败', e);
    showNotification('读取失败：存档数据损坏');
    return false;
  }
}

// renderSaveSlots 中文真的不懂叫什么
function renderSaveSlots() {
  if (!saveSlots) return;                // 若容器不存在则直接返回
  saveSlots.innerHTML = '';              // 清空旧内容

  // === 旧版快速存档 ===
  const legacyRaw = localStorage.getItem(LEGACY_KEY);
  if (legacyRaw) {
    try {
      const data = JSON.parse(legacyRaw);
      // 显示旧存档信息
      const span = document.createElement('span');
      span.className = 'save-slot';
      span.textContent = `快速存档（旧） • 第 ${data.gameState?.day || '?'} 天 •  ${data.timestamp ? new Date(data.timestamp).toLocaleString() : '未知'} `;

      //按钮
      const lbtn = document.createElement('button');
      lbtn.className = 'saveSlotsBtn';
      lbtn.textContent = '读取';
      lbtn.addEventListener('click', () => {
        if (confirm('读取快速存档将覆盖当前进度，确定？'))
          loadFromSlot(LEGACY_KEY);
      });

      //按钮
      const sbtn = document.createElement('button');
      sbtn.className = 'saveSlotsBtn';
      sbtn.textContent = '覆盖保存';
      sbtn.addEventListener('click', () => {
        if (confirm('覆盖快速存档？'))
          saveToSlot(LEGACY_KEY);
      });

      // 挂载到界面上
      span.appendChild(lbtn);
      span.appendChild(sbtn);
      saveSlots.appendChild(span);
      saveSlots.appendChild(document.createElement('br'));
    } catch (e) { /* 若旧存档解析失败则忽略 */ }
  }

  // === 编号存档槽（主存档手动的那个） ===
  for (let i = 1; i <= SAVE_SLOT_COUNT; i++) {
    const key = `saveSlot${i}`;                     // 存档键名
    const raw = localStorage.getItem(key);          // 读取本地存档数据
    let meta = '空槽';                              

    if (raw) {                                      // 若有存档则解析内容
      try {
        const info = JSON.parse(raw);
        meta = `第 ${info.gameState?.day || '?'} 天 • ${info.timestamp ? new Date(info.timestamp).toLocaleString() : '未知'}`;
      } catch (e) {
        meta = '损坏存档';                          // 解析失败的话
      }
    }

    // 创建存档行容器
    const lineSpan = document.createElement('div');
    lineSpan.className = 'save-slot';

    // 创建左侧信息区域
    const infoSpan = document.createElement('span');
    infoSpan.className = 'save-slot-info';
    infoSpan.textContent = `存档槽 ${i} • ${meta} `;

    // 创建右侧按钮容器
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'slot-actions';

    //按钮
    const lbtn = document.createElement('button');
    lbtn.className = 'saveSlotsBtn';
    lbtn.textContent = '读取';
    lbtn.addEventListener('click', () => {
      if (!raw) { showNotification('该槽为空'); return; }
      if (!confirm(`读取 存档槽 ${i} 将覆盖当前进度，确定读取？`)) return;
      loadFromSlot(key);
    });

    //按钮
    const sbtn = document.createElement('button');
    sbtn.className = 'saveSlotsBtn';
    sbtn.textContent = raw ? '覆盖保存' : '保存到此槽';
    sbtn.addEventListener('click', () => {
      if (raw && !confirm(`存档槽 ${i} 已有存档，覆盖吗？`)) return;
      saveToSlot(key);
    });

    //按钮
    const cbtn = document.createElement('button');
    cbtn.className = 'saveSlotsBtn';
    cbtn.textContent = '清空';
    cbtn.style.background = '#701818ff';
    cbtn.addEventListener('click', () => {
      if (!raw) { showNotification('此槽本来就是空的。'); return; }
      if (!confirm(`确定删除 存档槽 ${i} 的内容？此操作无法撤销。`)) return;
      localStorage.removeItem(key);
      renderSaveSlots();                            // 重新刷新显示
      showNotification(`已删除 存档槽 ${i}`);
    });

    // 将按钮添加到按钮容器
    actionsDiv.appendChild(lbtn);
    actionsDiv.appendChild(sbtn);
    actionsDiv.appendChild(cbtn);

    // 将信息区域和按钮容器添加到行容器
    lineSpan.appendChild(infoSpan);
    lineSpan.appendChild(actionsDiv);

    // 把整行添加到 saveSlots 区域
    saveSlots.appendChild(lineSpan);
    saveSlots.appendChild(document.createElement('br'));
  }

  // === 返回按钮逻辑 ===
  const backBtn = saveMenu ? saveMenu.querySelector('#saveMenuBack') : null;
  if (backBtn) {
    backBtn.onclick = () => {
      if (saveMenu) saveMenu.style.display = 'none';   // 关闭存档菜单

      // 回到游戏或主菜单（取决于当前状态）
      if (gameContainer && mainMenu) {
        if (mainMenu.style.display === 'none')
          gameContainer.style.display = 'block';
        else
          mainMenu.style.display = 'flex';
      }
    };
  }
}

// 打开存档菜单（fromMain = true 表示从主菜单进入）
function openSaveMenu(fromMain = true) {
  if (!saveMenu) return;                              

  if (fromMain) {                                     // 从主菜单打开
    mainMenu && (mainMenu.style.display = 'none');    
    gameContainer && (gameContainer.style.display = 'none'); // 
  } else {                                            // 从游戏中打开
    gameContainer && (gameContainer.style.display = 'none'); // 
  }

  saveMenu.style.display = 'flex';                    
  renderSaveSlots();                                  // 刷新并渲染所有存档槽状态
}

// 绑定按钮点击事件
function bindSaveLoadButtons() {
  if (saveBtn) saveBtn.onclick = () => openSaveMenu(false);   
  if (loadBtn) loadBtn.onclick = () => openSaveMenu(false);   
  if (loadGameBtn) loadGameBtn.onclick = () => openSaveMenu(true); 
}

// 启动时检测：是否存在任一存档 → 决定主菜单“读取游戏”按钮是否可点击
(function initSaveAvailability(){
  // 检查三类存档
  const hasSave =
    !!localStorage.getItem('autosave') ||                 
    !!localStorage.getItem(LEGACY_KEY) ||                
    Array.from({ length: SAVE_SLOT_COUNT })              
      .some((_, i) => !!localStorage.getItem(`saveSlot${i + 1}`));

  // 没有存档，禁用主菜单“读取游戏”按钮
  if (loadGameBtn) loadGameBtn.disabled = !hasSave;
})();

// =========================================================
// XIV. 便捷键：Esc
// =========================================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { 
    [
      introModal,         
      statsIntroModal,    
      tutorialModal,      
      dialogPopup,        
      blindBoxModal,     
      endingModal         
    ].forEach(m => {
      // 若该 modal 存在就则关闭
      if (m && m.style.display === 'flex')
        closeModal(m);
    });
  }
});

// =========================================================
// XV. 启动初始化
// =========================================================
window.addEventListener('load', () => {
  //修正初始加同步
  clampValues();  
  updateUI();      

  //绑定存档/读档按钮
  bindSaveLoadButtons(); 
});

if (exitGameBtn) {
  exitGameBtn.addEventListener('click', () => {
    if (confirm('确定要退出游戏吗？未保存的进度将丢失。')) {
      location.reload(); 
    }
  });
}

if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    if (confirm('确定要返回主菜单？当前进度将不会自动保存。')) {
      showNotification('已返回主菜单');
      if (gameContainer) gameContainer.style.display = 'none';
      if (mainMenu) mainMenu.style.display = 'flex';
    }
  });
}