// ==============================
// CORE: Связь с GameMaker
// ==============================
var GMS_API = (function() {
    if (typeof g_pBuiltInCallbacks !== 'undefined') return g_pBuiltInCallbacks;
    if (window.g_pBuiltInCallbacks) return window.g_pBuiltInCallbacks;
    return null;
})();

var VK_GMS = {
    _request_id: 0,
    _is_ready: false,

    newRequest: function() { return ++this._request_id; },

    // Отправка события напрямую в Async Social Event
    send: function(req_id, status, data = null) {
        let map = {};
        map["type"] = "VK_BRIDGE_EVENT"; 
        map["request_id"] = Number(req_id);
        map["status"] = String(status);
        map["data"] = (typeof data === 'object') ? JSON.stringify(data) : String(data);

        console.log("JS -> GMS:", map);

        if (GMS_API && GMS_API.send_async_event_social) {
            GMS_API.send_async_event_social(map);
        } else if (window.GMS_SocialEvent) {
            window.GMS_SocialEvent(JSON.stringify(map));
        } else {
            console.error("GMS API not found!");
        }
    }
};

// ==============================
// INIT
// ==============================
function js_vk_init() {
    let req_id = VK_GMS.newRequest();
    if (!window.vkBridge) {
        VK_GMS.send(req_id, "error", "bridge_missing");
        return req_id;
    }
    window.vkBridge.send("VKWebAppInit")
        .then(() => { 
            VK_GMS._is_ready = true; 
            VK_GMS.send(req_id, "success"); 
        })
        .catch(err => { VK_GMS.send(req_id, "error", err); });
    return req_id;
}

// ==============================
// STORAGE
// ==============================
function js_vk_get_data(key) {
    let req_id = VK_GMS.newRequest();
    window.vkBridge.send("VKWebAppStorageGet", { keys: [key] })
        .then(res => {
            let val = (res.keys && res.keys[0]) ? res.keys[0].value : "";
            VK_GMS.send(req_id, "success", val);
        })
        .catch(err => VK_GMS.send(req_id, "error", err));
    return req_id;
}

function js_vk_save_data(key, value) {
    let req_id = VK_GMS.newRequest();
    window.vkBridge.send("VKWebAppStorageSet", {
        key: key,
        value: String(value)
    })
    .then(() => VK_GMS.send(req_id, "success"))
    .catch(err => VK_GMS.send(req_id, "error", err));
    return req_id;
}

// ==============================
// ADS
// ==============================
function js_vk_show_ads() {
    let req_id = VK_GMS.newRequest();
    window.vkBridge.send("VKWebAppShowNativeAds", {
        ad_format: "interstitial"
    })
    .then(res => VK_GMS.send(req_id, "success", res))
    .catch(err => VK_GMS.send(req_id, "error", err));
    return req_id;
}

function js_vk_show_rewarded_ads() {
    let req_id = VK_GMS.newRequest();
    window.vkBridge.send("VKWebAppShowNativeAds", {
        ad_format: "reward"
    })
    .then(res => VK_GMS.send(req_id, "success", res))
    .catch(err => VK_GMS.send(req_id, "error", err));
    return req_id;
}