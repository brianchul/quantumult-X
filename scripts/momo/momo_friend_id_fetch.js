function momoNotify(subtitle = '', message = '') {
    console.log(subtitle, message);
    $notify('ð Momo å¥½åID', subtitle, message);
  };

const url = $request.url;
const re = /employeeNO\=(.*)\&/i;
const found = url.match(re);
if(!isNaN(found[1])){
    $prefs.setValueForKey(found[1], "momoShareFriendID")
    momoNotify(
        'ä¿å­æå ðª',
        found[1]
    );
}else{
    momoNotify(
        'ä¿å­å¤±æ !!',
        "è«éæ°ç¢ºèªåäº«ç¶²å"
    );
}
$done({})
