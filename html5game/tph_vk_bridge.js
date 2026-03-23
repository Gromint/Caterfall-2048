var VK_GMS = {
    _request_id: 0,
    _is_ready: false,

    newRequest: function () {
        this._request_id += 1;
        return this._request_id;
    },

    send: function (req_id, status, data = null) {
        var response = {
            type: "VKBridge",
            request_id: req_id,
            status: status,
            data: data // ❗ НИКАКОЙ сериализации тут
        };

        console.log("JS → GML:", response);

        if (typeof window.gmcallback_vk_receiver === "function") {
            window.gmcallback_vk_receiver(JSON.stringify(response));
        } else {
            console.error("JS: gmcallback_vk_receiver not found");
        }
    }
};

// --- проброс в window ---
window.gmcallback_vk_receiver = function (_json) {
    let data;

    try {
        data = JSON.parse(_json);
    } catch (e) {
        console.error("JSON parse error", e);
        return;
    }

    function trySend() {
        if (window.GML_SendAsync) {
            window.GML_SendAsync(data);
            return true;
        }
        return false;
    }

    // сразу пробуем
    if (trySend()) return;

    // если GM ещё не готов — ждём
    let tries = 0;
    let interval = setInterval(() => {
        if (trySend()) {
            clearInterval(interval);
        }

        tries++;
        if (tries > 50) {
            clearInterval(interval);
            console.error("GML_SendAsync not found!");
        }
    }, 100);
};


// ==============================
// INIT
// ==============================
function vk_init() {
    var req_id = VK_GMS.newRequest();

    if (!window.vkBridge) {
        console.error("JS: vkBridge not found");

        setTimeout(() => {
            VK_GMS.send(req_id, "error", "vkBridge not loaded");
        }, 50);

        return req_id;
    }

    window.vkBridge.send("VKWebAppInit")
        .then(() => {
            VK_GMS._is_ready = true;
            VK_GMS.send(req_id, "success");
        })
        .catch(err => {
            VK_GMS.send(req_id, "error", err);
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
    var req_id = VK_GMS.newRequest();

    if (!VK_GMS._is_ready) return -1;

    window.vkBridge.send("VKWebAppStorageGet", { keys: [key] })
        .then(res => {
            let value = null;

            if (res.keys && res.keys.length > 0) {
                value = res.keys[0].value; // может быть string или null
            }

            VK_GMS.send(req_id, "success", value);
        })
        .catch(err => {
            VK_GMS.send(req_id, "error", err);
        });

    return req_id;
}

function vk_save_data(key, value) {
    var req_id = VK_GMS.newRequest();

    if (!VK_GMS._is_ready) return -1;

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
function vk_show_ads() {
    var req_id = VK_GMS.newRequest();

    if (!VK_GMS._is_ready) return -1;

    window.vkBridge.send("VKWebAppShowNativeAds", {
        ad_format: "interstitial"
    })
    .then(res => VK_GMS.send(req_id, "success", res))
    .catch(err => VK_GMS.send(req_id, "error", err));

    return req_id;
}

function vk_show_rewarded_ads() {
    var req_id = VK_GMS.newRequest();

    if (!VK_GMS._is_ready) return -1;

    window.vkBridge.send("VKWebAppShowNativeAds", {
        ad_format: "reward"
    })
    .then(res => VK_GMS.send(req_id, "success", res))
    .catch(err => VK_GMS.send(req_id, "error", err));

    return req_id;
}