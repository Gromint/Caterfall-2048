// 1. Инициализация моста (аналог YaGames.js)
console.log("VKBridge: Script loading...");

var GMS_API = (function () {
    if (typeof g_pBuiltInCallbacks !== 'undefined') return g_pBuiltInCallbacks;
    if (window.g_pBuiltInCallbacks) return window.g_pBuiltInCallbacks;
    return null;
})();

var VKBridgeGMS = {
    _mapType: "VKBridge",
    _request_id: 100,
    _is_init: false,

    newRequest: function () {
        return ++this._request_id;
    },

    // Отправка события в Social Async (Other 70)
    send: function (req_id, event_name, data = null) {
        let self = this;
        setTimeout(function () {
            let map = {};
            map["type"] = self._mapType;
            map["request_id"] = Number(req_id);
            map["event"] = String(event_name);
            
            if (data !== null) {
                // Если это объект (например, от рекламы), превращаем в JSON
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

// --- ВНЕШНИЕ ФУНКЦИИ (External Names в GMS) ---

function js_vk_init() {
    let req_id = VKBridgeGMS.newRequest();
    setTimeout(function () {
        if (!window.vkBridge) {
            VKBridgeGMS.send(req_id, "init_error", "No vkBridge found");
            return;
        }
        window.vkBridge.send("VKWebAppInit")
            .then(() => {
                VKBridgeGMS._is_init = true;
                VKBridgeGMS.send(req_id, "init_success");
                console.log("VKBridge: Init Success");
            })
            .catch(err => VKBridgeGMS.send(req_id, "init_error", err));
    }, 0);
    return req_id;
}

function js_vk_get_init_status() {
    return VKBridgeGMS._is_init ? 1 : 0;
}

function js_vk_get_data(key) {
    let req_id = VKBridgeGMS.newRequest();
    setTimeout(function () {
        window.vkBridge.send("VKWebAppStorageGet", { keys: [key] })
            .then(res => {
                let val = (res.keys && res.keys[0]) ? res.keys[0].value : "";
                VKBridgeGMS.send(req_id, "get_data_success", val);
            })
            .catch(err => VKBridgeGMS.send(req_id, "get_data_error", err));
    }, 0);
    return req_id;
}

function js_vk_save_data(key, value) {
    let req_id = VKBridgeGMS.newRequest();
    setTimeout(function () {
        window.vkBridge.send("VKWebAppStorageSet", {
            key: key,
            value: String(value)
        })
        .then(() => VKBridgeGMS.send(req_id, "save_data_success"))
        .catch(err => VKBridgeGMS.send(req_id, "save_data_error", err));
    }, 0);
    return req_id;
}

function js_vk_show_ads() {
    let req_id = VKBridgeGMS.newRequest();
    setTimeout(function () {
        window.vkBridge.send("VKWebAppShowNativeAds", { ad_format: "interstitial" })
            .then(res => VKBridgeGMS.send(req_id, "ads_success", res))
            .catch(err => VKBridgeGMS.send(req_id, "ads_error", err));
    }, 0);
    return req_id;
}

function js_vk_show_rewarded_ads() {
    let req_id = VKBridgeGMS.newRequest();
    setTimeout(function () {
        window.vkBridge.send("VKWebAppShowNativeAds", { ad_format: "reward" })
            .then(res => VKBridgeGMS.send(req_id, "reward_success", res))
            .catch(err => VKBridgeGMS.send(req_id, "reward_error", err));
    }, 0);
    return req_id;
}