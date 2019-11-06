let params = [];
let page = 1;

// 把请求设成同步
$.ajaxSettings.async = false;

// 格式化时间
function dateFormat(fmt, date) {
    let ret;
    let opt = {
        "Y+": date.getFullYear().toString(),
        "m+": (date.getMonth() + 1).toString(),
        "d+": date.getDate().toString(),
        "H+": date.getHours().toString(),
        "M+": date.getMinutes().toString(),
        "S+": date.getSeconds().toString()
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}

// 判断是否同一天
function isSameDay(dateA, dateB) {
    return (dateA.setHours(0, 0, 0, 0) == dateB.setHours(0, 0, 0, 0));
}

// 获取所有关注的贴吧
function getAllTiebaInfo() {
    // 获取 page 页的所有贴吧
    $.get(`http://tieba.baidu.com/f/like/mylike?&pn=${page}`, (data) => {
        let html = $.parseHTML(data);
        let list = $(html).find('.forum_table tr td:first-child a');
        // 当前页有数据
        if (list.length) {
            for (let i = 0; i < list.length; i++) {
                // 保存贴吧名和链接
                params.push({
                    kw: list[i].innerText,
                    link: list[i].getAttribute('href')
                });
            }
            page++;
            // 继续到下一页获取数据
            getAllTiebaInfo();
        }
        // 当前页没数据,说明所有贴吧信息已经获取了,停止获取信息
        else {
            console.log(`共关注了 ${params.length} 个贴吧`);
            getTbs();
        }
    });
}

// 已签到的贴吧
let signed = 0;
// 重复签到
let resigned = 0;
// 其他原因
let other = 0;
// 获取 tbs 参数
function getTbs() {
    // 所有贴吧签到都需要 tbs 参数
    for (let info of params) {
        // 获取每个贴吧的 tbs 参数
        let url = `http://tieba.baidu.com${info.link}`;
        $.get(url, (data) => {
            let index = data.search(/'tbs':/);
            let tbs = data.substr(index + 8, 26);
            // 传入关键字和 tbs 进行签到
            sign(info.kw, tbs);
        });
    }
    console.log(`成功签到了 ${signed} 个贴吧;重复签到 ${resigned} 个贴吧;因其他原因签到失败 ${other} 个贴吧.`);
    let str = [];
    str.push(`共关注了 ${params.length} 个贴吧`);
    signed ? str.push(`成功签到了 ${signed} 个贴吧`) : '';
    resigned ? str.push(`重复签到 ${resigned} 个贴吧;`) : '';
    other ? str.push(`因其他原因签到失败 ${other} 个贴吧`) : '';
    chrome.notifications.create(null, {
        type: 'basic',
        iconUrl: 'img/tieba.png',
        title: '签到结果',
        message: str.join('\n')
    });
    chrome.storage.sync.set({
        last_sign_time: dateFormat('YYYY-mm-dd HH:MM:SS', new Date())
    }, () => {
        console.log('已更新');
    });
}

// 签到
function sign(kw, tbs) {
    $.post("http://tieba.baidu.com/sign/add", {
        ie: 'utf-8',
        kw,
        tbs
    }, (data) => {
        let json = JSON.parse(data);
        if (!json.no) {
            signed++;
            console.log(`贴吧 ${kw} 签到成功!!`);
        } else if (json.no == 1101) {
            resigned++;
            console.log(`贴吧 ${kw} 重复签到!!`);
        } else {
            other++;
            console.log(`贴吧 ${kw}: ${json.error}`);
        }
    })
}

// getAllTiebaInfo();

// 获取上次签到的时间
chrome.storage.sync.get('last_sign_time', (res) => {
    if (res && res.last_sign_time) {
        let now = new Date();
        let last_sign_time = new Date(res.last_sign_time);
        if (isSameDay(now, last_sign_time)) {
            console.log("今天已经签到过了!");
        }
        else{
            getAllTiebaInfo();
        }
    }
    else{
        getAllTiebaInfo();
    }
})