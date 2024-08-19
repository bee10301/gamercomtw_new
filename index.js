// ==UserScript==
// @name         巴哈姆特_新版B頁板務功能
// @namespace    Bee10301
// @version      5.1
// @description  巴哈姆特哈拉區新體驗。
// @author       Bee10301
// @match        https://forum.gamer.com.tw/B.php?*
// @match        https://forum.gamer.com.tw/C.php?*
// @homepage     https://home.gamer.com.tw/home.php?owner=bee10301
// @icon         https://home.gamer.com.tw/favicon.ico
// @grant        none
// @license      GPL
// @downloadURL  https://gamercomtwnew.bee.moe/index.js
// @updateURL    https://gamercomtwnew.bee.moe/meta.js
// ==/UserScript==

(function () {
    ("use strict");
    checkFirstRun();
    addSettingElement();
    worker_bPage();
    worker_cPage();
    reportAlert();
})();


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
    // new_design_LRSwitch > 左右對調（聊天室在左方，讓文章標題在螢幕中間）
    // bee_select_color > 勾選文章時的顏色（可含有透明度屬性）
    // preview_LR > 即時瀏覽視窗的位置
    const settings = [
        { key: "isFirstRun", defaultValue: "false" },
        { key: "add_function", defaultValue: "true" },
        { key: "preview_auto", defaultValue: "true" },
        { key: "preview_wait_load", defaultValue: "false" },
        { key: "preview_size", defaultValue: "65%" },
        { key: "new_design", defaultValue: "true" },
        { key: "new_design_box", defaultValue: "80%" },
        { key: "new_design_box_Left", defaultValue: "70%" },
        { key: "new_design_box_Right", defaultValue: "25%" },
        { key: "new_design_LRSwitch", defaultValue: "true" },
        { key: "bee_select_color", defaultValue: "#000000b3" },
        { key: "addBorderInPicMode", defaultValue: "true" },
        { key: "showTips", defaultValue: "true" },
        { key: "preview_LR", defaultValue: "true" },
        { key: "showAbuse", defaultValue: "true" },
        // Add other settings as needed
    ];

    settings.forEach(setting => {
        if (localStorage.getItem(setting.key) === null || reset === true) {
            localStorage.setItem(setting.key, setting.defaultValue);
        }
    });

    if (localStorage.getItem("showTips") === "true") {
        loadTips();
        localStorage.setItem("showTips", "false");
    }

}

function addSettingElement() {
    if (window.location.href.includes('forum.gamer.com.tw/B.php')) {
        // 取得 management-item 元素
        const lastManagementItem = document.querySelector('#BH-menu-path > ul > ul > li.BH-menu-forumA-right.dropList > dl/* > dd:nth-child(4)*/');

        // 插入新內容到最後一個 management-item 元素中
        const sectionTitle = document.createElement('h3');
        sectionTitle.className = 'section-title';
        sectionTitle.textContent = '插件設定';
        sectionTitle.style.margin = '0.6rem 0 0.7rem 0.7rem';
        lastManagementItem.appendChild(sectionTitle);

        lastManagementItem.appendChild(createItemCard('add_function', '標題後方插入功能按鈕'));
        lastManagementItem.appendChild(createItemCard('preview_auto', '點擊文章時使用即時瀏覽'));
        lastManagementItem.appendChild(createItemCard(null, null, {
            inputId: 'preview_size', labelText: '　└　即時瀏覽視窗的大小'
        }));
        lastManagementItem.appendChild(createItemCard('preview_LR', '即時瀏覽從右方彈出（取消則從左）'));
        lastManagementItem.appendChild(createItemCard('new_design', '自適型版面（根據下方自定比例適應）'));
        lastManagementItem.appendChild(createItemCard(null, null, {
            inputId: 'new_design_box', labelText: '　└　整體顯示區域佔比（文章+聊天室佔整個畫面的比例，< 100%）'
        }));
        lastManagementItem.appendChild(createItemCard(null, null, {
            inputId: 'new_design_box_Left', labelText: '　　　├　文章佔比（與聊天室佔比總和 <= 100%）'
        }));
        lastManagementItem.appendChild(createItemCard(null, null, {
            inputId: 'new_design_box_Right', labelText: '　　　└　聊天室佔比'
        }));
        lastManagementItem.appendChild(createItemCard('new_design_LRSwitch', '左右對調（聊天室在左方，讓文章標題在螢幕中間）'));

        lastManagementItem.appendChild(createItemCard('addBorderInPicMode', '縮圖列表模式中，加上分隔線'));

        lastManagementItem.appendChild(createItemCard('showAbuse', '有檢舉時，自動以即時瀏覽開啟'));
        // createItemCard  會因為 id===bee_select_color 而增加寬度
        lastManagementItem.appendChild(createItemCard(null, null, {
            inputId: 'bee_select_color', labelText: '勾選文章時的顏色（可含有透明度屬性）'
        }));
        lastManagementItem.appendChild(createItemCard('showTips', '重新觀看TIPs'));

    }
}

// 項目卡函數
function createItemCard(inputId, labelText, additionalContent = null) {
    const isDarkTheme = window.getComputedStyle(document.getElementById('BH-menu-path')).backgroundColor === 'rgb(28, 28, 28)';
    const itemCard = document.createElement('div');
    itemCard.className = 'item-card management_guild-check single-choice';

    const checkGroup = document.createElement('div');
    checkGroup.className = 'check-group';
    checkGroup.style.margin = '0.6rem 0 0.2rem 0.7rem';

    if (inputId) {
        const input = document.createElement('input');
        input.id = inputId;
        input.type = 'checkbox';

        // 如果 localStorage 有儲存的值，則設置為該值，否則預設為 checked
        input.checked = localStorage.getItem(inputId) === 'true';

        const label = document.createElement('label');
        label.htmlFor = inputId;
        label.className = 'is-active';

        const labelIcon = document.createElement('div');
        labelIcon.className = 'label-icon';
        const icon = document.createElement('i');
        icon.className = 'fa fa-check';
        labelIcon.appendChild(icon);

        const h6 = document.createElement('h6');
        h6.textContent = labelText;
        h6.style.display = 'inline-block';
        h6.style.color = isDarkTheme ? '#C7C6CB' : '#117e96';

        label.appendChild(labelIcon);
        label.appendChild(h6);

        checkGroup.appendChild(input);
        checkGroup.appendChild(label);

        // 添加 input 事件監聽器，將值保存到 localStorage
        input.addEventListener('input', function () {
            localStorage.setItem(inputId, this.checked);
        });
    }

    if (additionalContent) {
        const h6 = document.createElement('h6');
        h6.textContent = additionalContent.labelText;
        h6.style.display = 'inline-block';
        checkGroup.appendChild(h6);

        const input = document.createElement('input');
        input.className = 'form-control';
        input.id = additionalContent.inputId;
        input.type = 'text';
        input.size = 25;
        input.style.margin = '10px';
        input.style.width = additionalContent.inputId === "bee_select_color" ? '120px' : '70px';

        // 如果 localStorage 有儲存的值，則設置為該值
        input.value = localStorage.getItem(additionalContent.inputId) || '';

        checkGroup.appendChild(input);

        // 添加 input 事件監聽器，將值保存到 localStorage
        input.addEventListener('input', function () {
            localStorage.setItem(additionalContent.inputId, this.value);
        });
    }

    itemCard.appendChild(checkGroup);
    return itemCard;
}


function worker_cPage() {
    if (window.location.href.includes('forum.gamer.com.tw/C.php')) {
        let styleSheet = document.createElement('style');
        document.head.appendChild(styleSheet);
        let sheet = styleSheet.sheet;
        sheet.insertRule('.managertools { position: fixed; bottom: 0; right: 0; z-index: 100; }', 0);
    }
}


function worker_bPage() {
    if (window.location.href.includes('forum.gamer.com.tw/B.php')) {
        if (localStorage.getItem("preview_auto") === "true") {
            bPage_previewAuto();
        }
        bPage_addFrame();
        bPage_addMenu();
        bPage_new_checkbox();
        if (localStorage.getItem("new_design") === "true") {
            bPage_new_design();
        }
        if (localStorage.getItem("new_design_LRSwitch") === "true") {
            document.getElementById('BH-master').style.float = 'right';
            document.getElementById('BH-slave').style.float = 'left';
        }
        if (localStorage.getItem("add_function") === "true") {
            bPage_addFunction();
        }
        //add border in pic mode must be excute after, because previewAuto does change the structure
        if (localStorage.getItem("addBorderInPicMode") === "true") {
            bPage_addBorderInPicMode();
        }

    }
}

function bPage_addFrame() {
    //frame
    let beePreviewWd = document.createElement('div');
    beePreviewWd.className = 'bee_preview_wd';
    beePreviewWd.style.height = '100%';
    //beePreviewWd.style.width = '0rem';
    beePreviewWd.style.width = localStorage.getItem("preview_size");
    beePreviewWd.style.transform = 'scaleX(' + 0 + ')';
    beePreviewWd.style.zIndex = '100';
    beePreviewWd.style.position = 'fixed';
    beePreviewWd.style.top = '1rem';
    if (localStorage.getItem("preview_LR") === "true") {
        beePreviewWd.style.right = '1%';
    } else {
        beePreviewWd.style.left = '1%';
    }
    beePreviewWd.style.transition = 'all 0.5s cubic-bezier(0.21, 0.3, 0.18, 1.37) 0s';

    document.body.appendChild(beePreviewWd);

    let beeFrame = document.createElement('iframe');
    beeFrame.id = 'bee_frame';
    beeFrame.title = 'bee_frame';
    beeFrame.src = '';
    beeFrame.style.transition = 'all 0.5s cubic-bezier(0.21, 0.3, 0.18, 1.37) 0s';
    beeFrame.style.border = '1em solid rgb(170, 50, 220, 0)';
    beeFrame.width = '100%';
    beeFrame.height = '90%';

    document.querySelector('.bee_preview_wd').appendChild(beeFrame);

    //close frame by top menu
    let BHMenuPath = document.querySelector('#BH-menu-path');
    BHMenuPath.style.transition = "all 0.5s cubic-bezier(0.21, 0.3, 0.18, 1.37) 0s";
    BHMenuPath.style.height = "40px";
    BHMenuPath.style.opacity = '1';
    //BHMenuPath.style.backgroundColor = '#0e4355cc';

    BHMenuPath.addEventListener('click', () => {
        //document.querySelector('.bee_preview_wd').style.width = '0%';
        document.querySelector('.bee_preview_wd').style.transform = 'translateX(100%)';
        document.querySelector('.bee_preview_wd').style.opacity = '0';
        BHMenuPath.style.height = '40px';
        //BHMenuPath.style.backgroundColor = '#0e4355cc';
        BHMenuPath.style.opacity = '1';
    });

}

function bPage_addMenu() {
    try {
        // 獲取 .managertools 元素
        const managertools = document.querySelector('.managertools');

        // 創建 .b-manager 容器
        const bManagerDiv = document.createElement('div');
        bManagerDiv.className = 'b-manager managertools bee_manager';
        bManagerDiv.style.zIndex = '100';
        bManagerDiv.style.position = 'fixed';
        bManagerDiv.style.width = 'auto';

        // 創建 .checkbox 和 <label> 元素
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'checkbox';
        const label = document.createElement('label');
        label.setAttribute('for', 'check');

        // 將 .checkbox 和 <label> 插入到 .b-manager 容器中
        bManagerDiv.appendChild(checkboxDiv);
        bManagerDiv.appendChild(label);

        // 創建並插入包含按鈕的 .bee 容器
        const buttonIndexes = [[0, 3, 7], [2, 4], [1, 8], [5, 6]];

        buttonIndexes.forEach(indexes => {
            const beeDiv = document.createElement('div');
            beeDiv.className = 'bee';
            beeDiv.style.padding = '5px';

            indexes.forEach(index => {
                const button = managertools.querySelectorAll('button')[index].cloneNode(true);
                beeDiv.appendChild(button);
            });

            bManagerDiv.appendChild(beeDiv);
        });

        // 將 .b-manager 容器添加到 .managertools 元素中
        managertools.appendChild(bManagerDiv);

        const all_links = document.querySelectorAll('#BH-master > form > div > table > tbody > tr > td.b-list__main > a');
        Array.from(all_links).forEach(function (link) {
            link.addEventListener('click', function (event) {
                event.stopPropagation();
            });
        });
        const all_blocks_pic_mode = document.querySelectorAll('#BH-master > form > div > table > tbody > tr > td.b-list__main');
        Array.from(all_blocks_pic_mode).forEach(function (link) {
            link.addEventListener('click', function (event) {
                event.stopPropagation();
            });
        });

    } catch (e) {
    }
}

function bPage_new_checkbox() {
    let all_title;

    if (document.querySelectorAll('.imglist-text').length === 0) {
        all_title = document.getElementsByClassName("b-list__main");
    } else {
        all_title = document.getElementsByClassName("b-list__main");
    }

    //const all_title_link = document.getElementsByClassName("b-list__main__title");
    let temp_elements_checkbox;
    try {
        temp_elements_checkbox = document.getElementsByName("jsn[]");
    } catch (e) {
    }
    for (let i = 0; i < all_title.length; i++) {

        //prevent child trigger
        let children = all_title[i].querySelectorAll('*');
        children.forEach(function (child) {
            child.addEventListener('click', function (event) {
                event.stopPropagation();
            });
        });

        try {
            temp_elements_checkbox[i].checked = false;
        } catch (e) {
        }

        // 添加 onclick 事件
        all_title[i].onclick = function (e) {
            // 如果子元素有 b-list__tile 或 imglist-text 類別，則觸發
            if (all_title[i].querySelector('.b-list__main__title') !== null || all_title[i].querySelector('.imglist-text') !== null) {
                // 如果當前有
                try {
                    document.querySelector(".bee_manager").style.display = 'none';
                } catch (e) {
                }
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
                            this.style.backgroundColor = localStorage.getItem("bee_select_color");
                        }
                    }
                    if (temp_elements_checkbox[i2].checked) {
                        haveCheckedBox = true;
                    }
                }
                if (haveCheckedBox) {
                    let beeManager = document.querySelector(".bee_manager");
                    beeManager.style.left = (e.clientX + 50) /*+ document.documentElement.scrollLeft */ + `px`;
                    beeManager.style.top = (e.clientY - 170)/*+ document.documentElement.scrollTop */ + `px`;
                    beeManager.style.display = 'block';
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

function bPage_new_design() {
    // 獲取所有的.b-list_ad元素，並將其display設為none
    let bListAdElements = document.querySelectorAll('.b-list_ad');
    for (let i = 0; i < bListAdElements.length; i++) {
        bListAdElements[i].style.display = 'none';
    }

    // 以下為設置元素的寬度
    document.getElementById('BH-wrapper').style.width = localStorage.getItem("new_design_box");
    document.getElementById('BH-master').style.width = localStorage.getItem("new_design_box_Left");
    document.getElementById('BH-slave').style.width = localStorage.getItem("new_design_box_Right");


}

function bPage_addFunction() {
    const all_title = document.getElementsByClassName("b-list__main");
    const all_title_link = document.getElementsByClassName("b-list__main__title");

    // 創建一個新的 <td> 元素並插入到 .b-list__filter 元素後面
    const newTd = document.createElement('td');
    document.querySelector('.b-list__filter').insertAdjacentElement('afterend', newTd);

    for (let i2 = 0; i2 < all_title.length; i2++) {
        const isDarkTheme = window.getComputedStyle(document.getElementById('BH-menu-path')).backgroundColor === 'rgb(28, 28, 28)';
        const hrefValue = all_title_link[i2].getAttribute('href');

        // 創建外層 <td> 元素
        const td = document.createElement('td');
        td.style.width = '5.7rem';

        // 創建各個按鈕的容器和圖標
        const buttons = [{
            title: '快速瀏覽',
            class: 'bee_preview',
            icon: 'fullscreen',
            onclick: () => openInFrame("https://forum.gamer.com.tw/" + hrefValue)
        }, {
            title: '開新視窗', class: 'bee_open_new_wd', icon: 'open_in_new', onclick: () => window.open(hrefValue)
        }, {
            title: '複製連結',
            class: 'bee_link',
            icon: 'link',
            onclick: () => navigator.clipboard.writeText("https://forum.gamer.com.tw/" + hrefValue)
        }];

        buttons.forEach(button => {
            const a = document.createElement('a');
            a.title = button.title;
            a.className = `btn-icon btn-icon--inverse ${button.class}`;
            a.style.display = 'none';
            if (button.onclick) {
                a.onclick = button.onclick;
            }

            const i = document.createElement('i');
            i.className = `material-icons ${button.class}`;
            i.textContent = button.icon;
            //i.style.display = 'none';

            if (!isDarkTheme) {
                i.style.color = 'rgba(0, 0, 0, 0.4)';
            }

            a.appendChild(i);
            td.appendChild(a);
        });

        // 將生成的 <td> 插入到 .b-list__main 的相應位置
        document.querySelectorAll('.b-list__main')[i2].insertAdjacentElement('afterend', td);
    }

    // 文章列表元素
    let rows = document.querySelectorAll('.b-list__row');

    // 添加事件監聽器 - 顯示/隱藏元素
    rows.forEach((row) => {
        // Add hover event listener
        row.addEventListener('mouseover', function () {
            // Show elements
            let beePreview = row.querySelector('.bee_preview');
            let beeOpenNewWd = row.querySelector('.bee_open_new_wd');
            let beeLink = row.querySelector('.bee_link');

            if (beePreview) beePreview.style.display = '';
            if (beeOpenNewWd) beeOpenNewWd.style.display = '';
            if (beeLink) beeLink.style.display = '';
        });

        row.addEventListener('mouseout', function () {
            // Hide elements
            let beePreview = row.querySelector('.bee_preview');
            let beeOpenNewWd = row.querySelector('.bee_open_new_wd');
            let beeLink = row.querySelector('.bee_link');

            if (beePreview) beePreview.style.display = 'none';
            if (beeOpenNewWd) beeOpenNewWd.style.display = 'none';
            if (beeLink) beeLink.style.display = 'none';
        });
    });

}

function bPage_previewAuto() {
    let picMode = document.querySelectorAll('.imglist-text').length !== 0;
    if (picMode) {
        let switchTopics = document.querySelectorAll('.b-list__main');
        switchTopics.forEach((switchTopic) => {
            let topicTexts = switchTopic.childNodes[1].childNodes[3];
            //only in pic mode will trigger
            if (topicTexts.className === "imglist-text") {
                switchTopic.childNodes[1].removeChild(topicTexts);
                switchTopic.insertAdjacentHTML('beforeend', topicTexts.outerHTML);
            }
        });
    }

    let bListMainTitles = document.querySelectorAll('.b-list__main__title');
    bListMainTitles.forEach((bListMainTitle) => {
        bListMainTitle.addEventListener('click', (e) => {
            e.preventDefault();
            let href = bListMainTitle.parentNode.parentNode.querySelector('.b-list__main__title').getAttribute('href');
            openInFrame(`https://forum.gamer.com.tw/${href}`);
            return false;
        });
    });
    let bListMainTitlesPages = document.querySelectorAll(!picMode ? '#BH-master > form > div > table > tbody > tr > td.b-list__main > span > a'
        : '#BH-master > form > div > table > tbody > tr > td.b-list__main > div > div > span > span');
    bListMainTitlesPages.forEach((bListMainTitlePage) => {
        bListMainTitlePage.addEventListener('click', (e) => {
            e.preventDefault();
            let href = bListMainTitlePage.getAttribute(!picMode ? 'href'
                : 'data-page');
            openInFrame(`https://forum.gamer.com.tw/${href}`);
            return false;
        });
    });

}

function openInFrame(url) {
    let iframe = document.getElementById('bee_frame');
    iframe.src = url;

    let BHMenuPath = document.querySelector('#BH-menu-path');
    BHMenuPath.style.height = '100%';
    BHMenuPath.style.opacity = '0.6';

    setTimeout(() => {
        document.querySelector('.bee_preview_wd').style.transform = 'translateX(0%) scaleX(' + 1 + ')';
        document.querySelector('.bee_preview_wd').style.opacity = '1';
    }, 500);

    //wait 1 sec
    setTimeout(() => {
        let iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        let styleSheet = iframeDoc.createElement('style');
        iframeDoc.head.appendChild(styleSheet);
        let sheet = styleSheet.sheet;
        sheet.insertRule('.managertools { position: fixed; bottom: 0; right: 0; z-index: 100; }', 0);
    }, 1000);


    /*iframe.onload = function () {
        let iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        let iframeElement = iframeDoc.querySelector('.managertools');
        iframeElement.style.position = 'fixed';
        iframeElement.style.top = '0';
        iframeElement.style.right = '0';
        iframeElement.style.zIndex = '100';
    };*/
    /*document.getElementById('bee_frame').src = url;
    let BHMenuPath = document.querySelector('#BH-menu-path');
    BHMenuPath.style.height = '100%';
    BHMenuPath.style.opacity = '0.6';
    //run after 0.5s
    setTimeout(() => {
        //document.querySelector('.bee_preview_wd').style.width = localStorage.getItem("preview_size");
        document.querySelector('.bee_preview_wd').style.transform = 'translateX(0%) scaleX(' + 1 + ')';
        document.querySelector('.bee_preview_wd').style.opacity = '1';
    }, 500);
    //change the element in iframe '#BH-master > form:nth-child(5) > section:nth-child(52) > div' css to 'position: fixed; top: 0; right: 0;' while iframe loaded
    document.getElementById('bee_frame').onload = function () {
        let iframe = document.getElementById('bee_frame');
        let iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        let iframeElement = iframeDoc.querySelector('#BH-master > form > section > div');
        iframeElement.style.position = 'fixed';
        iframeElement.style.top = '0';
        iframeElement.style.right = '0';
    };*/

}

function bPage_addBorderInPicMode() {
    const all_blocks_pic_mode = document.querySelectorAll('#BH-master > form > div > table > tbody > tr > td.b-list__main > div > p');
    Array.from(all_blocks_pic_mode).forEach(function (link) {
        link.style.borderTop = 'dashed';
    });
}

function loadTips() {
    if (!window.location.href.includes('forum.gamer.com.tw/B.php')) {
        return;
    }
    let picMode;
    picMode = document.querySelectorAll('.imglist-text').length !== 0;

    let link = document.createElement('link');
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.css";
    document.head.appendChild(link);

    let script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.js.iife.js";
    script.onload = function () {
        const driver = window.driver.js.driver;
        const driverObj = driver({
            showButtons: ['next', 'previous'/*, 'close'*/],
            allowClose: false,
            nextBtnText: '▶',
            prevBtnText: '◀',
            doneBtnText: '好耶',
            /*onCloseClick: () => {
                driverObj.destroy();
            },*/
            showProgress: true,
            steps: [{
                element: '#BH-menu-path > ul > ul > li.BH-menu-forumA-right.dropList', popover: {
                    title: '客製化設定', description: '在這裡可以進行詳細的個人設定，設定變更後需要【重新整理】頁面才會生效。'
                }
            }, {
                element: picMode ? '#BH-master > form > div > table > tbody > tr > td.b-list__main > div > div > p'
                    : '#BH-master > form > div > table > tbody > tr > td.b-list__main > a',
                popover: {
                    title: '即時瀏覽',
                    description: '如果開啟「點擊時使用即時預覽」，文章標題的跳轉會以即時預覽的方式啟動。',
                    side: "bottom",
                },
            }, {
                element: '#BH-master > form > div > table > tbody > tr > td.b-list__main',
                popover: {
                    title: '快速選取',
                    description: '除了文章標題、縮圖模式的預覽圖，其他區域可以觸發快速選取。功能等同左方的勾選方塊。',
                    side: "bottom",
                    onNextClick: () => {
                        document.querySelector('#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > a.btn-icon.btn-icon--inverse.bee_preview')
                            .style.display = 'inline-block';
                        document.querySelector('#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > a.btn-icon.btn-icon--inverse.bee_open_new_wd')
                            .style.display = 'inline-block';
                        document.querySelector('#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > a.btn-icon.btn-icon--inverse.bee_link')
                            .style.display = 'inline-block';
                        driverObj.moveNext();
                    }
                },
            }, {
                element: picMode ? '#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3)'
                    : '#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3)',
                popover: {
                    title: '功能按鈕',
                    description: '如果開啟「插入功能按鈕」，指標指向的文章後方會出現三個功能按鈕，分別是「即時預覽」「新分頁開啟」「複製連結」。',
                    side: "bottom",
                    onNextClick: () => {
                        document.querySelector('#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > a.btn-icon.btn-icon--inverse.bee_preview')
                            .style.display = 'none';
                        document.querySelector('#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > a.btn-icon.btn-icon--inverse.bee_open_new_wd')
                            .style.display = 'none';
                        document.querySelector('#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > a.btn-icon.btn-icon--inverse.bee_link')
                            .style.display = 'none';
                        document.querySelector(picMode ? '#BH-master > form > div > table > tbody > tr:nth-child(2) > td.b-list__main > div > a'
                            : '#BH-master > form > div > table > tbody > tr:nth-child(2) > td.b-list__main > a').click();

                        driverObj.moveNext();
                    }
                },
            }, {
                element: '#BH-master > form > section:last-child > div',
                popover: {
                    title: '功能選單',
                    description: '快速預覽視窗中，功能選單會漂浮在下方，方便使用！',
                    side: "bottom",
                    onPrevClick: () => {
                        document.querySelector('#BH-menu-path').click();
                        document.querySelector('#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > a.btn-icon.btn-icon--inverse.bee_preview')
                            .style.display = 'inline-block';
                        document.querySelector('#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > a.btn-icon.btn-icon--inverse.bee_open_new_wd')
                            .style.display = 'inline-block';
                        document.querySelector('#BH-master > form > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > a.btn-icon.btn-icon--inverse.bee_link')
                            .style.display = 'inline-block';
                        driverObj.movePrevious();
                    },
                    onNextClick: () => {
                        document.querySelector('#BH-menu-path').click();
                        driverObj.moveNext();
                    }
                },
            }]
        });
        driverObj.drive();
    };
    document.head.appendChild(script);
}

function reportAlert() {
    if (!window.location.href.includes('forum.gamer.com.tw/B.php') || !localStorage.getItem("showAbuse") === "true") {
        return;
    }
    let isReported = document.querySelector('#BH-slave > div.BH-rbox.FM-rbox14 > div.FM-master-btn > a > span') !== null;
    if (!isReported) {
        return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    if(!urlParams.get('bsn')){
        console.log("[WARN] 有檢舉但抓取連結失敗");
        return;
    }
    openInFrame("https:////forum.gamer.com.tw/gemadmin/accuse.php?bsn=" + urlParams.get('bsn'));
}

/////////

function addCrossListener_old() {
    if (window.location.href.includes('forum.gamer.com.tw')) {
        window.addEventListener('message', function (event) {
            // 檢查來源是否可信
            if (event.origin !== 'https://home.gamer.com.tw') return;

            let data = JSON.parse(event.data);

            if (data.method === 'set') {
                localStorage.setItem(data.key, data.value);
            }

            if (data.method === 'get') {
                let result = localStorage.getItem(data.key);
                event.source.postMessage(JSON.stringify(result), event.origin);
            }
        }, false);
    }
}

function addSettingElement_old() {
    if (window.location.href.includes('home.gamer.com.tw/setting/forum')) {
        // 取得 management-item 元素
        const lastManagementItem = document.querySelector('.management-item:last-child');

        //append iframe
        const iframe = document.createElement('iframe');
        iframe.src = 'https://forum.gamer.com.tw';
        iframe.style.display = 'none';
        iframe.id = 'bee_settings_iframe';
        lastManagementItem.appendChild(iframe);

        // 插入新內容到最後一個 management-item 元素中
        const sectionTitle = document.createElement('h3');
        sectionTitle.className = 'section-title';
        sectionTitle.textContent = '插件設定';
        lastManagementItem.appendChild(sectionTitle);

        lastManagementItem.appendChild(createItemCard('add_function', '標題後方插入功能按鈕'));
        lastManagementItem.appendChild(createItemCard('preview_auto', '點擊文章時使用即時瀏覽'));
        lastManagementItem.appendChild(createItemCard('preview_LR', '即時瀏覽從右方彈出（取消則從左）'));
        lastManagementItem.appendChild(createItemCard(null, null, {
            inputId: 'preview_size', labelText: '即時瀏覽視窗的大小'
        }));
        lastManagementItem.appendChild(createItemCard('new_design', '自適型版面（根據下方自定比例適應）'));
        lastManagementItem.appendChild(createItemCard(null, null, {
            inputId: 'new_design_box', labelText: '　└　整體顯示區域佔比（文章+聊天室佔整個畫面的比例，< 100%）'
        }));
        lastManagementItem.appendChild(createItemCard(null, null, {
            inputId: 'new_design_box_Left', labelText: '　　　├　文章佔比（與聊天室佔比總和 <= 100%）'
        }));
        lastManagementItem.appendChild(createItemCard(null, null, {
            inputId: 'new_design_box_Right', labelText: '　　　└　聊天室佔比'
        }));
        lastManagementItem.appendChild(createItemCard('new_design_LRSwitch', '左右對調（聊天室在左方，讓文章標題在螢幕中間）'));
        // createItemCard  會因為 id===bee_select_color 而增加寬度
        lastManagementItem.appendChild(createItemCard(null, null, {
            inputId: 'bee_select_color', labelText: '勾選文章時的顏色（可含有透明度屬性）'
        }));

    }
}

// 項目卡函數
function createItemCard_old(inputId, labelText, additionalContent = null) {
    const itemCard = document.createElement('div');
    itemCard.className = 'item-card management_guild-check single-choice';

    const checkGroup = document.createElement('div');
    checkGroup.className = 'check-group';

    if (inputId) {
        const input = document.createElement('input');
        input.id = inputId;
        input.type = 'checkbox';

        // 如果 localStorage 有儲存的值，則設置為該值，否則預設為 checked
        input.checked = localStorage.getItem(inputId) === 'true';

        const label = document.createElement('label');
        label.htmlFor = inputId;
        label.className = 'is-active';

        const labelIcon = document.createElement('div');
        labelIcon.className = 'label-icon';
        const icon = document.createElement('i');
        icon.className = 'fa fa-check';
        labelIcon.appendChild(icon);

        const h6 = document.createElement('h6');
        h6.textContent = labelText;

        label.appendChild(labelIcon);
        label.appendChild(h6);

        checkGroup.appendChild(input);
        checkGroup.appendChild(label);

        // 添加 input 事件監聽器，將值保存到 localStorage
        input.addEventListener('input', function () {
            localStorage.setItem(inputId, this.checked);
        });
    }

    if (additionalContent) {
        const h6 = document.createElement('h6');
        h6.textContent = additionalContent.labelText;
        checkGroup.appendChild(h6);

        const input = document.createElement('input');
        input.className = 'form-control';
        input.id = additionalContent.inputId;
        input.type = 'text';
        input.size = 25;
        input.style.margin = '10px';
        input.style.width = additionalContent.inputId === "bee_select_color" ? '120px' : '70px';

        // 如果 localStorage 有儲存的值，則設置為該值
        input.value = localStorage.getItem(additionalContent.inputId) || '';

        checkGroup.appendChild(input);

        // 添加 input 事件監聽器，將值保存到 localStorage
        input.addEventListener('input', function () {
            localStorage.setItem(additionalContent.inputId, this.value);
        });
    }

    itemCard.appendChild(checkGroup);
    return itemCard;
}

