var VK_GMS = {
    _type: "VKBridge",
    _request_id: 0,
    _is_ready: false,

    // Генерация ID запроса
    newRequest: function() {
        return ++this._request_id;
    },

    // Безопасное приведение данных к строке для GML
    safeString: function(e) {
        try {
            if (typeof e === "number") return String(e);
            if (typeof e === "boolean") return e ? "1" : "0";
            if (typeof e === "object") return JSON.stringify(e);
            return String(e);
        } catch (err) { return ""; }
    },

    // Отправка данных в Async Social Event
    send: function(req_id, status, data = null) {
        var response = {
            "type": this._type,
            "request_id": req_id,
            "status": status,
            "data": this.safeString(data)
        };
        if (typeof GML_SendAsync === 'function') {
            GML_SendAsync(response);
        }
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
        // Если скрипт еще не подгрузился, пробуем снова через 200мс
        setTimeout(vk_init, 200);
    }
    return req_id;
}

function vk_get_init_status() {
    return VK_GMS._is_ready ? 1 : 0;
}

function vk_get_data(key) {
    var req_id = VK_GMS.newRequest();
    if (!VK_GMS._is_ready) return -1;

    window.vkBridge.send('VKWebAppStorageGet', { keys: [key] })
        .then(res => {
            var val = (res.keys && res.keys[0]) ? res.keys[0].value : "";
            VK_GMS.send(req_id, "success", val);
        })
        .catch(() => VK_GMS.send(req_id, "error"));
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