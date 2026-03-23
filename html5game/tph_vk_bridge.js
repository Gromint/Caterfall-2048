// Поиск внутреннего API GameMaker для отправки событий в GML
var GMS_API = (function () {
    if (typeof g_pBuiltInCallbacks !== 'undefined') return g_pBuiltInCallbacks;
    if (window.g_pBuiltInCallbacks) return window.g_pBuiltInCallbacks;
    return null;
})();

var VK_GMS = {
    _mapType: "VKBridge", // Ключ "type" для async_load
    _request_id: 100,
    _is_init: false,

    // Генерация нового ID запроса
    newRequest: function () {
        return ++this._request_id;
    },

    // Метод отправки данных в GameMaker (Async Social Event)
    send: function (req_id, event_name, data = null) {
        setTimeout(function() {
            let map = {};
            map["type"] = VK_GMS._mapType;
            map["request_id"] = Number(req_id);
            map["event"] = String(event_name);
            
            if (data !== null) {
                map["data"] = (typeof data === 'object') ? JSON.stringify(data) : String(data);
            }

            if (GMS_API && GMS_API.send_async_event_social) {
                GMS_API.send_async_event_social(map);
            } else if (window.GMS_SocialEvent) {
                window.GMS_SocialEvent(JSON.stringify(map));
            }
        }, 0);
    }
};

// --- ОСНОВНЫЕ ФУНКЦИИ ---

function js_vk_init() {
    let req_id = VK_GMS.newRequest();
    setTimeout(function() {
        if (!window.vkBridge) {
            VK_GMS.send(req_id, "init_error", "vkBridge not found");
            return;
        }
        window.vkBridge.send("VKWebAppInit")
            .then(() => {
                VK_GMS._is_init = true;
                VK_GMS.send(req_id, "init_success");
            })
            .catch(err => VK_GMS.send(req_id, "init_error", err));
    }, 0);
    return req_id;
}

function js_vk_get_init_status() {
    return VK_GMS._is_init ? 1 : 0;
}

function js_vk_get_data(key) {
    let req_id = VK_GMS.newRequest();
    setTimeout(function() {
        window.vkBridge.send("VKWebAppStorageGet", { keys: [key] })
            .then(res => {
                let val = (res.keys && res.keys[0]) ? res.keys[0].value : "";
                VK_GMS.send(req_id, "get_data_success", val);
            })
            .catch(err => VK_GMS.send(req_id, "get_data_error", err));
    }, 0);
    return req_id;
}

function js_vk_save_data(key, value) {
    let req_id = VK_GMS.newRequest();
    setTimeout(function() {
        window.vkBridge.send("VKWebAppStorageSet", {
            key: key,
            value: String(value)
        })
        .then(() => VK_GMS.send(req_id, "save_data_success"))
        .catch(err => VK_GMS.send(req_id, "save_data_error", err));
    }, 0);
    return req_id;
}

function js_vk_show_ads() {
    let req_id = VK_GMS.newRequest();
    setTimeout(function() {
        window.vkBridge.send("VKWebAppShowNativeAds", { ad_format: "interstitial" })
            .then(res => VK_GMS.send(req_id, "ads_success", res))
            .catch(err => VK_GMS.send(req_id, "ads_error", err));
    }, 0);
    return req_id;
}

function js_vk_show_rewarded_ads() {
    let req_id = VK_GMS.newRequest();
    setTimeout(function() {
        window.vkBridge.send("VKWebAppShowNativeAds", { ad_format: "reward" })
            .then(res => VK_GMS.send(req_id, "reward_success", res))
            .catch(err => VK_GMS.send(req_id, "reward_error", err));
    }, 0);
    return req_id;
}