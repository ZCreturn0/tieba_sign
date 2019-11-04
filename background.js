let params = [];
let page = 1;
let tbs = '';

// 获取所有关注的贴吧
function getAllTiebaInfo(){
    $.get(`http://tieba.baidu.com/f/like/mylike?&pn=${page}`, (data) => {
        let html = $.parseHTML(data);
        let list = $(html).find('.forum_table tr td:first-child a');
        if(list.length){
            for (let i = 0; i < list.length; i++) {
                params.push({
                    kw: list[i].innerText,
                    link: list[i].getAttribute('href')
                });
            }
            page++;
            getAllTiebaInfo();
        }
        else{
            getTbs();
        }
    });
}

function getTbs(){
    // 所有贴吧签到都需要 tbs 参数,且所有所需的 tbs 参数都是一样的,所以获取一个贴吧的 tbs 参数即可
    let info = params[0];
    let url = `http://tieba.baidu.com${info.link}`;
    $.get(url, (data) => {
        let index = data.search(/'tbs':/);
        tbs = data.substr(index + 8, 26);
    });
}

getAllTiebaInfo();