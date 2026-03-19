function vk_init() {
    // 1. Проверяем, есть ли мост и готова ли функция связи с GameMaker
    if (window.vkBridge && typeof GML_Script_Call !== 'undefined') {
        window.vkBridge.send('VKWebAppInit')
            .then((data) => {
                console.log("VK Bridge: Init Success");
                GML_Script_Call("gmcallback_vk_on_init", "success");
            })
            .catch((error) => {
                console.log("VK Bridge: Init Error", error);
                GML_Script_Call("gmcallback_vk_on_init", "error");
            });
    } else {
        // 2. Если что-то из этого еще не готово, ждем чуть дольше
        console.log("Waiting for VK Bridge or GameMaker Engine...");
        setTimeout(vk_init, 200); 
    }
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