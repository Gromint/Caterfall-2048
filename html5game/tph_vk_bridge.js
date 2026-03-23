// ==============================
// GLOBAL QUEUE
// ==============================
window.VK_QUEUE = [];

function vk_push_event(type, request_id, status, data = null) {
    const evt = {
        type: "VKBridge",
        request_id: request_id,
        status: status,
        data: data
    };

    console.log("VK EVENT (queued):", evt);
    window.VK_QUEUE.push(evt);
}


// ==============================
// CORE
// ==============================
var VK_GMS = {
    _request_id: 0,
    _is_ready: false,

    newRequest: function () {
        this._request_id++;
        return this._request_id;
    }
};


// ==============================
// INIT
// ==============================
function vk_init() {
    let req_id = VK_GMS.newRequest();

    if (!window.vkBridge) {
        vk_push_event("VKBridge", req_id, "error", "vkBridge not found");
        return req_id;
    }

    window.vkBridge.send("VKWebAppInit")
        .then(() => {
            VK_GMS._is_ready = true;
            vk_push_event("VKBridge", req_id, "success");
        })
        .catch(err => {
            vk_push_event("VKBridge", req_id, "error", err);
        });

    return req_id;
}

function vk_get_init_status() {
    return VK_GMS._is_ready ? 1 : 0;
}


// ==============================
// STORAGE
// ==============================
function vk_get_data(key) {
    let req_id = VK_GMS.newRequest();

    if (!VK_GMS._is_ready) {
        vk_push_event("VKBridge", req_id, "error", "not ready");
        return req_id;
    }

    window.vkBridge.send("VKWebAppStorageGet", { keys: [key] })
        .then(res => {
            let value = null;

            if (res.keys && res.keys.length > 0) {
                value = res.keys[0].value;
            }

            vk_push_event("VKBridge", req_id, "success", value);
        })
        .catch(err => {
            vk_push_event("VKBridge", req_id, "error", err);
        });

    return req_id;
}

function vk_save_data(key, value) {
    let req_id = VK_GMS.newRequest();

    if (!VK_GMS._is_ready) {
        vk_push_event("VKBridge", req_id, "error", "not ready");
        return req_id;
    }

    window.vkBridge.send("VKWebAppStorageSet", {
        key: key,
        value: String(value)
    })
    .then(() => vk_push_event("VKBridge", req_id, "success"))
    .catch(err => vk_push_event("VKBridge", req_id, "error", err));

    return req_id;
}


// ==============================
// ADS
// ==============================
function vk_show_ads() {
    let req_id = VK_GMS.newRequest();

    window.vkBridge.send("VKWebAppShowNativeAds", {
        ad_format: "interstitial"
    })
    .then(res => vk_push_event("VKBridge", req_id, "success", res))
    .catch(err => vk_push_event("VKBridge", req_id, "error", err));

    return req_id;
}

function vk_show_rewarded_ads() {
    let req_id = VK_GMS.newRequest();

    window.vkBridge.send("VKWebAppShowNativeAds", {
        ad_format: "reward"
    })
    .then(res => vk_push_event("VKBridge", req_id, "success", res))
    .catch(err => vk_push_event("VKBridge", req_id, "error", err));

    return req_id;
}


// ==============================
// POLL FUNCTION (ВАЖНО)
// ==============================

function vk_poll_event() {
    if (window.VK_QUEUE.length === 0) return null;
    return window.VK_QUEUE.shift();
}