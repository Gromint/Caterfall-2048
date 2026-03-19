function vk_init() {
    // Проверяем, существует ли объект vkBridge в глобальном окне браузера
    if (typeof vkBridge !== 'undefined') {
        vkBridge.send('VKWebAppInit')
            .then((data) => {
                // Если всё ок, сообщаем об этом в GML
                GML_Script_Call("gmcallback_vk_on_init", "success");
            })
            .catch((error) => {
                GML_Script_Call("gmcallback_vk_on_init", "error");
            });
    } else {
        // Если библиотеки еще нет, пишем в консоль и пробуем снова чуть позже
        console.log("Waiting for VK Bridge library...");
        setTimeout(vk_init, 100);
    }
}

function vk_show_ads() {
    vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'interstitial' })
        .then((data) => { console.log('Реклама показана'); })
        .catch((error) => { console.log('Ошибка рекламы', error); });
}

function vk_save_data(key, value) {
    // В VK Bridge значения в Storage всегда должны быть строками
    vkBridge.send('VKWebAppStorageSet', {
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

function vk_get_data(key) {
    vkBridge.send('VKWebAppStorageGet', {
        keys: [key]
    })
    .then((data) => {
        var value = "";
        // Проверяем, есть ли данные в ответе от VK
        if (data.keys && data.keys[0]) {
            value = data.keys[0].value;
        }
        // Вызываем GML-скрипт и передаем туда ключ и значение
        // Префикс gmcallback_ обязателен для связи!
        GML_Script_Call("gmcallback_vk_on_data", key, value);
    })
    .catch((error) => {
        console.error("Ошибка загрузки:", error);
        GML_Script_Call("gmcallback_vk_on_data", key, "error");
    });
}