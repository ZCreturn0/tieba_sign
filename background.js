let params = [];
// 测试时设成 5
let page = 5;

// 错误码
const errorCode = {
    '0': '签到成功',
    '1101': '重复签到',
    '1010': '贴吧不存在'
};
// 统计签到结果
const counter = {
    '签到成功': 0,
    '重复签到': 0,
    '贴吧不存在': 0
};

// 把请求设成同步
$.ajaxSettings.async = false;

// 获取所有关注的贴吧
function getAllTiebaInfo(){
    // 获取 page 页的所有贴吧
    $.get(`http://tieba.baidu.com/f/like/mylike?&pn=${page}`, (data) => {
        let html = $.parseHTML(data);
        let list = $(html).find('.forum_table tr td:first-child a');
        // 当前页有数据
        if(list.length){
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
        else{
            getTbs();
        }
    });
}

// 获取 tbs 参数
async function getTbs(){
    // 存储所有的 Promise
    let promises = [];
    // 所有贴吧签到都需要 tbs 参数
    for (let info of params) {
        // 获取每个贴吧的 tbs 参数
        let url = `http://tieba.baidu.com${info.link}`;
        await fetch(url)
        .then(data => {
            data.text()
            .then(text => {
                let index = text.search(/'tbs':/);
                let tbs = text.substr(index + 8, 26);
                promises.push(sign(info.kw, tbs));
            })
        })
        // let promise = fetch(url);
        // promises.push(promise);
        // $.get(url, (data) => {
        //     let index = data.search(/'tbs':/);
        //     let tbs = data.substr(index + 8, 26);
        //     // 传入关键字和 tbs 进行签到
        //     sign(info.kw, tbs);
        // });
    }
    // console.log(promises);
    Promise.all(promises)
    .then(async datas => {
        datas.forEach(async data => {
            await data.json()
            .then(json => {
                console.log(json);
                counter[errorCode[json.no]]++;
            })
        })
        console.log(counter);
    })
    .catch(err => {
        console.log(err);
    })
}

// 签到,返回 promise
function sign(kw, tbs){
    let formData = new FormData();
    formData.append('ie', 'utf-8');
    formData.append('kw', kw);
    formData.append('tbs', tbs);
    return fetch("http://tieba.baidu.com/sign/add", {
        method: 'POST',
        mode: 'cors',
        body: formData
    });

    
    // $.post("http://tieba.baidu.com/sign/add", {
    //     ie: 'utf-8',
    //     kw,
    //     tbs
    // }, (data) => {
    //     let json = JSON.parse(data);
    //     if (!json.no) {
    //         console.log(`贴吧 ${kw} 签到成功!!`);
    //     }
    //     else{
    //         console.log(`贴吧 ${kw}: ${json.error}`);
    //     }
    // })
}

getAllTiebaInfo();