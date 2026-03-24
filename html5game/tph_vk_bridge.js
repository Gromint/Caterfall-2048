// Автоматическая инициализация скрипта VK Bridge
(function (d) {
    console.log('VK Bridge SDK start load');
    let t = d.getElementsByTagName('script')[0];
    let s = d.createElement('script');
    s.src = 'https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js';
    s.async = true;
    t.parentNode.insertBefore(s, t);
    s.onload = function() {
        console.log('VK Bridge SDK script loaded');
        // Автоматический запуск инициализации после загрузки скрипта
        js_vk_init();
    };
})(document);

var VKBridgeGMS = {
    _mapTypeDesc: "VKBridge", // Тип события для проверки в Async Social
    _request_id: 100,
    _is_init: false,

    // Генерация уникального ID запроса
    newRequest: function () {
        return ++this._request_id;
    },

    // Отправка данных обратно в Game Maker
    send: function (request_id, event, data = null) {
        if (window.GMS_API && window.GMS_API.send_async_event_social) {
            var map = {
                "type": this._mapTypeDesc,
                "request_id": request_id,
                "event": event
            };
            if (data !== null) {
                map["data"] = (typeof data === 'object') ? JSON.stringify(data) : data;
            }
            window.GMS_API.send_async_event_social(map);
        }
    },

    // Отправка ошибки
    sendError: function (request_id, event, error) {
        console.error("VK Bridge Error:", event, error);
        this.send(request_id, event, { error: error.toString() });
    }
};

/**
 * Инициализация VK Bridge
 */
function js_vk_init() {
    vkBridge.send('VKWebAppInit')
        .then(data => {
            VKBridgeGMS._is_init = true;
            VKBridgeGMS.send(-1, "initSuccess");
        })
        .catch(error => {
            VKBridgeGMS.sendError(-1, "initError", error);
        });
    return 1;
}

/**
 * Проверка статуса инициализации
 */
function js_vk_get_init_s() {
    return VKBridgeGMS._is_init ? 1 : 0;
}

/**
 * Показ обычной межстраничной рекламы (Interstitial)
 */
function js_vk_show_ads() {
    let req_id = VKBridgeGMS.newRequest();
    vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'interstitial' })
        .then(data => {
            if (data.result) {
                VKBridgeGMS.send(req_id, "adClosed");
            } else {
                VKBridgeGMS.sendError(req_id, "adError", "Ad failed to show");
            }
        })
        .catch(error => {
            VKBridgeGMS.sendError(req_id, "adError", error);
        });
    return req_id;
}

/**
 * Показ рекламы с вознаграждением (Rewarded)
 */
function js_vk_show_rewarded_ads() {
    let req_id = VKBridgeGMS.newRequest();
    vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'reward' })
        .then(data => {
            if (data.result) {
                VKBridgeGMS.send(req_id, "rewardedReceived");
            } else {
                VKBridgeGMS.sendError(req_id, "rewardedError", "Reward failed");
            }
        })
        .catch(error => {
            VKBridgeGMS.sendError(req_id, "rewardedError", error);
        });
    return req_id;
}

/**
 * Сохранение данных (Cloud Storage)
 */
function js_vk_save_data(key, value) {
    let req_id = VKBridgeGMS.newRequest();
    vkBridge.send('VKWebAppStorageSet', {
        key: String(key),
        value: String(value)
    })
    .then(data => {
        if (data.result) {
            VKBridgeGMS.send(req_id, "saveSuccess", key);
        }
    })
    .catch(error => {
        VKBridgeGMS.sendError(req_id, "saveError", error);
    });
    return String(req_id);
}

/**
 * Получение данных (Cloud Storage)
 */
function js_vk_get_data(key) {
    let req_id = VKBridgeGMS.newRequest();
    vkBridge.send('VKWebAppStorageGet', {
        keys: [String(key)]
    })
    .then(data => {
        if (data.keys && data.keys[0]) {
            VKBridgeGMS.send(req_id, "getDataSuccess", data.keys[0].value);
        } else {
            VKBridgeGMS.send(req_id, "getDataEmpty", "");
        }
    })
    .catch(error => {
        VKBridgeGMS.sendError(req_id, "getDataError", error);
    });
    return String(req_id);
}