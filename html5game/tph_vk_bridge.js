// Инициализация GMS_API (как в CrazyGames)
const GMS_API = (function() {
    if (typeof g_pBuiltInCallbacks !== 'undefined') return g_pBuiltInCallbacks;
    return window.g_pBuiltInCallbacks || null;
})();

const VK_GMS_Internal = {
    // Вызов GML скрипта с передачей данных
    execute_callback: function(_callback_id, _data) {
        if (GMS_API && GMS_API.get_function) {
            const _cb = GMS_API.get_function(_callback_id);
            if (_cb) {
                // Если пришел объект, превращаем в JSON-строку для GML
                let payload = (typeof _data === 'object' && _data !== null) ? JSON.stringify(_data) : String(_data);
                return _cb(null, null, payload);
            }
        }
        console.error("VK_GMS: Callback Error - API not found or script ID invalid");
    }
};

// --- ВНЕШНИЕ ФУНКЦИИ (External Names в GMS) ---

function js_vk_init(cb_success, cb_error) {
    if (!window.vkBridge) {
        VK_GMS_Internal.execute_callback(cb_error, "no_sdk");
        return;
    }
    window.vkBridge.send("VKWebAppInit")
        .then(() => VK_GMS_Internal.execute_callback(cb_success, "ready"))
        .catch(err => VK_GMS_Internal.execute_callback(cb_error, err));
}

function js_vk_get_data(key, cb_success, cb_error) {
    window.vkBridge.send("VKWebAppStorageGet", { keys: [key] })
        .then(res => {
            let val = (res.keys && res.keys[0]) ? res.keys[0].value : "";
            VK_GMS_Internal.execute_callback(cb_success, val);
        })
        .catch(err => VK_GMS_Internal.execute_callback(cb_error, err));
}

function js_vk_save_data(key, value, cb_success, cb_error) {
    window.vkBridge.send("VKWebAppStorageSet", { key: key, value: String(value) })
        .then(() => VK_GMS_Internal.execute_callback(cb_success, "saved"))
        .catch(err => VK_GMS_Internal.execute_callback(cb_error, err));
}

function js_vk_show_ads(cb_success, cb_error) {
    window.vkBridge.send("VKWebAppShowNativeAds", { ad_format: "interstitial" })
        .then(res => VK_GMS_Internal.execute_callback(cb_success, res))
        .catch(err => VK_GMS_Internal.execute_callback(cb_error, err));
}