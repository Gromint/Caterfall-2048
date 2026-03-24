(function (d) {
    console.log('VK SDK start load script');
    let t = d.getElementsByTagName('script')[0];
    let s = d.createElement('script');
    s.src = 'https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js';
    s.async = true;
    t.parentNode.insertBefore(s, t);
    s.onload = js_vk_init;
})(document);

var VKBridgeGMS = {
    _mapTypeDesc: "VKBridge",
    _request_id: 100,
    _is_init: false,

    newRequest: function () {
        return ++this._request_id;
    },

    send: function (request_id, event, data = null) {
        // Копируем один-в-один проверку из Яндекса
        if (window.GMS_API && window.GMS_API.send_async_event_social) {
            var map = {
                "type": this._mapTypeDesc,
                "request_id": request_id,
                "event": event
            };
            if (data !== null) {
                map["data"] = (typeof data === 'object') ? JSON.stringify(data) : data;
            }
            window.GMS_API.send_async_event_social(map);
        }
    },

    sendError: function (request_id, event, error) {
        this.send(request_id, event, error ? error.toString() : "Error");
    }
};

function js_vk_init() {
    if (typeof vkBridge !== 'undefined') {
        vkBridge.send('VKWebAppInit')
            .then(data => {
                VKBridgeGMS._is_init = true;
                VKBridgeGMS.send(-1, "initSuccess");
            })
            .catch(error => {
                VKBridgeGMS.sendError(-1, "initError", error);
            });
    }
    return 1;
}

function js_vk_get_init_s() {
    return VKBridgeGMS._is_init ? 1 : 0;
}

function js_vk_show_ads() {
    let self = VKBridgeGMS;
    let req_id = self.newRequest();
    vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'interstitial' })
        .then(data => {
            if (data.result) self.send(req_id, "adClosed");
            else self.sendError(req_id, "adError", "failed");
        })
        .catch(error => self.sendError(req_id, "adError", error));
    return req_id;
}

function js_vk_show_rewarded_ads() {
    let self = VKBridgeGMS;
    let req_id = self.newRequest();
    vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'reward' })
        .then(data => {
            if (data.result) self.send(req_id, "rewardedReceived");
            else self.sendError(req_id, "rewardedError", "failed");
        })
        .catch(error => self.sendError(req_id, "rewardedError", error));
    return req_id;
}

function js_vk_save_data(key, value) {
    let self = VKBridgeGMS;
    let req_id = self.newRequest();
    vkBridge.send('VKWebAppStorageSet', { key: String(key), value: String(value) })
        .then(() => self.send(req_id, "saveSuccess", key))
        .catch(error => self.sendError(req_id, "saveError", error));
    return String(req_id);
}

function js_vk_get_data(key) {
    let self = VKBridgeGMS;
    let req_id = self.newRequest();
    vkBridge.send('VKWebAppStorageGet', { keys: [String(key)] })
        .then(data => {
            if (data.keys && data.keys[0] && data.keys[0].value) {
                self.send(req_id, "getDataSuccess", data.keys[0].value);
            } else {
                self.send(req_id, "getDataEmpty", "");
            }
        })
        .catch(error => self.sendError(req_id, "getDataError", error));
    return String(req_id);
}