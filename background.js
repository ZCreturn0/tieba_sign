let params = [];
let page = 1;

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
function getTbs(){
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
}

// 签到
function sign(kw, tbs){
    $.post("http://tieba.baidu.com/sign/add", {
        ie: 'utf-8',
        kw,
        tbs
    }, (data) => {
        let json = JSON.parse(data);
        if (!json.no) {
            console.log(`贴吧 ${kw} 签到成功!!`);
        }
        else{
            console.log(`贴吧 ${kw}: ${json.error}`);
        }
    })
}

getAllTiebaInfo();