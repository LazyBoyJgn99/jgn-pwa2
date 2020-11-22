// const webpush = require('web-push');
// const vapidKeys = webpush.generateVAPIDKeys();
// console.log(vapidKeys.publicKey, vapidKeys.privateKey);
const vapidKeys = {
    publicKey: 'BBC4GNCHz84S-aaDb5dnnbTlbinYX-IP7Zxh4mrL0bmgKbJvXSw2oGOz4Rqlta1Os-JqyJT-AaBa7BPbZTB2BVw',
    privateKey: 'aOFY3S7UbUHLotjfsmXx1KSXa0qFUpLcG8J5vnSrrbY'
};

// // 设置web-push的VAPID值
// webpush.setVapidDetails(
//     'mailto:alienzhou16@163.com',
//     vapidKeys.publicKey,
//     vapidKeys.privateKey
// );
const webpush = require('web-push');

// VAPID keys should only be generated only once.
// if(vapidKeys.publicKey===null){
//     vapidKeys = webpush.generateVAPIDKeys();
// }

webpush.setGCMAPIKey('<Your GCM API Key Here>');
webpush.setVapidDetails(
    'mailto:example@jglo.top',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

// This is the same output of calling JSON.stringify on a PushSubscription
const pushSubscription = {
    endpoint: '.....',
    keys: {
        auth: '.....',
        p256dh: '.....'
    }
};

// console.log(111);
// webpush.sendNotification(pushSubscription, 'Your Push Payload Text');
console.log(vapidKeys);

if(navigator.serviceWorker != null && window.location.port !=3000){
    console.log(111);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        alert("新版本出现，立即更新～");
        window.location.reload();
    });

    navigator.serviceWorker.register('service-worker.js')
        .then(function(registration){
            console.log('支持sw:',registration.scope)
            if(registration.installing) {
                console.log('Service worker installing');
            } else if(registration.waiting) {
                console.log('Service worker installed');
            } else if(registration.active) {
                console.log('Service worker active');
            }
            //
            if (window.PushManager) {
                console.log("window.PushManager")
                registration.pushManager.getSubscription().then(subscription => {
                    console.log("subscription",subscription)
                    console.log("registration",registration)
                    //如果用户没有订阅
                    if (!subscription) {
                        subscribeUser(registration);
                    } else {
                        console.log("You have subscribed our notification");
                    }
                });
            }else {
                console.log("No window.PushManager")
            }
            // initialiseState(registration);
        })

}
// if(navigator.serviceWorker != null){
//     navigator.serviceWorker.addEventListener('controllerchange', () => {
//         alert("新版本出现，立即更新～");
//         window.location.reload();
//     });
//     var publicKey = 'BOEQSjdhorIf8M0XFNlwohK3sTzO9iJwvbYU-fuXRF0tvRpPPMGO6d_gJC_pUQwBT7wD8rKutpNTFHOHN3VqJ0A';
//
//     navigator.serviceWorker.register('service-worker.js')
//         .then(function(registration){
//             console.log('支持sw:',registration.scope)
//             if(registration.installing) {
//                 console.log('Service worker installing');
//             } else if(registration.waiting) {
//                 console.log('Service worker installed');
//             } else if(registration.active) {
//                 console.log('Service worker active');
//             }
//             //
//             if (window.PushManager) {
//                 registration.pushManager.getSubscription().then(subscription => {
//                     // 如果用户没有订阅
//                     if (!subscription) {
//                         subscribeUser(registration);
//                     } else {
//                         console.log("You have subscribed our notification");
//                     }
//                 });
//             }
//             // initialiseState(registration);
//             return subscribeUserToPush(registration, publicKey);
//         }).then(function (subscription) {
//             let body = {subscription: subscription};
//             // 为了方便之后的推送，为每个客户端简单生成一个标识
//             body.uniqueid = new Date().getTime();
//             console.log('uniqueid', body.uniqueid);
//             // 将生成的客户端订阅信息存储在自己的服务器上
//             return fetch("https://jglo.top:8086/save", {
//                 method: "POST",
//                 mode: "cors",
//                 credentials:"include",//跨域携带cookie
//                 headers: {
//                     "Content-Type": "application/json;charset=utf-8",
//                 },
//                 body: JSON.stringify(body)
//             })
//         }).then(function (res) {
//             console.log(res);
//         }).catch(function (err) {
//             console.log(err);
//         });
// }
//jj

function subscribeUser(swRegistration) {
    console.log("subscribeUser");
    const applicationServerPublicKey = vapidKeys.publicKey;
    const applicationServerKey = urlBase64ToUint8Array(applicationServerPublicKey);
    console.log("applicationServerPublicKey",applicationServerPublicKey);
    console.log("applicationServerKey",applicationServerKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
        // 用户同意
        .then(function(subscription) {
            console.log('User is subscribed:', JSON.stringify(subscription));
            // jQuery.post("/add-subscription.php", {subscription: JSON.stringify(subscription)}, function(result) {
            //     console.log(result);
            // });

            // return webpush.sendNotification(subscription, 'Your Push Payload Text').then(data => {
            //     console.log('push service的相应数据:', JSON.stringify(data));
            //     return;
            // }).catch(err => {
            //     console.log(subscription);
            //     console.log(err);
            //     // 判断状态码，440和410表示失效
            //     if (err.statusCode === 410 || err.statusCode === 404) {
            //         return util.remove(subscription);
            //     }
            //     else {
            //         console.log(subscription);
            //         console.log(err);
            //     }
            // })
            let body = {subscription: subscription};
            // 为了方便之后的推送，为每个客户端简单生成一个标识
            body.uniqueid = new Date().getTime();
            console.log('uniqueid', body.uniqueid);
            return fetch(
                "/subscription",
                {
                    method: "POST",
                    mode: "cors",
                    credentials:"include",//跨域携带cookie
                    headers: {
                        "Content-Type": "application/json;charset=utf-8"
                    },
                    body: JSON.stringify(body)
                }
            )
        }).then(function (res) {
            console.log(res);
            console.log(res.json());
        })
        // 用户不同意或者生成失败
        .catch(function(err) {
            console.log('Failed to subscribe the user: ', err);
        })
}

// function urlB64ToUint8Array(publicKey){
//     return window.urlBase64ToUint8Array(publicKey)
// }
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
// function subscribeUserToPush(registration, publicKey) {
//     return registration.pushManager.subscribe({
//             //明该推送是否需要显性地展示给用户，即推送时是否会有消息提醒。如果没有消息提醒就表明是进行“静默”推送。在Chrome中，必须要将其设置为true，否则浏览器就会在控制台报错
//             userVisibleOnly: true,
//             //是一个客户端的公钥，VAPID定义了其规范，因此也可以称为VAPID keys。如果你还记得2.3中提到的安全策略，应该对这个公钥不陌生。该参数需要Unit8Array类型。因此定义了一个urlBase64ToUint8Array方法将base64的公钥字符串转为Unit8Array。subscribe()也是一个Promise方法，在then中我们可以得到订阅的相关信息——一个PushSubscription对象。下图展示了这个对象中的一些信息。注意其中的endpoint，Push Service会为每个客户端随机生成一个不同的值.
//             applicationServerKey: urlBase64ToUint8Array(publicKey)
//     })
//         .then(function (subscription) {
//         console.log('Received PushSubscription: ', JSON.stringify(subscription));
//         return subscription;
//     });
// }


// pushMessage({"endpoint":"https://updates.push.services.mozilla.com/wpush/v2/gAAAAABeY6jFIAkOZXSZ2ym8xNpwAWCI00LJOu66CzhlR-rjgstrl_mEZREKxk9te6LctbiadxWQBEJjmBOVC4S3TMdnec9a0hDIPjTL1WEjX7N73MHoR9P2iChnyAJt852PcgkwNqTrXpWiDkL3c3dce1Weo3EU7RvMmr49LGXMukhbLfP40Ro","keys":{"auth":"MKjTA4zC8ZmIvX-TT5Ou6g","p256dh":"BFx_QfogqikG-D5BvkgyM3FB8sa8hWSYVK6-UJX7Qdbs0SMnPF3i13rgjdNNDsXAWafuU0GiIwFZkqjYQwyny4U"}},"haha")
// // app.js
// /**
//  * 向push service推送信息
//  * @param {*} subscription
//  * @param {*} data
//  */
// function pushMessage(subscription, data = {}) {
//     console.log("pushMessage");
//     webpush.sendNotification(subscription, data).then(data => {
//         console.log('push service的相应数据:', JSON.stringify(data));
//         return;
//     }).catch(err => {
//         console.log(subscription);
//         console.log(err);
//         // 判断状态码，440和410表示失效
//         if (err.statusCode === 410 || err.statusCode === 404) {
//             return util.remove(subscription);
//         }
//         else {
//             console.log(subscription);
//             console.log(err);
//         }
//     })
// }

