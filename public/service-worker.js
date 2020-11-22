importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.1.0/workbox-sw.js");
var cacheStorageKey = 'react-pwa-27';
var cacheList=[
    '/'
];
self.addEventListener('install',e =>{
    console.log("install");
    e.waitUntil(
        caches.open(cacheStorageKey).then(function(cache) {
            return cache.addAll(cacheList)
        }).then(function() {
            // 注册成功跳过等待，酌情处理
            return self.skipWaiting()
        })
    )
});

self.addEventListener('fetch',function(e){
    e.respondWith(
        caches.match(e.request)
            .then(function(response){
                if(response){
                    console.log('Found response in cache:', response);
                    return response
                }
                var fetchRequest = e.request.clone();
                return fetch(fetchRequest).then(
                    function(response) {
                        if(!response || response.status !== 200 || response.type !== 'basic'||e.request.method==="POST") {
                            return response;
                        }
                        var responseToCache = response.clone();
                        caches.open(cacheStorageKey)
                            .then(function(cache) {
                                cache.put(e.request, responseToCache);
                            });
                        return response;
                    }
                );

            })
    )
});

self.addEventListener('activate',function(e){
    e.waitUntil(
        //获取所有cache名称
        caches.keys().then(cacheNames => {
            return Promise.all(
                // 获取所有不同于当前版本名称cache下的内容
                cacheNames.filter(cacheNames => {
                    return cacheNames !== cacheStorageKey
                }).map(cacheNames => {
                    return caches.delete(cacheNames)
                })
            )
        }).then(() => {
            return self.clients.claim()
        })
    )
});

// sw.js
self.addEventListener('push', function (e) {
    var data = e.data;
    if (e.data) {
        data = data.json();
        console.log('push的数据为：', data);
        self.registration.showNotification("超时空飞吻😘",{
            body: data,
            icon: './static/img/icon.png',
            vibrate: [200, 100, 200, 100, 200, 100, 200],
            tag: 'vibration-sample'
        });
    } else {
        console.log('push没有任何数据');
    }
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');

    let notification = event.notification;
    console.log(notification);
    notification.close();
    //打开一个新的网页
    // event.waitUntil(
    //     clients.openWindow(notification.data.url)
    // );
});


