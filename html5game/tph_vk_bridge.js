var VK_GMS = {
    _request_id: 0,
    _is_ready: false,

    newRequest: function() { return ++this._request_id; },

    safeString: function(e) {
        if (e === null || e === undefined) return "null";
        try {
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
        
        console.log("JS: Dispatching via gmcallback...", response);
        
        // Вызываем GML скрипт. В HTML5 GM создаёт эту функцию в window автоматически
        if (typeof window.gmcallback_vk_receiver === 'function') {
            window.gmcallback_vk_receiver(JSON.stringify(response));
        } else {
            console.warn("JS: gmcallback_vk_receiver not ready yet");
        }
    }
};

// --- ОСНОВНЫЕ ФУНКЦИИ ---

function vk_init() {
    var req_id = VK_GMS.newRequest();
    
    // Проверяем наличие vkBridge без рекурсии внутри функции
    if (window.vkBridge) {
        window.vkBridge.send('VKWebAppInit')
            .then(() => {
                VK_GMS._is_ready = true;
                VK_GMS.send(req_id, "success");
            })
            .catch((err) => {
                console.error("JS: VK Init Error", err);
                VK_GMS.send(req_id, "error");
            });
    } else {
        console.error("JS: vkBridge not found in window!");
        // Шлём ошибку через мгновение, чтобы GML успел получить ID
        setTimeout(function() { VK_GMS.send(req_id, "error"); }, 50);
    }
    return req_id; 
}

function vk_get_init_status() {
    return VK_GMS._is_ready ? 1 : 0;
}

function vk_get_data(key) {
    var req_id = VK_GMS.newRequest();
    if (!window.vkBridge) return -1;

    window.vkBridge.send('VKWebAppStorageGet', { keys: [key] })
        .then(res => {
            var val = (res.keys && res.keys[0]) ? res.keys[0].value : "";
            VK_GMS.send(req_id, "success", val);
        })
        .catch(err => VK_GMS.send(req_id, "error", err));
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