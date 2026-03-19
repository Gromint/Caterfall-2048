function vk_test_connection() {
    if (window.vkBridge) {
        console.log("JS: VK Bridge detected!");
        return 1;
    } else {
        console.log("JS: VK Bridge NOT found!");
        return 0;
    }
}

var vk_init_status = 0; // 0 - ожидание, 1 - успех, -1 - ошибка

function vk_init_start() {
    if (window.vkBridge) {
        window.vkBridge.send('VKWebAppInit')
            .then(() => {
                vk_init_status = 1;
                console.log("JS: VK Init Success");
            })
            .catch(() => {
                vk_init_status = -1;
                console.log("JS: VK Init Failed");
            });
    }
}

function vk_get_init_status() {
    return vk_init_status;
}

function vk_show_ads() {
    if (window.vkBridge) {
        window.vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'interstitial' })
            .then((data) => { console.log('Реклама показана'); })
            .catch((error) => { console.log('Ошибка рекламы', error); });
    }
}

function vk_save_data(key, value) {
    if (window.vkBridge) {
        window.vkBridge.send('VKWebAppStorageSet', {
            key: key,
            value: String(value) 
        })
        .then((data) => {
            console.log("Данные сохранены:", key);
        })
        .catch((error) => {
            console.error("Ошибка сохранения:", error);
        });
    }
}

function vk_get_data(key) {
    if (window.vkBridge) {
        window.vkBridge.send('VKWebAppStorageGet', {
            keys: [key]
        })
        .then((data) => {
            var value = "";
            if (data.keys && data.keys[0]) {
                value = data.keys[0].value;
            }
            GML_Script_Call("gmcallback_vk_on_data", key, value);
        })
        .catch((error) => {
            console.error("Ошибка загрузки:", error);
            // Важно вернуть пустую строку или флаг ошибки в GML, чтобы игра не зависла
            GML_Script_Call("gmcallback_vk_on_data", key, "error");
        });
    } else {
        // Если вызвали загрузку, а моста нет — сразу отвечаем ошибкой в GML
        GML_Script_Call("gmcallback_vk_on_data", key, "error");
    }
}