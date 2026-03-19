var VK_GMS = {
    _request_id: 0,
    newRequest: function() { return ++this._request_id; },
    
    // Отправка объекта, который GM примет в Async Social
    send: function(req_id, status, data = null) {
        var response = {
            "type": "VKBridge",
            "request_id": req_id,
            "status": status,
            "data": data ? String(data) : ""
        };
        if (typeof GML_SendAsync === 'function') {
            GML_SendAsync(response);
        }
    }
};

function vk_init() {
    var req_id = VK_GMS.newRequest();
    if (window.vkBridge) {
        window.vkBridge.send('VKWebAppInit')
            .then(() => VK_GMS.send(req_id, "success"))
            .catch(() => VK_GMS.send(req_id, "error"));
    }
    return req_id;
}

function vk_get_data(key) {
    var req_id = VK_GMS.newRequest();
    if (window.vkBridge) {
        window.vkBridge.send('VKWebAppStorageGet', { keys: [key] })
            .then(res => {
                var val = (res.keys && res.keys[0]) ? res.keys[0].value : "";
                VK_GMS.send(req_id, "success", val);
            })
            .catch(() => VK_GMS.send(req_id, "error"));
    }
    return req_id;
}

function vk_save_data(key, value) {
    var req_id = VK_GMS.newRequest();
    if (window.vkBridge) {
        window.vkBridge.send('VKWebAppStorageSet', { key: key, value: String(value) })
            .then(() => VK_GMS.send(req_id, "success"))
            .catch(() => VK_GMS.send(req_id, "error"));
    }
    return req_id;
}