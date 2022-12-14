const momoHeaders = {
    Cookie: $prefs.valueForKey('momoCookie'),
    'Content-Type': 'application/json;charset=utf-8',
    'User-Agent': $prefs.valueForKey('momoUserAgent'),
};

const noCookieHeaders = {
    Cookie: $prefs.valueForKey('momoCookie'),
    'Content-Type': 'application/json;charset=utf-8',
    'User-Agent': $prefs.valueForKey('momoUserAgent'),
};

function momoNotify(subtitle = '', message = '') {
    $notify('π Momo ζ―ζ₯εδΊ«', subtitle, message);
}

const mainPageRequest = {
    url: 'https://app.momoshop.com.tw/api/moecapp/goods/getMainPageV5',
    headers: momoHeaders,
    method: 'POST', // Optional, default GET.
    body: JSON.stringify({
        ccsession: '',
        custNo: '',
        ccguid: '',
        jsessionid: '',
        isIphoneX: '1',
    }),
};

const eventPageRequest = {
    url: '',
    method: 'GET', // Optional, default GET.
    headers: noCookieHeaders,
};

const jsCodeRequest = {
    url: '',
    method: 'GET', // Optional, default GET.
    headers: momoHeaders,
};

const shareRequest = {
    url: '',
    method: 'POST', // Optional, default GET.
    headers: {
        Cookie: $prefs.valueForKey('momoCookie'),
        'Content-Type': 'application/json;charset=utf-8',
        'User-Agent': $prefs.valueForKey('momoUserAgent'),
        Referer: 'https://www.momoshop.com.tw/',
    },
    body:  {
        pNo : '',
        doAction : 'share',
        shareBy: 'line'
      },
};

function getEventPageUrl() {
    console.log('----------------------------------------------------');
    $task.fetch(mainPageRequest).then(
        (response) => {
            if (response.statusCode === 200) {
                try {
                    const obj = JSON.parse(response.body);
                    if (obj.success === true) {
                        const mainInfo = obj.mainInfo;
                        let found = false;
                        for (const info of mainInfo) {
                            if (info.adInfo && info.columnType === '3') {
                                const adInfo = info.adInfo[0];
                                const actionUrl = adInfo.action.actionValue;
                                console.log('Momo η°½ε°ζ΄»ει ι’ π' + actionUrl);
                                found = true;
                                eventPageRequest.url = actionUrl;
                                eventPageRequest.headers.Cookie = '';
                                getJavascriptUrl();
                            }
                        }
                        if (!found) {
                            console.log('ζΎδΈε°η°½ε°ζ΄»ει ι’');
                            $done();
                        }
                    } else {
                        momoNotify('εεΎζ΄»ει ι’ε€±ζ βΌοΈ', obj.resultMessage);
                        $done();
                    }
                } catch (error) {
                    momoNotify('εεΎζ΄»ει ι’ε€±ζ βΌοΈ', error);
                    $done();
                }
            } else {
                momoNotify('Cookie ε·²ιζ βΌοΈ', 'θ«ιζ°η»ε₯');
                $done();
            }
        },
        (reason) => {
            momoNotify('εεΎζ΄»ει ι’ε€±ζ βΌοΈ', 'ι£η·ι―θͺ€');
            $done();
        }
    );
}

function getJavascriptUrl() {
    console.log('----------------------------------------------------');
    $task.fetch(eventPageRequest).then(
        (response) => {
            if (response.statusCode === 200) {
                console.log('get javascript ok');
                try {
                    const data = response.body;
                    const re =
                        /https:\/\/(.*)\/promo-cloud-setPunch-[a-z0-9]{3,}\.js\?t=[0-9]{13}/i;
                    const found = data.match(re);
                    const url = found[0];
                    jsCodeRequest.url = url;
                    console.log('ζ΄»ε JS URL π' + url);
                    getPromoCloudConfig();
                } catch (error) {
                    momoNotify('εεΎ JS URL ε€±ζ βΌοΈ', error);
                    $done();
                }
            } else {
                momoNotify('εεΎ JS URL ε€±ζ βΌοΈ', response.status);
                $done();
            }
        },
        (reason) => {
            momoNotify('εεΎ JS URL ε€±ζ βΌοΈ', 'ι£η·ι―θͺ€');
            $done();
        }
    );
}

function getPromoCloudConfig() {
    console.log('----------------------------------------------------');
    $task.fetch(jsCodeRequest).then(
        (response) => {
            if (response.statusCode === 200) {
                console.log('get promo cloud config ok');
                try {
                    const data = response.body;
                    const pNoRe = /punchConfig\.pNo(.*)"(.*)"/i;
                    const pNo = data.match(pNoRe)[2];
                    console.log('Momo ζ΄»ε ID π' + pNo);

                    const pUrlRe = /punchConfig\.serviceUrl(.*)'(.*)'/i;
                    const pUrl = data.match(pUrlRe)[2];

                    shareRequest.url = pUrl;
                    shareRequest.body.pNo = pNo;
                    shareRequest.body = JSON.stringify(shareRequest.body);
                    generateShareLink();
                } catch (error) {
                    console.log(error);
                    momoNotify('εεΎζ΄»ε ID ε€±ζ βΌοΈ', error);
                    $done();
                }
            } else {
                momoNotify('Cookie ε·²ιζ βΌοΈ', 'θ«ιζ°η»ε₯');
                $done();
            }
        },
        (reason) => {
            momoNotify('εεΎζ΄»ε ID ε€±ζ βΌοΈ', 'ι£η·ι―θͺ€');
            $done();
        }
    );
}
function generateShareLink() {
    try{
        $task.fetch(shareRequest).then(
            (response) => {
                if (response.statusCode === 200) {
                    console.log('share link ok');
                    momoNotify('εδΊ«ι£η΅ε·²η’η β', '');
                }else{
                    momoNotify('εδΊ«ι£η΅η’ηι―θͺ€ !!', '');
                }
                $done();
            })
    } catch (error) {
        console.log(error);
        $done();
    }
}
console.log($prefs.valueForKey('momoCookie'));
console.log($prefs.valueForKey('momoUserAgent'));
console.log($prefs.valueForKey('momoShareFriendID'));
const rtime = Math.floor(Math.random() * 300);
console.log(`wait for ${rtime} seconds to run`);
setTimeout(() => getEventPageUrl(), rtime * 1000);
