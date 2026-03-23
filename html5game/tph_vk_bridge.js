// Автоматическая загрузка VK SDK (аналог Яндекс.SDK)
(function (d) {
    console.log('VKBridge: Starting load script...');
    let t = d.getElementsByTagName('script')[0];
    let s = d.createElement('script');
    s.src = 'https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js';
    s.async = true;
    t.parentNode.insertBefore(s, t);
    // Когда сам файл библиотеки загрузился, вызываем внутренний инит
    s.onload = function() {
        console.log('VKBridge: SDK Script loaded from CDN');
    };
})(document);

var VKBridgeGMS = {
    _mapType: "VKBridge",
    _request_id: 100,
    _is_init: false,

    // Поиск API GameMaker (как в Яндексе)
    getAPI: function() {
        if (typeof g_pBuiltInCallbacks !== 'undefined') return g_pBuiltInCallbacks;
        if (window.g_pBuiltInCallbacks) return window.g_pBuiltInCallbacks;
        return null;
    },

    // Отправка события (с проверкой наличия API)
    send: function (req_id, event_name, data = null) {
        let self = this;
        // Используем setTimeout(..., 0) как в Яндексе для асинхронности
        setTimeout(function() {
            let api = self.getAPI();
            let map = {
                "type": self._mapType,
                "request_id": Number(req_id),
                "event": String(event_name),
                "data": (typeof data === 'object' && data !== null) ? JSON.stringify(data) : String(data)
            };

            if (api && api.send_async_event_social) {
                api.send_async_event_social(map);
            } else {
                console.warn("VKBridge: GMS API not ready, retrying send...");
                setTimeout(() => self.send(req_id, event_name, data), 50);
            }
        }, 0);
    }
};

// --- ВНЕШНИЕ ФУНКЦИИ (GMS External Names) ---

function js_vk_init() {
    let req_id = ++VKBridgeGMS._request_id;
    
    // Проверяем, прогрузился ли скрипт в window
    if (!window.vkBridge) {
        console.error("VKBridge: window.vkBridge not found yet!");
        return req_id; 
    }

    window.vkBridge.send("VKWebAppInit")
        .then(() => {
            VKBridgeGMS._is_init = true;
            VKBridgeGMS.send(req_id, "init_success");
            console.log("VKBridge: VKWebAppInit Success");
        })
        .catch(err => VKBridgeGMS.send(req_id, "init_error", err));

    return req_id;
}

function js_vk_get_init_status() {
    // Эта функция будет вызываться в Alarm[0], как YaGames_getInitStatus
    return VKBridgeGMS._is_init ? 1 : 0;
}

function js_vk_get_data(key) {
    let req_id = ++VKBridgeGMS._request_id;
    window.vkBridge.send("VKWebAppStorageGet", { keys: [key] })
        .then(res => {
            let val = (res.keys && res.keys[0]) ? res.keys[0].value : "";
            VKBridgeGMS.send(req_id, "get_data_success", val);
        })
        .catch(err => VKBridgeGMS.send(req_id, "get_data_error", err));
    return req_id;
}

// ... Аналогично добавь js_vk_save_data и рекламу