let params = [];
let page = 1;
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
            aaa();
        }
    });
}
getAllTiebaInfo();
function aaa(){
    console.log(params);
}