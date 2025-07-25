// ==UserScript==
// @name         巴哈姆特_新版B頁板務功能New
// @namespace    Bee10301
// @version      8.5
// @description  巴哈姆特哈拉區新體驗。
// @author       Bee10301
// @match        https://removed.www.gamer.com.tw/
// @match        https://removed.www.gamer.com.tw/index2.php*
// @match        https://forum.gamer.com.tw/B.php?*
// @match        https://forum.gamer.com.tw/C.php?*
// @match        httos://forum.gamer.com.tw/2025/?bsn*
// @homepage     https://home.gamer.com.tw/home.php?owner=bee10301
// @icon         https://home.gamer.com.tw/favicon.ico
// @connect      *
// @grant        GM_xmlhttpRequest
// @license      GPL
// @downloadURL  https://gamercomtwnew.bee.moe/gamer.olduser.js
// @updateURL    https://gamercomtwnew.bee.moe/gamer.oldmeta.js
// ==/UserScript==
// noinspection SpellCheckingInspection,JSUnresolvedReference,BadExpressionStatementJS

(async function () {
  ("use strict");
  let newVer = await detectMode();
  checkFirstRun();
  await addSettingElement(newVer);
  await worker_bPage(newVer);
  await worker_cPage(newVer);
  //worker_home();
  checkTips(newVer);
  reportAlert(newVer);
})();

async function detectMode() {
  if (document.querySelector(".forum-nav-main") !== null) {
    // 使用事件監聽，等待頁面 .forum-list-normal 元素出現才繼續
    await new Promise((resolve) => {
      const observer = new MutationObserver((mutations) => {
        if (document.querySelector(".forum-list-normal")) {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
    // c page admin
    let styleSheet = document.createElement("style");
    document.head.appendChild(styleSheet);
    let sheet = styleSheet.sheet;
    sheet.insertRule(
      ".c-section:has(div.c-section__main.managertools) { position: sticky; bottom: 0; right: 0; z-index: 100; transform: translateX(50vw); transition:0.5s cubic-bezier(0,.67,0,1.05); }",
      0
    );
    sheet.insertRule(
      ".c-section:has(div.c-section__main.managertools):hover { transform: translateX(25vw);}",
      0
    );

    sheet.insertRule(
      ".c-section:has(div.c-section__main.c-editor.c-quick-reply) { position: sticky; bottom: 50px; right: 0; z-index: 99; transform: translateX(50vw);transition:0.5s cubic-bezier(0,.67,0,1.05);  }",
      0
    );
    sheet.insertRule(
      ".c-section:has(div.c-section__main.c-editor.c-quick-reply):hover { transform: translateX(20vw); }",
      0
    );
    // hide preview box
    const previewBox = document.getElementById("article-content-box");
    previewBox.style.width = "0%"; //localStorage.getItem("preview_size") || "80%";
    previewBox.style.transition = "0.5s cubic-bezier(0,.67,0,1.05)";
    previewBox.style.zIndex = "999";
    previewBox.style.transform =
      localStorage.getItem("preview_LR") === "true"
        ? "translateX(100%)"
        : "translateX(-150%)";
    // 在 main-nav 後面新增一個元素，寬度滿版，absolute位置，這是一個用來覆蓋全畫面的布幕
    const topBarCover = document.createElement("div");
    topBarCover.className = "bee-top-bar-cover";
    topBarCover.style.width = "100vw";
    topBarCover.style.height = "0%";
    topBarCover.style.backgroundColor = "var(--f1-bg)";
    topBarCover.style.position = "absolute";
    topBarCover.style.top = "0";
    topBarCover.style.left = "0";
    topBarCover.style.transition = "0.5s cubic-bezier(0,.67,0,1.05)";
    topBarCover.style.zIndex = "990";
    topBarCover.addEventListener("click", (e) => {
      previewBox.style.transform =
        localStorage.getItem("preview_LR") === "true"
          ? "translateX(100%)"
          : "translateX(-150%)";
      //e.preventDefault();
      topBarCover.style.height = "0%";
      topBarCover.style.opacity = "1";
      return false;
    });
    const topBar = document.querySelector(".main-nav");
    topBar.parentNode.insertBefore(topBarCover, topBar.nextSibling);
    document.querySelector(".main-nav__row").style.height = "auto";
    return true;
  }
  return false;
}

function checkFirstRun(reset = false) {
  console.log("[INFO] Init data");
  // add_function > 標題後方插入功能
  // preview_auto > 一律即時瀏覽（覆寫文章換頁）
  // preview_wait_load > 即時瀏覽：是否等待載入完成才跳出顯示
  // preview_size > 即時瀏覽視窗的大小
  // new_design > 自適型版面（根據下方自定比例適應）
  // new_design_box > 顯示區域佔比（文章顯示區+聊天室區的整體範圍）
  // new_design_box_Left > 文章佔比（佔上個設定「顯示區域」範圍內的比例）
  // new_design_box_Right > 聊天室佔比（佔上方設定「顯示區域」範圍內的比例）
  // new_design_LRSwitch > 左右對調（聊天室在左方）
  // bee_select_color > 勾選文章時的顏色（可含有透明度屬性）
  // preview_LR > 即時瀏覽視窗的位置
  const settingsB = [
    { key: "isFirstRun", defaultValue: "false" },
    {
      key: "add_function",
      defaultValue: "true",
    },
    {
      key: "preview_auto",
      defaultValue: "true",
    },
    {
      key: "preview_wait_load",
      defaultValue: "false",
    },
    {
      key: "preview_size",
      defaultValue: "65%",
    },
    {
      key: "new_design",
      defaultValue: "true",
    },
    {
      key: "new_design_box",
      defaultValue: "80%",
    },
    {
      key: "new_design_box_Left",
      defaultValue: "65%",
    },
    {
      key: "new_design_box_Right",
      defaultValue: "18%",
    },
    {
      key: "new_design_LRSwitch",
      defaultValue: "false",
    },
    {
      key: "bee_select_color",
      defaultValue: "#000000b3",
    },
    {
      key: "addBorderInPicMode",
      defaultValue: "true",
    },
    {
      key: "showTips",
      defaultValue: "true",
    },
    {
      key: "preview_LR",
      defaultValue: "true",
    },
    {
      key: "showAbuse",
      defaultValue: "true",
    },
    {
      key: "addSummaryBtn",
      defaultValue: "true",
    },
    {
      key: "oaiBaseUrl",
      defaultValue: "https://api.openai.com/v1/chat/completions",
    },
    {
      key: "oaiKey",
      defaultValue: "sk-yourKey",
    },
    {
      key: "oaiModel",
      defaultValue: "gpt-3.5-turbo",
    },
    {
      key: "oaiPrompt",
      defaultValue: `## workflow
1. 總結：精確的讀懂和理解文章，然後用一句話脈絡清晰的語句，總結出[文章的主旨]。
2. 提煉重點：根據文章的邏輯和結構，清楚列出文章的主要論點，並按照下方範例的格式輸出。
 總結：
 - 要點1：
 - 要點2：
 ...(依情況增加或減少要點)

## MUST/IMPORTANT/RULES
- 不能添加其他個人觀點或註釋。
- 使用繁體中文
`,
    },
    {
      key: "oaiPromptCmd",
      defaultValue:
        "以下是一段群組聊天的對話，總結對話中的話題，用條列式列出使用者的想法。\n## workflow \n 1. 整理話題：理解各個使用者討論的話題並以話題為單位整理出整串對話的話題 \n 2. 將相同話題中，對同一件事有相似想法的對話整理在一起(例如 `@user1/@user2：認為太貴了`) ，不同看法則單獨列出。\n 3. 輸出：把冗餘贅字優化，但保留具體描述。(劣例:`@user1/@user2：提及角色在世界觀中的地位和特徵` 在這個例子中沒有具體描述提即了什麼樣的地位或特徵)。使用者以 @id 標記並且不再添加其他md語法。 \n ## MUST/IMPORTANT/RULES \n- 不能添加其他個人觀點或註釋。\n- 使用繁體中文\n",
    },
    {
      key: "oaiPromptChat",
      defaultValue:
        "根據文章內容，使用繁體中文流暢語言，簡潔的回答使用者的問題。",
    },
    {
      key: "custom_oaiPrompt",
      defaultValue: "",
    },
    {
      key: "custom_oaiPromptCmd",
      defaultValue: "",
    },
    {
      key: "custom_oaiPromptChat",
      defaultValue: "",
    },
    {
      key: "oaiPromptSystemMode",
      defaultValue: "true",
    },
    {
      key: "oaiPromptDate",
      defaultValue: "20241101",
    },
    {
      key: "oaiPromptUpdateDate",
      defaultValue: "20241101",
    },
    {
      key: "oaiPromptUpdateURL",
      defaultValue: "https://gamercomtwnew.bee.moe/gamer.prompts.json",
    },
    {
      key: "oaiPromptUpdateSleep",
      defaultValue: "1",
    },
    {
      // 清爽模式
      key: "cleanMode",
      defaultValue: "false",
    },
    {
      // 清爽模式文章列表大小
      key: "cleanModeSize",
      defaultValue: "4rem",
    },
    // Add other settings as needed
  ];

  const settingsHome = [
    { key: "homeStyleSwitch", defaultValue: "true" },
    {
      key: "homeTips",
      defaultValue: "true",
    },
  ];

  let settings =
    document.getElementById("article-content-box") !== null
      ? settingsB
      : settingsHome;
  settings.forEach((setting) => {
    if (
      localStorage.getItem(setting.key) === "" ||
      localStorage.getItem(setting.key) === null ||
      reset === true
    ) {
      localStorage.setItem(setting.key, setting.defaultValue);
    }
  });
  if (window.location.href.includes("forum.gamer.com.tw/B.php")) {
    if (
      localStorage.getItem("oaiPromptUpdateURL") ===
      "https://gamercomtwnew.bee.moe/gamer.prompts.js"
    ) {
      localStorage.setItem(
        "oaiPromptUpdateURL",
        "https://gamercomtwnew.bee.moe/gamer.prompts.json"
      );
    }
  }
}

function checkTips() {
  if (window.location.href.includes("forum.gamer.com.tw/B.php")) {
    if (localStorage.getItem("showTips") === "true") {
      loadTips();
      localStorage.setItem("showTips", "false");
    }
  }

  if (window.location.href.includes("www.gamer.com.tw")) {
    if (localStorage.getItem("homeTips") === "true") {
      loadTips_home();
      localStorage.setItem("homeTips", "false");
    }
  }
}

async function addSettingElement(newVer) {
  let navAddTag;
  let settingsWarp;
  let navAdd;
  let lastManagementItem;
  // 插入設定元素
  lastManagementItem = document.createElement("div");
  lastManagementItem.className = "forum-filter-box beeSettingWarp";
  lastManagementItem.style.maxHeight = "0px";
  lastManagementItem.style.overflow = "hidden auto";
  if (newVer) {
    // 要插入按鈕的父元素
    navAddTag = document.querySelector(".forum-nav-main");
    // 插入擴展選單的父元素
    settingsWarp = document.querySelector(".forum-header");
    // 選單元素
    // <a class="forum-nav-link">插件設定</a>
    navAdd = document.createElement("li");
    navAdd.className = "forum-nav-link forum-nav-rules beeSettingTag";
    navAdd.innerHTML = "<a>插件設定</a>";
    // 新版展開選單
    navAdd.addEventListener("click", function () {
      // toggle
      if (lastManagementItem.style.maxHeight === "0px") {
        lastManagementItem.style.maxHeight = "60vh";
        lastManagementItem.style.opacity = "1";
      } else {
        lastManagementItem.style.maxHeight = "0px";
        lastManagementItem.style.opacity = "0";
      }
    });
    // 額外提示
    const sectionTitle = document.createElement("h3");
    sectionTitle.className = "section-title";
    sectionTitle.textContent = "滾動下拉還有哦！";
    sectionTitle.style.margin = "0.6rem 0 0.7rem 0.7rem";
    lastManagementItem.appendChild(sectionTitle);

    //return;
  } else if (document.querySelector(".b-list") !== null) {
    // 要插入按鈕的父元素
    navAddTag = document.querySelector(".BH-menuE");
    // 插入擴展選單的父元素
    settingsWarp = document.querySelector(".b-list-wrap");
    // 選單元素
    navAdd = document.createElement("li");
    navAdd.className = "beeSettingTag";
    navAdd.innerHTML = "<a>插件設定</a>";
    // 舊版展開選單
    navAdd.addEventListener("click", function () {
      let sectionTitleWarp = document.querySelector(".beeSettingWarp");
      popElement(sectionTitleWarp, "toggle", "ud");
      scrollIntoBee(
        newVer
          ? document.getElementById("BH-master")
          : document.querySelector(".b-list-wrap"),
        7
      );
    });
    // 舊版額外提示
    const sectionTitle = document.createElement("h3");
    sectionTitle.className = "section-title";
    sectionTitle.textContent =
      "插件設定（再點一次上方的【插件設定】即可返回【文章列表】）";
    sectionTitle.style.margin = "0.6rem 0 0.7rem 0.7rem";
    lastManagementItem.appendChild(sectionTitle);

    //return;
  } else {
    return;
  }

  navAddTag.appendChild(navAdd);

  // 新版只能即時瀏覽，但新增清爽模式
  if (!newVer) {
    lastManagementItem.appendChild(
      createItemCard("add_function", "標題後方插入功能按鈕")
    );
    lastManagementItem.appendChild(
      createItemCard("preview_auto", "點擊文章時使用即時瀏覽")
    );
    lastManagementItem.appendChild(
      createItemCard(null, null, {
        inputId: "preview_size",
        labelText: "　└　即時瀏覽視窗的大小",
      })
    );
  } else {
    lastManagementItem.appendChild(
      createItemCard("cleanMode", "清爽模式（隱藏文章描述和縮圖）")
    );
    lastManagementItem.appendChild(
      createItemCard(null, null, {
        inputId: "cleanModeSize",
        labelText: "　└　清爽模式文章清單大小",
      })
    );
  }
  lastManagementItem.appendChild(
    createItemCard("preview_LR", "即時瀏覽從右方彈出（取消則從左）")
  );
  lastManagementItem.appendChild(
    createItemCard("new_design", "自訂板面大小（附加浮動型聊天室）")
  );
  lastManagementItem.appendChild(
    createItemCard(null, null, {
      inputId: "new_design_box",
      labelText: "　└　整體顯示區域佔比（文章+聊天室佔整個畫面的比例，< 100%）",
    })
  );
  lastManagementItem.appendChild(
    createItemCard(null, null, {
      inputId: "new_design_box_Left",
      labelText: "　　　├　文章佔比（與聊天室佔比總和 <= 100%）",
    })
  );
  lastManagementItem.appendChild(
    createItemCard(null, null, {
      inputId: "new_design_box_Right",
      labelText: "　　　└　聊天室佔比",
    })
  );
  lastManagementItem.appendChild(
    createItemCard("new_design_LRSwitch", "聊天室在左方")
  );
  if (!newVer) {
    lastManagementItem.appendChild(
      createItemCard("addBorderInPicMode", "縮圖列表模式中，加上分隔線")
    );

    lastManagementItem.appendChild(
      createItemCard("showAbuse", "有檢舉時，自動以即時瀏覽開啟")
    );
  }
  //summary
  lastManagementItem.appendChild(
    createItemCard(
      "addSummaryBtn",
      "跳過樓層按鈕/AI總結（AI功能需自備KEY填入下方）"
    )
  );
  lastManagementItem.appendChild(
    createItemCard(null, null, {
      inputId: "oaiBaseUrl",
      labelText: "　├　oai URL",
    })
  );
  lastManagementItem.appendChild(
    createItemCard(null, null, {
      inputId: "oaiModel",
      labelText: "　├　oai model",
    })
  );
  lastManagementItem.appendChild(
    createItemCard(null, null, {
      inputId: "oaiKey",
      labelText: "　├　oai key",
    })
  );
  lastManagementItem.appendChild(
    createItemCard(null, null, {
      inputId: "custom_oaiPrompt",
      labelText: "　├　「懶人包」提示詞（留空=預設）",
    })
  );
  lastManagementItem.appendChild(
    createItemCard(null, null, {
      inputId: "custom_oaiPromptCmd",
      labelText: "　├　「留言統整」自訂提示詞（留空=預設）",
    })
  );
  lastManagementItem.appendChild(
    createItemCard(null, null, {
      inputId: "custom_oaiPromptChat",
      labelText: "　├　「問問」自訂提示詞（留空=預設）",
    })
  );
  lastManagementItem.appendChild(
    createItemCard("oaiPromptSystemMode", "├　自訂提示詞使用 system 模式")
  );
  lastManagementItem.appendChild(
    createItemCard(null, null, {
      inputId: "oaiPromptUpdateURL",
      labelText: "　└　oai prompt settings URL",
    })
  );
  lastManagementItem.appendChild(createItemCard("showTips", "重新觀看TIPs"));
  // add one btn in a div ,click to reload the page
  const reloadBtn = document.createElement("button");
  reloadBtn.textContent = "重整頁面以生效";
  if (!newVer) {
    reloadBtn.style.margin = "0.5rem 0 0.7rem 0.7rem";
  }
  reloadBtn.style.color = "white";
  reloadBtn.addEventListener("click", () => {
    location.reload();
  });
  const reloadBtnDiv = document.createElement("div");
  reloadBtnDiv.className = newVer ? "btn btn-primary" : "BH-rbox BH-qabox1";
  reloadBtnDiv.appendChild(reloadBtn);
  lastManagementItem.appendChild(reloadBtnDiv);
  if (newVer) {
    settingsWarp.appendChild(lastManagementItem);
  } else {
    settingsWarp.insertBefore(lastManagementItem, settingsWarp.firstChild);
  }
  await popElementInit(lastManagementItem, false, "ud");
}

// 項目卡函數
function createItemCard(inputId, labelText, additionalContent = null) {
  // const isDarkTheme =
  //   window.getComputedStyle(document.getElementById("BH-menu-path"))
  //     .backgroundColor === "rgb(28, 28, 28)";
  const itemCard = document.createElement("div");
  itemCard.className =
    "item-card management_guild-check single-choice forum-filter-group";

  const checkGroup = document.createElement("div");
  checkGroup.className = "check-group";
  checkGroup.style.margin = "0rem 0 0.1rem 0.7rem";

  if (inputId) {
    const input = document.createElement("input");
    input.id = inputId;
    input.type = "checkbox";

    // 如果 localStorage 有儲存的值，則設置為該值，否則預設為 checked
    input.checked = localStorage.getItem(inputId) === "true";

    const label = document.createElement("label");
    label.htmlFor = inputId;
    label.className = "is-active";

    const labelIcon = document.createElement("div");
    labelIcon.className = "label-icon";
    const icon = document.createElement("i");
    icon.className = "fa fa-check";
    labelIcon.appendChild(icon);

    const h6 = document.createElement("h6");
    h6.textContent = labelText;
    h6.style.display = "inline-block";
    h6.style.color = "var(--primary-text)"; //isDarkTheme ? "#C7C6CB" : "#117e96";
    h6.style.fontSize = "100%";
    label.appendChild(labelIcon);
    label.appendChild(h6);

    checkGroup.appendChild(input);
    checkGroup.appendChild(label);

    // 添加 input 事件監聽器，將值保存到 localStorage
    input.addEventListener("input", function () {
      localStorage.setItem(inputId, this.checked.toString());
    });
  }

  if (additionalContent) {
    const h6 = document.createElement("h6");
    h6.textContent = additionalContent.labelText;
    h6.style.display = "inline-block";
    checkGroup.appendChild(h6);

    const input = document.createElement("input");
    input.className = "form-control";
    input.id = additionalContent.inputId;
    input.type = "text";
    input.size = 25;
    input.style.margin = "0px";
    input.style.width = additionalContent.inputId.startsWith("custom_")
      ? "auto"
      : "70px";

    checkGroup.appendChild(input);
    // 如果 localStorage 有儲存的值，則設置為該值
    input.value = localStorage.getItem(additionalContent.inputId) || "";
    // 添加 input 事件監聽器，將值保存到 localStorage
    input.addEventListener("input", function () {
      localStorage.setItem(additionalContent.inputId, this.value);
    });
  }

  itemCard.appendChild(checkGroup);
  return itemCard;
}

async function worker_cPage() {
  if (!window.location.href.includes("forum.gamer.com.tw/C.php")) {
    return;
  }
  let styleSheet = document.createElement("style");
  document.head.appendChild(styleSheet);
  let sheet = styleSheet.sheet;
  sheet.insertRule(
    ".managertools { position: fixed; bottom: 0; right: 0; z-index: 100; }",
    0
  );
  if (localStorage.getItem("addSummaryBtn") === "false") {
    return;
  }
  await postAddBtn();
}

async function worker_bPage(newVer) {
  if (
    !document.querySelector(".forum-list-normal") &&
    !document.querySelector(".b-list__head")
  ) {
    return;
  }
  bPage_previewAuto(newVer);
  if (newVer) {
    if (localStorage.getItem("cleanMode") === "true") {
      bPage_cleanMode();
    }
    // remove display none from #BH-slave
    document.getElementById("BH-slave").style.display = "block";
    if (localStorage.getItem("new_design_LRSwitch") === "true") {
      document.getElementById("BH-master").style.order = "2";
      const BHSlave = document.getElementById("BH-slave");
      BHSlave.style.order = "1";
      BHSlave.style.marginLeft = "0";
      BHSlave.style.marginRight = "12px";
    }
  } else if (document.querySelector(".b-list__head") !== null) {
    // 只有舊版需要frame，新版已內建 preview
    if (localStorage.getItem("preview_auto") === "true") {
      await bPage_addFrame();
    }
    bPage_addMenu();
    bPage_new_checkbox();
    if (localStorage.getItem("new_design_LRSwitch") === "true") {
      document.getElementById("BH-master").style.float = "right";
      document.getElementById("BH-slave").style.float = "left";
    }
    if (localStorage.getItem("add_function") === "true") {
      bPage_addFunction();
    }
    //add border in pic mode must be excute after, because previewAuto does change the structure
    if (localStorage.getItem("addBorderInPicMode") === "true") {
      bPage_addBorderInPicMode();
    }
  }

  if (localStorage.getItem("new_design") === "true") {
    bPage_new_design(newVer);
  }
}

function bPage_cleanMode() {
  // remove all .forum-item-desc and .forum-item-thumbnail elements;
  const removeElements = document.querySelectorAll(
    ".forum-item-desc, .forum-item-thumbnail"
  );
  removeElements.forEach((element) => {
    element.remove();
  });
  // remove padding for .forum-list-item, set min-height
  const forumListItems = document.querySelectorAll(".forum-list-item");
  forumListItems.forEach((item) => {
    item.style.padding = "0";
    item.style.minHeight = localStorage.getItem("cleanModeSize");
  });
}

function worker_home() {
  if (
    !window.location.href.includes("www.gamer.com.tw") ||
    !document.querySelectorAll("div.BA-lbox.BA-lbox3")
  ) {
    return;
  }
  // add btn
  const baServeElement = document.querySelector(".BA-serve");
  const newElement = document.createElement("li");
  newElement.innerHTML = `<a id="homeStyleSwitch" class="gtm-indexservice" title="樣式切換"><img style="pointer-events: none;" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'%3E%3Cpath fill='rgb(32,148,255)' d='M16 16v-4l5 5l-5 5v-4H4v-2zM8 2v3.999L20 6v2H8v4L3 7z'/%3E%3C/svg%3E">首頁滿版切換</a>`;
  baServeElement.appendChild(newElement);
  // 切換 localStorage 中 homeStyleSwitch 的值
  newElement.addEventListener("click", () => {
    const currentValue = localStorage.getItem("homeStyleSwitch") === "true";
    localStorage.setItem("homeStyleSwitch", (!currentValue).toString());
    location.reload(); // 刷新頁面以應用更改
  });
  // if active
  if (localStorage.getItem("homeStyleSwitch") === "true") {
    // Get the elements
    const hotboardContainer = document.getElementById("hotboardContainer");
    const guildContainer = document.getElementById("guildContainer");
    const hothalaContainer = document.getElementById("hothalaContainer");
    // Append the elements to the "hothalaContainer"
    hothalaContainer.appendChild(hotboardContainer);
    hothalaContainer.appendChild(guildContainer);

    // 2nd left nav
    const bahaStoreContainer = document.querySelectorAll(
      "div.BA-lbox.BA-lbox3"
    )[0];
    const bahaAnimeContainer = document.querySelectorAll(
      "div.BA-lbox.BA-lbox3"
    )[1];
    let secondDivLeft = document.createElement("div");
    secondDivLeft.className = "BA-left";
    secondDivLeft.style.flex = "0 0 11em";
    secondDivLeft.style.margin = "0 0 0 1em";
    secondDivLeft.appendChild(document.querySelectorAll("h1.BA-ltitle")[1]);
    secondDivLeft.appendChild(bahaAnimeContainer);
    secondDivLeft.appendChild(document.querySelectorAll("h1.BA-ltitle")[0]);
    secondDivLeft.appendChild(bahaStoreContainer);
    document
      .querySelectorAll("div.BA-wrapper.BA-main")[0]
      .insertBefore(
        secondDivLeft,
        document.querySelectorAll("div.BA-center")[0]
      );

    // Create a new style element
    const newStyle = document.createElement("style");

    // Set the CSS content
    newStyle.textContent = `
/* 父容器設置 */
.BA-wrapper.BA-main {
  display: flex;
  flex-wrap: wrap;
  width: auto;
}

/* 第一層左側固定寬度 */
.BA-left {
  flex: 0 0 11em;
}

/* 第一層右側容器 */
.BA-center {
  flex: 1;  /* 占據剩餘所有空間 */
  display: flex;  /* 使其內部也成為flex容器 */
  flex-wrap: wrap;  /* 允許內部元素換行 */
}

#gnnContainer {
  flex: 0 0 45%;
  margin: 0 1% 2% 1%;
  order: 1;
}

#hothalaContainer {
  flex: 45%;
  margin: 0 1% 2% 1%;
  order: 2;
}

#homeContainer {
  flex: 45%;
  margin: 0 1% 2% 1%;
  order: 3;
}
#buyContainer {
  flex: 0 0 45%;
  margin: 0 1% 2% 1%;
  order: 4;
}
#liveContainer {
  flex: 45%;
  margin: 0 1% 2% 1%;
  order: 5;
}
#gamecrazyContainer {
  flex: 0 0 45%;
  margin: 0 1% 2% 1%;
  order: 6;
}
.BA-cbox7 p{
  text-align: left !important;
}
`;

    // Append the style element to the head of the document
    document.head.appendChild(newStyle);
  }
}

async function bPage_addFrame() {
  //frame
  let beePreviewWd = document.createElement("div");
  beePreviewWd.className = "bee_preview_wd";
  beePreviewWd.style.height = "100%";
  //beePreviewWd.style.width = '0rem';
  beePreviewWd.style.width = localStorage.getItem("preview_size");
  beePreviewWd.style.transform = "scaleX(" + 0 + ")";
  beePreviewWd.style.zIndex = "100";
  beePreviewWd.style.position = "fixed";
  beePreviewWd.style.top = "0px";
  if (localStorage.getItem("preview_LR") === "true") {
    beePreviewWd.style.right = "1%";
  } else {
    beePreviewWd.style.left = "1%";
  }
  //beePreviewWd.style.transition = 'all 0.5s cubic-bezier(0.21, 0.3, 0.18, 1.37) 0s';
  //document.body.appendChild(beePreviewWd);

  let beeFrame = document.createElement("iframe");
  beeFrame.id = "bee_frame";
  beeFrame.title = "bee_frame";
  beeFrame.src = "";
  //beeFrame.style.transition = 'all 0.5s cubic-bezier(0.21, 0.3, 0.18, 1.37) 0s';
  beeFrame.style.border = "0em solid rgb(170, 50, 220, 0)";
  beeFrame.width = "100%";
  beeFrame.height = "100%";
  //document.querySelector('.bee_preview_wd').appendChild(beeFrame);
  beePreviewWd.appendChild(beeFrame);
  document.body.appendChild(beePreviewWd);
  await popElementInit(
    beePreviewWd,
    false,
    localStorage.getItem("preview_LR") === "true" ? "rl" : "lr",
    false
  );

  //close frame by top menu
  let BHMenuPath = document.querySelector("#BH-menu-path");
  BHMenuPath.style.transition =
    "all 0.5s cubic-bezier(0.21, 0.3, 0.18, 1.37) 0s";
  BHMenuPath.style.height = "40px";
  BHMenuPath.style.opacity = "1";
  //BHMenuPath.style.backgroundColor = '#0e4355cc';

  BHMenuPath.addEventListener("click", () => {
    /*document.querySelector('.bee_preview_wd').style.transform = 'translateX(100%)';
        document.querySelector('.bee_preview_wd').style.opacity = '0';*/
    popElement(
      document.querySelector(".bee_preview_wd"),
      "false",
      localStorage.getItem("preview_LR") === "true" ? "rl" : "lr"
    );
    BHMenuPath.style.height = "40px";
    BHMenuPath.style.opacity = "1";
  });
}

function bPage_addMenu() {
  try {
    // 獲取 .managertools 元素
    const managertools = document.querySelector(".managertools");

    // 創建 .b-manager 容器
    const bManagerDiv = document.createElement("div");
    bManagerDiv.className = "b-manager managertools bee_manager";
    bManagerDiv.style.zIndex = "100";
    bManagerDiv.style.position = "fixed";
    bManagerDiv.style.width = "auto";

    // 創建 .checkbox 和 <label> 元素
    const checkboxDiv = document.createElement("div");
    checkboxDiv.className = "checkbox";
    const label = document.createElement("label");
    label.setAttribute("for", "check");

    // 將 .checkbox 和 <label> 插入到 .b-manager 容器中
    bManagerDiv.appendChild(checkboxDiv);
    bManagerDiv.appendChild(label);

    // 創建並插入包含按鈕的 .bee 容器
    const buttonIndexes = [
      [0, 3, 7],
      [2, 4],
      [1, 8],
      [5, 6],
    ];

    buttonIndexes.forEach((indexes) => {
      const beeDiv = document.createElement("div");
      beeDiv.className = "bee";
      beeDiv.style.padding = "5px";

      indexes.forEach((index) => {
        const button = managertools
          .querySelectorAll("button")
          [index].cloneNode(true);
        beeDiv.appendChild(button);
      });

      bManagerDiv.appendChild(beeDiv);
    });

    // 將 .b-manager 容器添加到 .managertools 元素中
    managertools.appendChild(bManagerDiv);

    const all_links = document.querySelectorAll(
      "#BH-master > form > div > table > tbody > tr > td.b-list__main > a"
    );
    Array.from(all_links).forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.stopPropagation();
      });
    });
    const all_blocks_pic_mode = document.querySelectorAll(
      "#BH-master > form > div > table > tbody > tr > td.b-list__main"
    );
    Array.from(all_blocks_pic_mode).forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.stopPropagation();
      });
    });
  } catch (e) {}
}

function bPage_new_checkbox() {
  let all_title;

  if (document.querySelectorAll(".imglist-text").length === 0) {
    all_title = document.getElementsByClassName("b-list__main");
  } else {
    all_title = document.getElementsByClassName("b-list__main");
  }

  //const all_title_link = document.getElementsByClassName("b-list__main__title");
  let temp_elements_checkbox;
  try {
    temp_elements_checkbox = document.getElementsByName("jsn[]");
  } catch (e) {}
  for (let i = 0; i < all_title.length; i++) {
    //prevent child trigger
    let children = all_title[i].querySelectorAll("*");
    children.forEach(function (child) {
      child.addEventListener("click", function (event) {
        event.stopPropagation();
      });
    });

    try {
      temp_elements_checkbox[i].checked = false;
    } catch (e) {}

    // 添加 onclick 事件
    all_title[i].onclick = function (e) {
      // 如果子元素有 b-list__tile 或 imglist-text 類別，則觸發
      if (
        all_title[i].querySelector(".b-list__main__title") !== null ||
        all_title[i].querySelector(".imglist-text") !== null
      ) {
        // 如果當前有
        try {
          document.querySelector(".bee_manager").style.display = "none";
        } catch (e) {}
        // 獲取內部 HTML
        let temp_matcher = this.innerHTML;
        // 獲取 snA
        temp_matcher = temp_matcher.match(/snA=(\d*)/)[1];
        let haveCheckedBox = false;
        for (let i2 = 0; i2 < temp_elements_checkbox.length; i2++) {
          if (temp_elements_checkbox[i2].value === temp_matcher) {
            if (temp_elements_checkbox[i2].checked) {
              temp_elements_checkbox[i2].checked = false;
              this.style.backgroundColor = "";
            } else {
              temp_elements_checkbox[i2].checked = true;
              this.style.backgroundColor =
                localStorage.getItem("bee_select_color");
            }
          }
          if (temp_elements_checkbox[i2].checked) {
            haveCheckedBox = true;
          }
        }
        if (haveCheckedBox) {
          let beeManager = document.querySelector(".bee_manager");
          beeManager.style.left =
            e.clientX + 50 /*+ document.documentElement.scrollLeft */ + `px`;
          beeManager.style.top =
            e.clientY - 170 /*+ document.documentElement.scrollTop */ + `px`;
          beeManager.style.display = "block";
        }
      }
    };

    // 右鍵點擊（*只在元素上）
    /*all_title[i].oncontextmenu = () => {
            let beeManager = document.querySelector(".bee_manager");
            beeManager.style.left = `${BmouseX}px`;
            beeManager.style.top = `${BmouseY - temp_scroll}px`;
            beeManager.style.display = 'block';

            // 右鍵點擊返回
            return false;
        };*/
  }
}

function bPage_new_design(newVer) {
  const BHSlave = document.getElementById("BH-slave");
  const testReportBtn = document.querySelector(".fixed-right");
  BHSlave.style.width = localStorage.getItem("new_design_box_Right");
  BHSlave.style.maxWidth = "100vw";
  document.getElementById("BH-master").style.width = localStorage.getItem(
    "new_design_box_Left"
  );
  if (newVer) {
    const forumListBox = document.getElementById("forum-list-box");
    forumListBox.style.left = "50%";
    forumListBox.style.transform = "translateX(-50%)";
    // title list
    document.querySelector(".forum-box.split .forum-list-box").style.width =
      localStorage.getItem("new_design_box");
    // chat
    BHSlave.style.position = "fixed";
    BHSlave.style.bottom = "0%";
    if (localStorage.getItem("new_design_LRSwitch") === "true") {
      BHSlave.style.left = "0%";
    } else {
      BHSlave.style.right = "0%";
      testReportBtn.style.left = "64px";
      // remove right
      testReportBtn.style.right = "unset";
    }
  } else {
    // 以下為設置元素的寬度
    document.getElementById("BH-wrapper").style.width =
      localStorage.getItem("new_design_box");
  }
}

function bPage_addFunction() {
  const all_title = document.getElementsByClassName("b-list__main");
  const all_title_link = document.getElementsByClassName("b-list__main__title");

  // 創建一個新的 <td> 元素並插入到 .b-list__filter 元素後面
  const newTd = document.createElement("td");
  document
    .querySelector(".b-list__filter")
    .insertAdjacentElement("afterend", newTd);

  for (let i2 = 0; i2 < all_title.length; i2++) {
    const isDarkTheme =
      window.getComputedStyle(document.getElementById("BH-menu-path"))
        .backgroundColor === "rgb(28, 28, 28)";
    const hrefValue = all_title_link[i2].getAttribute("href");

    // 創建外層 <td> 元素
    const td = document.createElement("td");
    td.style.width = "auto";

    // 創建各個按鈕的容器和圖標
    const buttons = [
      {
        title: "快速瀏覽",
        class: "bee_preview",
        icon: "fullscreen",
        onclick: () => openInFrame("https://forum.gamer.com.tw/" + hrefValue),
      },
      {
        title: "開新視窗",
        class: "bee_open_new_wd",
        icon: "open_in_new",
        onclick: () => window.open(hrefValue),
      },
      {
        title: "複製連結",
        class: "bee_link",
        icon: "link",
        onclick: () =>
          navigator.clipboard.writeText(
            "https://forum.gamer.com.tw/" + hrefValue
          ),
      },
    ];

    buttons.forEach((button) => {
      const a = document.createElement("a");
      a.title = button.title;
      a.className = `btn-icon btn-icon--inverse ${button.class}`;
      a.style.display = "none";
      if (button.onclick) {
        a.onclick = button.onclick;
      }

      const i = document.createElement("i");
      i.className = `material-icons ${button.class}`;
      i.textContent = button.icon;
      //i.style.display = 'none';

      if (!isDarkTheme) {
        i.style.color = "rgba(0, 0, 0, 0.4)";
      }

      a.appendChild(i);
      td.appendChild(a);
    });

    // 將生成的 <td> 插入到 .b-list__main 的相應位置
    document
      .querySelectorAll(".b-list__main")
      [i2].insertAdjacentElement("afterend", td);
  }

  // 文章列表元素
  let rows = document.querySelectorAll(".b-list__row");

  // 添加事件監聽器 - 顯示/隱藏元素
  rows.forEach((row) => {
    // Add hover event listener
    row.addEventListener("mouseover", function () {
      // Show elements
      let beePreview = row.querySelector(".bee_preview");
      let beeOpenNewWd = row.querySelector(".bee_open_new_wd");
      let beeLink = row.querySelector(".bee_link");

      if (beePreview) beePreview.style.display = "";
      if (beeOpenNewWd) beeOpenNewWd.style.display = "";
      if (beeLink) beeLink.style.display = "";
    });

    row.addEventListener("mouseout", function () {
      // Hide elements
      let beePreview = row.querySelector(".bee_preview");
      let beeOpenNewWd = row.querySelector(".bee_open_new_wd");
      let beeLink = row.querySelector(".bee_link");

      if (beePreview) beePreview.style.display = "none";
      if (beeOpenNewWd) beeOpenNewWd.style.display = "none";
      if (beeLink) beeLink.style.display = "none";
    });
  });
}

function bPage_previewAuto(newVer) {
  if (newVer) {
    let bListMainTitles = document.querySelectorAll(".forum-item-info");
    bListMainTitles.forEach((bListMainTitle) => {
      bListMainTitle.addEventListener("click", async (e) => {
        e.preventDefault();
        // set preview elemet's style transform to 0
        const previewBox = document.getElementById("article-content-box");
        previewBox.style.transform = "translateX(0%)";
        previewBox.style.width = localStorage.getItem("preview_size") || "80%";

        const topBarCover = document.querySelector(".bee-top-bar-cover");
        topBarCover.style.height = "100vh";
        topBarCover.style.opacity = "0.7";

        // 在 newVer 情況下添加C頁監聽，插入 ai 功能性按鈕
        // 使用事件監聽，等待頁面 .forum-list-normal 元素出現才繼續
        await new Promise((resolve) => {
          const observer = new MutationObserver(async (mutations) => {
            if (
              document.querySelectorAll(".c-section__main.c-post").length > 0
            ) {
              // console.log("detected post open");
              if (localStorage.getItem("addSummaryBtn") === "true") {
                await postAddBtn(newVer);
              }
              observer.disconnect();
              resolve();
            }
          });
          observer.observe(document.body, { childList: true, subtree: true });
        });

        return false;
      });
    });
  } else {
    let picMode = document.querySelectorAll(".imglist-text").length !== 0;
    if (picMode) {
      let switchTopics = document.querySelectorAll(".b-list__main");
      switchTopics.forEach((switchTopic) => {
        let topicTexts = switchTopic.childNodes[1].childNodes[3];
        //only in pic mode will trigger
        if (topicTexts.className === "imglist-text") {
          switchTopic.childNodes[1].removeChild(topicTexts);
          switchTopic.insertAdjacentHTML("beforeend", topicTexts.outerHTML);
        }
      });
    }

    let bListMainTitles = document.querySelectorAll(".b-list__main__title");
    bListMainTitles.forEach((bListMainTitle) => {
      bListMainTitle.addEventListener("click", (e) => {
        e.preventDefault();
        let href = bListMainTitle.parentNode.parentNode
          .querySelector(".b-list__main__title")
          .getAttribute("href");
        openInFrame(`https://forum.gamer.com.tw/${href}`);
        return false;
      });
    });
    let bListMainTitlesPages = document.querySelectorAll(
      !picMode
        ? "#BH-master > form > div > table > tbody > tr > td.b-list__main > span > a"
        : "#BH-master > form > div > table > tbody > tr > td.b-list__main > div > div > span > span"
    );
    bListMainTitlesPages.forEach((bListMainTitlePage) => {
      bListMainTitlePage.addEventListener("click", (e) => {
        e.preventDefault();
        let href = bListMainTitlePage.getAttribute(
          !picMode ? "href" : "data-page"
        );
        openInFrame(`https://forum.gamer.com.tw/${href}`);
        return false;
      });
    });
  }
}

function bPage_addBorderInPicMode() {
  const all_blocks_pic_mode = document.querySelectorAll(
    "#BH-master > form > div > table > tbody > tr > td.b-list__main > div > p"
  );
  Array.from(all_blocks_pic_mode).forEach(function (link) {
    link.style.borderTop = "dashed";
  });
}

function loadTips() {
  if (!window.location.href.includes("forum.gamer.com.tw/B.php")) {
    return;
  }
  let picMode;
  picMode = document.querySelectorAll(".imglist-text").length !== 0;

  let link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.css";
  document.head.appendChild(link);

  let script = document.createElement("script");
  script.src =
    "https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.js.iife.js";
  script.onload = function () {
    console.log("Driver.js loaded");
    const driver = window.driver.js.driver;
    const driverObj = driver({
      showButtons: ["next", "previous" /*, 'close'*/],
      allowClose: false,
      nextBtnText: "▶",
      prevBtnText: "◀",
      doneBtnText: "好耶" /*onCloseClick: () => {
                driverObj.destroy();
            },*/,
      showProgress: true,
      steps: [
        {
          element: ".beeSettingTag",
          popover: {
            title: "客製化設定",
            description:
              "在這裡可以進行詳細的個人設定，設定變更後需要【重新整理】頁面才會生效。",
          },
        },
        {
          element: picMode
            ? "#BH-master > form > div > table > tbody > tr > td.b-list__main > div > div > p"
            : "#BH-master > form > div > table > tbody > tr > td.b-list__main > a",
          popover: {
            title: "即時瀏覽",
            description:
              "如果開啟「點擊時使用即時預覽」，文章標題的跳轉會以即時預覽的方式啟動。",
            side: "bottom",
          },
        },
        {
          element:
            "#BH-master > form > div > table > tbody > tr > td.b-list__main",
          popover: {
            title: "快速選取",
            description:
              "除了文章標題、縮圖模式的預覽圖，其他區域可以觸發快速選取。功能等同左方的勾選方塊。",
            side: "bottom",
            onNextClick: () => {
              document.querySelector(
                "#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > a.btn-icon.btn-icon--inverse.bee_preview"
              ).style.display = "inline-block";
              document.querySelector(
                "#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > a.btn-icon.btn-icon--inverse.bee_open_new_wd"
              ).style.display = "inline-block";
              document.querySelector(
                "#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > a.btn-icon.btn-icon--inverse.bee_link"
              ).style.display = "inline-block";
              driverObj.moveNext();
            },
          },
        },
        {
          element: picMode
            ? "#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3)"
            : "#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3)",
          popover: {
            title: "功能按鈕",
            description:
              "如果開啟「插入功能按鈕」，指標指向的文章後方會出現三個功能按鈕，分別是「即時預覽」「新分頁開啟」「複製連結」。",
            side: "bottom",
            onNextClick: () => {
              document.querySelector(
                "#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > a.btn-icon.btn-icon--inverse.bee_preview"
              ).style.display = "none";
              document.querySelector(
                "#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > a.btn-icon.btn-icon--inverse.bee_open_new_wd"
              ).style.display = "none";
              document.querySelector(
                "#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > a.btn-icon.btn-icon--inverse.bee_link"
              ).style.display = "none";
              document
                .querySelector(
                  picMode
                    ? "#BH-master > form > div > table > tbody > tr:nth-child(2) > td.b-list__main > div > a"
                    : "#BH-master > form > div > table > tbody > tr:nth-child(2) > td.b-list__main > a"
                )
                .click();

              driverObj.moveNext();
            },
          },
        },
        {
          element: "#BH-master > form > section:last-child > div",
          popover: {
            title: "功能選單",
            description: "快速預覽視窗中，功能選單會漂浮在下方，方便使用！",
            side: "bottom",
            onPrevClick: () => {
              document.querySelector("#BH-menu-path").click();
              document.querySelector(
                "#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > a.btn-icon.btn-icon--inverse.bee_preview"
              ).style.display = "inline-block";
              document.querySelector(
                "#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > a.btn-icon.btn-icon--inverse.bee_open_new_wd"
              ).style.display = "inline-block";
              document.querySelector(
                "#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > a.btn-icon.btn-icon--inverse.bee_link"
              ).style.display = "inline-block";
              driverObj.movePrevious();
            },
            onNextClick: () => {
              document.querySelector("#BH-menu-path").click();
              driverObj.moveNext();
            },
          },
        },
      ],
    });
    driverObj.drive();
  };
  document.head.appendChild(script);
}

function loadTips_home() {
  if (!window.location.href.includes("www.gamer.com.tw")) {
    return;
  }
  let link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.css";
  document.head.appendChild(link);

  let script = document.createElement("script");
  script.src =
    "https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.js.iife.js";

  script.onload = function () {
    const driver = window.driver.js.driver;
    const driverObj = driver({
      showButtons: ["next", "previous" /*, 'close'*/],
      allowClose: false,
      nextBtnText: "▶",
      prevBtnText: "◀",
      doneBtnText: "好耶",
      showProgress: true,
      steps: [
        {
          element: "#homeStyleSwitch",
          popover: {
            title: "滿版首頁",
            description: "點此可以切換首頁排版。",
          },
        },
      ],
    });
    driverObj.drive();
  };
  document.head.appendChild(script);
}

function reportAlert() {
  if (
    !window.location.href.includes("forum.gamer.com.tw/B.php") ||
    !localStorage.getItem("showAbuse") === "true"
  ) {
    return;
  }
  let isReported =
    document.querySelector(
      "#BH-slave > div.BH-rbox.FM-rbox14 > div.FM-master-btn > a > span"
    ) !== null;
  if (!isReported) {
    return;
  }
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.get("bsn")) {
    console.log("[WARN] 有檢舉但抓取連結失敗");
    return;
  }
  openInFrame(
    "https:////forum.gamer.com.tw/gemadmin/accuse.php?bsn=" +
      urlParams.get("bsn")
  );
}

function addSkipFloor(postSections, postSection) {
  // 找到 .c-post__body 元素 添加文章下方的按鈕
  const postBody = postSection.querySelector(".c-post__body");
  // 找到 .article-footer_right 區域
  const footerLeft = postSection.querySelector(".c-section__side");
  const footerRight = postBody.querySelector(".article-footer_right"); //.c-section__side
  // 跳過按鈕
  const skipFloorButtonLeft = document.createElement("a");
  skipFloorButtonLeft.classList.add("article-footer_right-btn");
  skipFloorButtonLeft.innerHTML =
    '<i class="fa fa-archive" style="margin: 0 0.5rem 0 0.5rem;"></i><p>跳過此樓 ▼</p>';
  skipFloorButtonLeft.id = `skip-${postBody.querySelector(".c-article").id}`; // 生成唯一 ID
  skipFloorButtonLeft.style.display = "flex";
  skipFloorButtonLeft.style.alignItems = "center";
  skipFloorButtonLeft.style.margin = "1rem 0rem 0.5rem 0rem";
  footerLeft.appendChild(skipFloorButtonLeft);
  skipFloorButtonLeft.addEventListener("click", async () => {
    //scroll to next postSection
    let currentSectionIndex = Array.from(postSections).indexOf(postSection);
    let nextSection = postSections[currentSectionIndex + 1];
    if (nextSection) {
      scrollIntoBee(nextSection);
    } else {
      scrollIntoBee(footerRight);
    }
  });
}

function addSummaryBtnLeft(postSection, returnSummaryBtn) {
  // 找到 .c-post__body 元素 添加文章下方的按鈕
  const postBody = postSection.querySelector(".c-post__body");
  // 找到 .article-footer_right 區域
  const footerLeft = postSection.querySelector(".c-section__side");
  const footerRight = postBody.querySelector(".article-footer_right"); //.c-section__side
  // 跳到懶人包按鈕
  const lazySummaryButtonLeft = document.createElement("a");
  lazySummaryButtonLeft.classList.add("article-footer_right-btn");
  lazySummaryButtonLeft.innerHTML =
    '<i class="fa fa-pencil" style="margin: 0 0.5rem 0 0.5rem;"></i><p>懶人包 ▼</p>';
  lazySummaryButtonLeft.id = `jump-lazy-summary-${
    postBody.querySelector(".c-article").id
  }`; // 生成唯一 ID
  lazySummaryButtonLeft.style.display = "flex";
  lazySummaryButtonLeft.style.alignItems = "center";
  lazySummaryButtonLeft.style.margin = "0rem 0rem 0.5rem 0rem";
  footerLeft.appendChild(lazySummaryButtonLeft);
  // 添加點擊事件監聽器
  lazySummaryButtonLeft.addEventListener("click", async () => {
    scrollIntoBee(footerRight);
    if (lazySummaryButtonLeft.querySelector("p").textContent !== "懶人包 ▼") {
      return;
    }
    //edit text
    lazySummaryButtonLeft.querySelector("p").textContent = "已抵達";
    returnSummaryBtn.click();
  });
}

function addSummaryCmdBtn(postSection) {
  // 找到 .c-post__body 元素 添加文章下方的按鈕
  const postBody = postSection.querySelector(".c-post__body");
  // 創建新的懶人包按鈕(留言)
  const lazySummaryButtonCmd = document.createElement("a");
  lazySummaryButtonCmd.classList.add("article-footer_right-btn");
  lazySummaryButtonCmd.innerHTML =
    '<i class="fa fa-pencil" style="margin: 0 0.5rem 0 0.5rem;"></i><p>留言統整</p>';
  lazySummaryButtonCmd.id = `lazy-summaryCmd-${
    postBody.querySelector(".c-article").id
  }`; // 生成唯一 ID
  lazySummaryButtonCmd.style.display = "flex";
  lazySummaryButtonCmd.style.margin = "0.3rem 0.5rem 0rem 0rem";
  // 將新的按鈕插入到 .article-footer_right 的開頭
  //footerRight.insertBefore(lazySummaryButtonCmd, footerRight.firstChild);
  postSection
    .querySelector(".c-reply__head")
    ?.appendChild(lazySummaryButtonCmd);
  // 添加點擊事件監聽器
  lazySummaryButtonCmd.addEventListener("click", async () => {
    scrollIntoBee(lazySummaryButtonCmd);
    const postId = postBody.querySelector(".c-article").id.replace("cf", "");
    // 檢查
    if (lazySummaryButtonCmd.querySelector("p").textContent === "產生中...") {
      return;
    }
    let oaikeyTemp = localStorage.getItem("oaiKey");
    if (oaikeyTemp === "sk-yourKey" || oaikeyTemp === "") {
      alert("請先設定 API Key 才能使用 AI 功能");
      return;
    }
    if (
      document.getElementById(`${postId}-cleanCmd`) &&
      lazySummaryButtonCmd.querySelector("p").textContent === "摺疊 ▲"
    ) {
      //將本原建設為不可見 並將摺疊 ▲ 改為 展開 ▼
      popElement(document.getElementById(`${postId}-cleanCmd`), "toggle");
      lazySummaryButtonCmd.querySelector("p").textContent = "展開 ▼";
      return;
    }
    if (
      document.getElementById(`${postId}-cleanCmd`) &&
      lazySummaryButtonCmd.querySelector("p").textContent === "展開 ▼"
    ) {
      popElement(document.getElementById(`${postId}-cleanCmd`), "toggle");
      lazySummaryButtonCmd.querySelector("p").textContent = "摺疊 ▲";
      return;
    }

    if (
      document.getElementById(`${postId}-cleanCmd`) &&
      lazySummaryButtonCmd.querySelector("p").textContent !== "留言統整"
    ) {
      return;
    }
    lazySummaryButtonCmd.querySelector("p").textContent = "產生中...";

    getCmdById(postId).then(async (cmdData) => {
      // 構建 GPT prompt
      //如果空，則從settings陣列裡面oaiPromptCmd取得default
      const custom_oaiPromptCmd = localStorage.getItem("custom_oaiPromptCmd");
      const prompt =
        !custom_oaiPromptCmd || custom_oaiPromptCmd === ""
          ? localStorage.getItem("oaiPromptCmd")
          : custom_oaiPromptCmd;
      postGpt(prompt, "對話內容：\n ```" + cmdData.textContent + "\n```").then(
        async ({ response, data }) => {
          if (!response) {
            lazySummaryButtonCmd.querySelector("p").textContent = "留言統整";
            return;
          }
          //textContent 比對使用者並還原URL
          const gptReply = restoreOriginalFormat(
            data.choices[0].message.content,
            cmdData.textContentOrigin
          );
          //debug mode
          //const gptReply = restoreOriginalFormat(textContent, textContentOrigin);
          // 創建新的 .c-article 元素
          const newArticle = document.createElement("article");
          newArticle.classList.add("c-reply__item", "c-article", "FM-P2");
          newArticle.id = `${postId}-cleanCmd`;
          newArticle.style.display = "block";
          newArticle.style.overflow = "hidden";
          newArticle.style.maxHeight = "auto";
          newArticle.style.minHeight = "0px";
          // 創建新的 .c-article__content 元素並插入文本
          const newContent = document.createElement("div");
          newContent.classList.add("c-article__content");
          newContent.style.whiteSpace = "pre-wrap"; // 添加這行來顯示換行符號
          //newContent.textContent = gptReply;
          newContent.innerHTML = gptReply; // 使用 innerHTML 來插入包含 HTML 語法的內容
          newArticle.appendChild(newContent);
          // 將新的 .c-article 插入
          lazySummaryButtonCmd.querySelector("p").textContent = "摺疊 ▲";
          //postBody.appendChild(newArticle);
          postSection
            .querySelector(".c-post__footer")
            .insertBefore(
              newArticle,
              document.getElementById(`Commendlist_${postId}`)
            );
          await popElementInit(newArticle, true, "ud", true);
        }
      );
    });
  });
}

function addSummaryBtn(postSection) {
  // 找到 .c-post__body 元素 添加文章下方的按鈕
  const postBody = postSection.querySelector(".c-post__body");
  // 找到 .article-footer_right 區域
  const footerRight = postBody.querySelector(".article-footer_right"); //.c-section__side

  // 創建新的懶人包按鈕
  const lazySummaryButton = document.createElement("a");
  lazySummaryButton.classList.add("article-footer_right-btn");
  lazySummaryButton.innerHTML =
    '<i class="fa fa-pencil" style="margin: 0 0.5rem 0 0.5rem;"></i><p>懶人包</p>';
  lazySummaryButton.id = `lazy-summary-${
    postBody.querySelector(".c-article").id
  }`; // 生成唯一 ID

  // 將新的按鈕插入到 .article-footer_right 的開頭
  footerRight.insertBefore(lazySummaryButton, footerRight.firstChild);
  // 添加點擊事件監聽器
  lazySummaryButton.addEventListener("click", async () => {
    scrollIntoBee(lazySummaryButton);
    // 檢查
    if (lazySummaryButton.querySelector("p").textContent === "產生中...") {
      return;
    }
    let oaikeyTemp = localStorage.getItem("oaiKey");
    if (oaikeyTemp === "sk-yourKey" || oaikeyTemp === "") {
      alert("請先設定 API Key 才能使用 AI 功能");
      return;
    }
    if (
      document.getElementById(
        `${postBody.querySelector(".c-article").id}-clean`
      ) &&
      lazySummaryButton.querySelector("p").textContent === "摺疊 ▲"
    ) {
      //將本原建設為不可見 並將摺疊 ▲ 改為 展開 ▼
      //v1
      //document.getElementById(`${postBody.querySelector('.c-article').id}-clean`).style.display = 'none';
      //v2
      //document.getElementById(`${postBody.querySelector('.c-article').id}-clean`).style.maxHeight = '0px';
      popElement(
        document.getElementById(
          `${postBody.querySelector(".c-article").id}-clean`
        ),
        "toggle"
      );
      lazySummaryButton.querySelector("p").textContent = "展開 ▼";
      return;
    }
    if (
      document.getElementById(
        `${postBody.querySelector(".c-article").id}-clean`
      ) &&
      lazySummaryButton.querySelector("p").textContent === "展開 ▼"
    ) {
      //v1
      //document.getElementById(`${postBody.querySelector('.c-article').id}-clean`).style.display = 'block';
      //v2
      //document.getElementById(`${postBody.querySelector('.c-article').id}-clean`).style.maxHeight = document.getElementById(`${postBody.querySelector('.c-article').id}-clean`).style.readHeight;
      popElement(
        document.getElementById(
          `${postBody.querySelector(".c-article").id}-clean`
        ),
        "toggle"
      );
      lazySummaryButton.querySelector("p").textContent = "摺疊 ▲";
      return;
    }

    if (
      document.getElementById(
        `${postBody.querySelector(".c-article").id}-clean`
      ) &&
      lazySummaryButton.querySelector("p").textContent !== "懶人包"
    ) {
      return;
    }
    lazySummaryButton.querySelector("p").textContent = "產生中...";
    // 找到 .c-article__content 元素
    const articleContent = postBody.querySelector(".c-article__content");

    // 獲取所有子節點的文本內容，並合併成一個字符串
    let textContent = "";
    articleContent.childNodes.forEach((node) => {
      textContent += node.textContent.trim() + "\n";
    });

    // 去除多餘的換行
    textContent = textContent.replace(/\n+/g, "\n");

    // 構建 GPT prompt
    const custom_oaiPrompt = localStorage.getItem("custom_oaiPrompt");
    const prompt =
      !custom_oaiPrompt || custom_oaiPrompt === ""
        ? localStorage.getItem("oaiPrompt")
        : custom_oaiPrompt;
    postGpt(prompt, "文章內容：```" + textContent + "```").then(
      async ({ response, data }) => {
        if (!response) {
          lazySummaryButton.querySelector("p").textContent = "懶人包";
          return;
        }
        // 創建新的 .c-article 元素
        const newArticle = document.createElement("article");
        newArticle.classList.add("c-article", "FM-P2");
        newArticle.id = `${postBody.querySelector(".c-article").id}-clean`;
        newArticle.style.display = "block";
        newArticle.style.overflow = "hidden";
        newArticle.style.maxHeight = "auto";
        newArticle.style.minHeight = "0px";
        // 創建新的 .c-article__content 元素並插入文本
        const newContent = document.createElement("div");
        newContent.classList.add("c-article__content");
        newContent.style.whiteSpace = "pre-wrap"; // 添加這行來顯示換行符號
        //newContent.textContent = data.choices[0].message.content;
        newContent.innerHTML = data.choices[0].message.content; // 使用 innerHTML 來插入包含 HTML 語法的內容
        newArticle.appendChild(newContent);
        // 將新的 .c-article 插入
        lazySummaryButton.querySelector("p").textContent = "摺疊 ▲";
        postBody.appendChild(newArticle);
        await popElementInit(newArticle);
      }
    );
  });
  return lazySummaryButton;
}

function addAskBtn(postSection) {
  // 找到 .c-post__body 元素 添加文章下方的按鈕
  const postBody = postSection.querySelector(".c-post__body");
  // 找到 .article-footer_right 區域
  const footerRight = postBody.querySelector(".article-footer_right"); //.c-section__side
  // 創建對話框
  // <div class="c-reply__editor">
  // <div class="reply-input">
  // <textarea class="content-edit" placeholder="詢問⋯"></textarea>
  // </div></div>
  const askInput = document.createElement("div");
  askInput.classList.add("c-reply__editor");
  const replyInput = document.createElement("div");
  replyInput.classList.add("reply-input");
  const askTextarea = document.createElement("textarea");
  askTextarea.classList.add("content-edit");
  askTextarea.placeholder = "詢問⋯";
  replyInput.appendChild(askTextarea);
  askInput.appendChild(replyInput);
  postBody.appendChild(askInput);
  popElementInit(askInput, false, "ud", true).then((r) => {});
  //create chat area
  const chatArea = document.createElement("div");
  chatArea.classList.add("chatArea");
  chatArea.style.overflow = "hidden";
  postBody.insertBefore(chatArea, askInput);
  popElementInit(chatArea, false, "ud", false).then((r) => {});

  // while user press Enter
  askTextarea.addEventListener("keydown", async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // 檢查
      let oaikeyTemp = localStorage.getItem("oaiKey");
      if (oaikeyTemp === "sk-yourKey" || oaikeyTemp === "") {
        alert("請先設定 API Key 才能使用 AI 功能");
        return;
      }
      if (askTextarea.placeholder !== "詢問⋯") {
        return;
      }
      let gptArray = [];
      // 找到 .c-article__content 元素
      const articleContent = postBody.querySelector(".c-article__content");

      // 獲取所有子節點的文本內容，並合併成一個字符串
      let textContent = "";
      articleContent.childNodes.forEach((node) => {
        textContent += node.textContent.trim() + "\n";
      });

      // 去除多餘的換行
      textContent = textContent.replace(/\n+/g, "\n");
      // 構建 GPT prompt
      const custom_oaiPromptChat = localStorage.getItem("custom_oaiPromptChat");
      const prompt =
        !custom_oaiPromptChat || custom_oaiPromptChat === ""
          ? localStorage.getItem("oaiPromptChat")
          : custom_oaiPromptChat;
      const tempSystemMode = localStorage.getItem("oaiPromptSystemMode");
      gptArray.push({
        role: tempSystemMode === "true" ? "system" : "user",
        content: prompt,
      });
      if (tempSystemMode !== "true") {
        gptArray.push({
          role: "assistant",
          content: "好的，請提供文章。",
        });
      }
      gptArray.push({
        role: "user",
        content: "文章內容：\n```\n" + textContent + "\n```",
      });
      // 取得對話紀錄(user-ask + gpt-reply)
      const chatHistory = postBody.querySelectorAll(".chatHistory");
      if (chatHistory) {
        for (let i = 0; i < chatHistory.length; i++) {
          let chat = chatHistory[i];
          let role = chat.classList.contains("user-ask") ? "user" : "assistant";
          gptArray.push({
            role: role,
            content: chat.querySelector(".c-article__content").textContent,
          });
        }
      }
      // add new chat
      gptArray.push({
        role: "user",
        content: askTextarea.value,
      });
      const tempUserInput = askTextarea.value;
      askTextarea.placeholder = "載入中⋯";
      askTextarea.value = "";
      postGptArray(gptArray).then(async ({ response, data }) => {
        if (!response) {
          askTextarea.placeholder = "詢問⋯";
          askTextarea.value = tempUserInput;
          return;
        }
        // create user input to article
        const userArticle = document.createElement("article");
        userArticle.classList.add(
          "c-article",
          "FM-P2",
          "chatHistory",
          "user-ask"
        );
        userArticle.id = `${
          postBody.querySelector(".c-article").id
        }-ask-${Date.now()}`;
        userArticle.style.display = "block";
        userArticle.style.minHeight = "0px";
        userArticle.style.marginBottom = "0.8rem";
        //add border bottom
        userArticle.style.borderBottom = "1px solid var(--primary-text)";
        const userContent = document.createElement("div");
        userContent.classList.add("c-article__content");
        userContent.style.whiteSpace = "pre-wrap";
        userContent.innerHTML = tempUserInput;
        userArticle.appendChild(userContent);
        //postBody.insertBefore(userArticle, askInput);
        chatArea.appendChild(userArticle);
        //await popElementInit(userArticle, true, "ud", true);
        askTextarea.value = "";

        // 創建新的 .c-article 元素
        const newArticle = document.createElement("article");
        newArticle.classList.add(
          "c-article",
          "FM-P2",
          "chatHistory",
          "gpt-reply"
        );
        newArticle.id = `${
          postBody.querySelector(".c-article").id
        }-reply-${Date.now()}`;
        newArticle.style.display = "block";
        newArticle.style.minHeight = "0px";
        newArticle.style.marginBottom = "1.6rem";
        newArticle.style.borderBottom = "1px solid var(--primary)";
        const newContent = document.createElement("div");
        newContent.classList.add("c-article__content");
        newContent.style.whiteSpace = "pre-wrap";
        newContent.innerHTML = data.choices[0].message.content;
        newArticle.appendChild(newContent);
        askTextarea.placeholder = "詢問⋯";
        //postBody.insertBefore(newArticle, askInput);
        chatArea.appendChild(newArticle);
        //await popElementInit(newArticle, true, "ud", true);
        // set chatArea readHeight
        requestAnimationFrame(() => {
          chatArea.readHeight = `${chatArea.scrollHeight}px`;
          chatArea.style.maxHeight = `${chatArea.scrollHeight}px`;
        });
        //focus to input
        askTextarea.focus();
      });
    }
  });

  // 問問按鈕
  const askButton = document.createElement("a");
  askButton.classList.add("article-footer_right-btn");
  askButton.innerHTML =
    '<i style="margin: 0 0.5rem 0 0.5rem;" class="fa fa-comment-o"></i><p>問問 ▼</p>';
  askButton.id = `ask-${postBody.querySelector(".c-article").id}`; // 生成唯一 ID

  // 將新的按鈕插入到 .article-footer_right 的開頭
  footerRight.insertBefore(askButton, footerRight.firstChild);
  // 添加點擊事件監聽器
  askButton.addEventListener("click", async () => {
    scrollIntoBee(askButton);
    // 檢查
    let oaikeyTemp = localStorage.getItem("oaiKey");
    if (oaikeyTemp === "sk-yourKey" || oaikeyTemp === "") {
      alert("請先設定 API Key 才能使用 AI 功能");
      return;
    }
    if (askButton.querySelector("p").textContent === "問問 ▲") {
      //將本原建設為不可見 並將摺疊 ▲ 改為 展開 ▼
      popElement(askInput, "toggle");
      /*document.querySelectorAll('.chatHistory').forEach((chat) => {
                popElement(chat, "toggle");
            });*/

      chatArea.style.readHeight =
        chatArea.scrollHeight === 0 ? `999px` : `${chatArea.scrollHeight}px`;
      chatArea.style.readWidth =
        chatArea.scrollWidth === 0 ? `999px` : `${chatArea.scrollWidth}px`;
      popElement(chatArea, "toggle");
      askButton.querySelector("p").textContent = "問問 ▼";
      return;
    }
    if (askButton.querySelector("p").textContent === "問問 ▼") {
      popElement(askInput, "toggle");
      /*document.querySelectorAll('.chatHistory').forEach((chat) => {
                popElement(chat, "toggle");
            });*/
      popElement(chatArea, "toggle");
      askButton.querySelector("p").textContent = "問問 ▲";
      //focus to input
      askTextarea.focus();
    }
  });
}

async function postGpt(promptSystem, promptUser) {
  return new Promise((resolve) => {
    let oaikeyTemp = localStorage.getItem("oaiKey");

    GM_xmlhttpRequest({
      method: "POST",
      url: localStorage.getItem("oaiBaseUrl"),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${oaikeyTemp}`,
      },
      data: JSON.stringify({
        messages: [
          {
            role:
              localStorage.getItem("oaiPromptSystemMode") === "true"
                ? "system"
                : "user",
            content: promptSystem,
          },
          {
            role: "user",
            content: promptUser,
          },
        ],
        max_tokens: 4090,
        model: localStorage.getItem("oaiModel"),
        stream: false,
        temperature: 0.7,
        presence_penalty: 0,
        frequency_penalty: 0,
      }),
      timeout: 30000,
      onload: function (response) {
        try {
          if (response.status !== 200) {
            console.error(`伺服器回應錯誤: ${response.status}`);
            alert("取得 GPT 回覆時發生錯誤，請稍後再試。");
            resolve({ response: false, data: null });
            return;
          }

          const data = JSON.parse(response.responseText);
          if (data?.choices?.[0]?.message?.content) {
            resolve({ response: true, data: data });
          } else {
            console.error("API 返回的數據格式不正確");
            alert("取得 GPT 回覆時發生錯誤，請稍後再試。");
            resolve({ response: false, data: null });
          }
        } catch (error) {
          console.error("取得 GPT 回覆時發生錯誤:", error);
          alert("取得 GPT 回覆時發生錯誤，請稍後再試。");
          resolve({ response: false, data: null });
        }
      },
      onerror: function (error) {
        console.error("取得 GPT 回覆時發生錯誤:", error);
        alert("取得 GPT 回覆時發生錯誤，請稍後再試。");
        resolve({ response: false, data: null });
      },
      ontimeout: function () {
        console.error("取得 GPT 回覆超時");
        alert("取得 GPT 回覆時發生錯誤，請稍後再試。");
        resolve({ response: false, data: null });
      },
    });
  });
}

async function postGptArray(gptArray) {
  return new Promise((resolve) => {
    let oaikeyTemp = localStorage.getItem("oaiKey");

    GM_xmlhttpRequest({
      method: "POST",
      url: localStorage.getItem("oaiBaseUrl"),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${oaikeyTemp}`,
      },
      data: JSON.stringify({
        messages: gptArray,
        max_tokens: 4090,
        model: localStorage.getItem("oaiModel"),
        stream: false,
        temperature: 0.7,
        presence_penalty: 0,
        frequency_penalty: 0,
      }),
      timeout: 30000,
      onload: function (response) {
        try {
          if (response.status !== 200) {
            console.error(`伺服器回應錯誤: ${response.status}`);
            alert("取得 GPT 回覆時發生錯誤，請稍後再試。");
            resolve({ response: false, data: null });
            return;
          }

          const data = JSON.parse(response.responseText);
          if (data?.choices?.[0]?.message?.content) {
            resolve({ response: true, data: data });
          } else {
            console.error("API 返回的數據格式不正確");
            alert("取得 GPT 回覆時發生錯誤，請稍後再試。");
            resolve({ response: false, data: null });
          }
        } catch (error) {
          console.error("取得 GPT 回覆時發生錯誤:", error);
          alert("取得 GPT 回覆時發生錯誤，請稍後再試。");
          resolve({ response: false, data: null });
        }
      },
      onerror: function (error) {
        console.error("取得 GPT 回覆時發生錯誤:", error);
        alert("取得 GPT 回覆時發生錯誤，請稍後再試。");
        resolve({ response: false, data: null });
      },
      ontimeout: function () {
        console.error("取得 GPT 回覆超時");
        alert("取得 GPT 回覆時發生錯誤，請稍後再試。");
        resolve({ response: false, data: null });
      },
    });
  });
}

async function postAddBtn(newVer = false) {
  // check if oaiUpdateDate is more than today (format: yyyymmdd)
  await getPrompt();
  // 尋找所有 .c-post__body 元素
  const postSections = Array.from(
    document.querySelectorAll(".c-section")
  ).filter((postSection) => postSection.querySelector(".c-post__body"));
  postSections.forEach((postSection) => {
    // 檢查有沒有 fa-pencil 子元素
    if (
      postSection.querySelector(".fa-pencil") !== null &&
      postSection.querySelector(".fa-pencil").length !== 0
    ) {
      return;
    }
    addAskBtn(postSection);
    const returnSummaryBtn = addSummaryBtn(postSection);
    addSummaryCmdBtn(postSection);
    // TODO
    //addSkipFloor(postSections, postSection);
    //addSummaryBtnLeft(postSection, returnSummaryBtn);
  });
}

async function getCmdById(postId) {
  // 找到 cmd 元素
  let cmdContents = document
    .getElementById(`Commendlist_${postId}`)
    .querySelectorAll(".c-reply__item");
  // 展開留言
  const showCmd = document.getElementById(`showoldCommend_${postId}`);
  if (
    showCmd &&
    (showCmd.style.display === "block" || showCmd.style.display === "")
  ) {
    // 持續偵測 dom 直到留言展開
    let cmdCount = cmdContents.length;
    showCmd.click();
    await new Promise((resolve) => {
      const observer = new MutationObserver((mutations) => {
        //console.log(document.getElementById(`Commendlist_${postId}`).querySelectorAll('.c-reply__item').length + '/' + cmdCount);
        if (
          document
            .getElementById(`Commendlist_${postId}`)
            .querySelectorAll(".c-reply__item").length >= cmdCount
        ) {
          cmdContents = document
            .getElementById(`Commendlist_${postId}`)
            .querySelectorAll(".c-reply__item");
          // 第二次 DOM 改變後的程式碼
          document.getElementById(`closeCommend_${postId}`).click();
          //console.log('s1');
          observer.disconnect(); // 停止觀察
          resolve();
        }
      });
      observer.observe(document.getElementById(`Commendlist_${postId}`), {
        childList: true,
        subtree: true,
        characterData: true,
      });
    });
    //console.log('s2');
    document.getElementById(`closeCommend_${postId}`).click();
  }
  //console.log('s3');
  // 獲取全部 id跟留言內容 並結合成一個文本
  // 文本格式 = "@" + id + "：" + 留言內容 + "\n"
  let textContent = "";
  let textContentOrigin = Array.from(cmdContents)
    .map((node) => node.innerHTML)
    .join("");
  cmdContents.forEach((node) => {
    textContent +=
      "@" +
      node.querySelector(".reply-content__user").innerHTML +
      "：" +
      node.querySelector(".comment_content").innerHTML +
      "\n";
  });

  // 去除多餘的換行
  textContent = textContent.replace(/\n+/g, "\n");
  // 轉換回應
  const pattern =
    /<a href="javascript:Forum\.C\.openCommentDialog\(\d+,\s*\d+,\d+\);">([^<]+)\((.*?)\)<\/a>/g;
  const pattern2 =
    /<a target="_blank" href="https:\/\/home\.gamer\.com\.tw\/[^"]+">([^<]+)<\/a>/g;
  textContent = textContent.replace(pattern, (match, prefix, name) => {
    return `回應@${name} => `;
  });
  textContent = textContent.replace(pattern2, (match, name) => {
    return `回應@${name}，`;
  });
  return { textContent: textContent, textContentOrigin: textContentOrigin };
}

async function getPrompt() {
  let today = new Date();
  let oaiPromptUpdateDate = localStorage.getItem("oaiPromptUpdateDate");
  if (
    today.toISOString().slice(0, 10).replace(/-/g, "") - oaiPromptUpdateDate <
    localStorage.getItem("oaiPromptUpdateSleep")
  ) {
    return null;
  }
  try {
    const response = await fetch(localStorage.getItem("oaiPromptUpdateURL"));
    if (!response.ok) {
      console.error("[ERROR] fetching prompt:", response.status);
      return null;
    }
    const data = await response.json();
    localStorage.setItem(
      "oaiPromptUpdateDate",
      today.toISOString().slice(0, 10).replace(/-/g, "")
    );
    if (localStorage.getItem("oaiPromptDate") >= data.oaiPromptDate) {
      return data;
    }
    localStorage.setItem("oaiPromptDate", data.oaiPromptDate);
    localStorage.setItem("oaiPrompt", data.oaiPrompt);
    localStorage.setItem("oaiPromptUpdateSleep", data.oaiPromptUpdateSleep);
    localStorage.setItem("oaiPromptCmd", data.oaiPromptCmd);
    return data;
  } catch (error) {
    console.error("[ERROR] fetching prompt:", error);
    return null;
  }
}

function openInFrame(url) {
  let iframe = document.getElementById("bee_frame");
  iframe.src = url;

  let BHMenuPath = document.querySelector("#BH-menu-path");
  BHMenuPath.style.height = "100%";
  BHMenuPath.style.opacity = "0.6";
  setTimeout(() => {
    /*document.querySelector('.bee_preview_wd').style.transform = 'translateX(0%) scaleX(' + 1 + ')';
        document.querySelector('.bee_preview_wd').style.opacity = '1';*/
    popElement(
      document.querySelector(".bee_preview_wd"),
      "true",
      localStorage.getItem("preview_LR") === "true" ? "rl" : "lr"
    );
  }, 1000);

  //wait 1 sec
  setTimeout(() => {
    let iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    let styleSheet = iframeDoc.createElement("style");
    iframeDoc.head.appendChild(styleSheet);
    let sheet = styleSheet.sheet;
    sheet.insertRule(
      ".managertools { position: fixed; bottom: 0; right: 0; z-index: 100; }",
      0
    );
  }, 1000);
}

async function popElementInit(
  element,
  show = true,
  anime = "ud",
  waitAppend = true
) {
  if (waitAppend) {
    requestAnimationFrame(() => {
      element.style.readHeight =
        element.scrollHeight === 0 ? `999px` : `${element.scrollHeight}px`;
      element.style.readWidth =
        element.scrollWidth === 0 ? `999px` : `${element.scrollWidth}px`;
      //console.log('after frame',element.style.readHeight, '/', element.style.readWidth);
    });
  } else {
    element.style.readHeight =
      element.scrollHeight === 0 ? `999px` : `${element.scrollHeight}px`;
    element.style.readWidth =
      element.scrollWidth === 0 ? `999px` : `${element.scrollWidth}px`;
    //console.log('without wait',element.style.readHeight, '/', element.style.readWidth);
  }

  element.style.transition = "";
  element.style.overflow = "hidden auto";
  element.style.opacity = "0";
  popElement(element, "false", anime);
  element.style.transition = "all 0.5s cubic-bezier(0.21, 0.3, 0.18, 1.37) 0s";
  if (!show) {
    element.style.beeShow = "false";
    return;
  }
  element.style.beeShow = "true";
  element.style.opacity = "1";
  requestAnimationFrame(() => {
    ///console.log(element.scrollWidth, '///', element.scrollHeight, '///', element.style.readWidth, '///', element.style.readHeight);
    element.style.maxHeight = element.style.readHeight;
  });
}

function popElement(element, show = "true", anime = "ud") {
  let doShow;
  if (show === "toggle") {
    doShow = !(element.style.beeShow === "true");
  } else {
    doShow = show === "true";
  }
  if (doShow) {
    element.style.opacity = "1";
    element.style.maxHeight = element.style.readHeight;
    element.style.maxWidth = element.style.readWidth;
    element.style.transform = "translateX(0px) translateY(0px)";
    element.style.beeShow = "true";
    return;
  }
  element.style.beeShow = "false";
  element.style.opacity = "0";
  //element.style.readHeight = element.scrollHeight === 0 ? `999px` : `${element.scrollHeight}px`;
  //element.style.readWidth = element.scrollWidth === 0 ? `999px` : `${element.scrollWidth}px`;
  if (anime.includes("u")) {
    element.style.opacity = "0";
    element.style.maxHeight = "0px";
    if (anime.startsWith("d")) {
      element.style.transform = `translateX(0px) translateY(${element.style.readWidth}px)`;
      //move as same as how it was
      /*element.style.marginTop = `${parseInt(element.style.marginTop.replace("px", ""))
            + parseInt(element.style.readHeight.replace("px", ""))}px`;*/
    }
  }
  if (anime.includes("l")) {
    element.style.opacity = "0";
    element.style.maxWidth = "0px";
    if (anime.startsWith("r")) {
      element.style.transform = `translateX(${element.style.readHeight}) translateY(0px)`;
      //move as same as how it was
      /*element.style.marginLeft = `${parseInt(element.style.marginLeft.replace("px", ""))
            + parseInt(element.style.readWidth.replace("px", ""))}px`;*/
    }
  }
}

function scrollIntoBee(element, marginOffset = 7) {
  const temp_marginTop =
    element.style.marginTop === undefined || ""
      ? "0px"
      : element.style.marginTop;
  element.style.marginTop = `-${marginOffset}rem`;
  element.scrollIntoView({ behavior: "smooth" });
  element.style.marginTop = temp_marginTop;
  //check after 0.3 sec, if not inInViewport, recall
  setTimeout(() => {
    if (!isInViewport(element)) {
      scrollIntoBee(element, marginOffset);
    }
  }, 300);
}

function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight)
    //rect.left >= 0 &&
    //rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    //rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function restoreOriginalFormat(textContent, cmdContents) {
  // 儲存所有在原始文本中找到的名字和對應的HTML
  const nameToHtmlMap = new Map();

  // 從原始文本(cmdContents)中提取所有HTML格式及對應的用戶名
  const htmlPattern =
    /<a class="reply-content__user" href="\/\/home\.gamer\.com\.tw\/[^"]+" target="_blank">([^<]+)<\/a>/g;
  let match;
  while ((match = htmlPattern.exec(cmdContents)) !== null) {
    nameToHtmlMap.set(match[1], match[0]);
  }

  // 在 textContent 中尋找並替換所有 @id
  let processedText = textContent;
  nameToHtmlMap.forEach((html, name) => {
    /*const atPattern = new RegExp(`@${name}`, 'g');
        processedText = processedText.replace(atPattern, html);*/
    // 對特殊字符進行轉義
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const atPattern = new RegExp(`@${escapedName}`, "g");
    processedText = processedText.replace(atPattern, html);
  });

  return processedText;
}
