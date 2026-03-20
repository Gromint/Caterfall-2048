var VK_GMS = {
    _type: "VKBridge",
    _request_id: 0,
    _is_ready: false,

    newRequest: function() { return ++this._request_id; },

    safeString: function(e) {
        try {
            if (typeof e === "number") return String(e);
            if (typeof e === "boolean") return e ? "1" : "0";
            if (typeof e === "object") return JSON.stringify(e);
            return String(e);
        } catch (err) { return ""; }
    },

    send: function(req_id, status, data = null) {
        var response = {
            "type": "VKBridge",
            "request_id": Number(req_id),
            "status": String(status),
            "data": this.safeString(data)
        };
        var jsonResponse = JSON.stringify(response);
        console.log("JS: Dispatching via gmcallback...", response);
    
        window.gmcallback_vk_receiver(jsonResponse);  // прямой вызов без проверки
    }
};

// --- ОСНОВНЫЕ ФУНКЦИИ ---

function vk_init() {
    var req_id = VK_GMS.newRequest();
    if (window.vkBridge) {
        window.vkBridge.send('VKWebAppInit')
            .then(() => {
                VK_GMS._is_ready = true;
                VK_GMS.send(req_id, "success");
            })
            .catch(() => VK_GMS.send(req_id, "error"));
    } else {
        console.error("JS: VK Bridge NOT FOUND during init!");
        // Вместо рекурсии сразу шлем ошибку, чтобы GML не ждал вечно
        setTimeout(() => VK_GMS.send(req_id, "error"), 100); 
    }
    return req_id; // Всегда возвращаем ID
}

function vk_get_init_status() {
    return VK_GMS._is_ready ? 1 : 0;
}

function vk_get_data(key) {
    var req_id = VK_GMS.newRequest();
    console.log("JS: vk_get_data called for key:", key, "Request ID:", req_id);
    
    window.vkBridge.send('VKWebAppStorageGet', { keys: [key] })
        .then(res => {
            console.log("JS: VK responded with data");
            var val = (res.keys && res.keys[0]) ? res.keys[0].value : "";
            VK_GMS.send(req_id, "success", val);
        })
        .catch(err => {
            console.error("JS: VK Get Data Error", err);
            VK_GMS.send(req_id, "error", JSON.stringify(err));
        });
    return req_id;
}

function vk_save_data(key, value) {
    var req_id = VK_GMS.newRequest();
    if (!VK_GMS._is_ready) return -1;

    window.vkBridge.send('VKWebAppStorageSet', { 
        key: key, 
        value: String(value) 
    })
    .then(() => VK_GMS.send(req_id, "success"))
    .catch(() => VK_GMS.send(req_id, "error"));
    
    return req_id;
}

function vk_show_ads() {
    var req_id = VK_GMS.newRequest();
    if (!VK_GMS._is_ready) return -1;

    window.vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'interstitial' })
        .then(() => VK_GMS.send(req_id, "success"))
        .catch(() => VK_GMS.send(req_id, "error"));
        
    return req_id;
}

function vk_show_rewarded_ads() {
    var req_id = VK_GMS.newRequest();
    if (!VK_GMS._is_ready) return -1;

    window.vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'reward' })
        .then(() => VK_GMS.send(req_id, "success"))
        .catch(() => VK_GMS.send(req_id, "error"));
        
    return req_id;
}