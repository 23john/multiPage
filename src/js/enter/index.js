import indexScss from '@css/index'
import '@js/common/common'
import render from '@view/index'
var pageDage = {
    data : {
        name:'john',
        age:33,
        male:'男',
        header:'header',
        footer:'footer',
    }
};
$(function (){
    document.title='首页';
    const html = render(pageDage);
    $('#app').html(html);
})
/* 
    问题1-1
    如果是 按照问题1的配置，只要是写了这个样式，就会出现不报错 而且什么都不显示的状况
    我看了下，好像是这个样式直接被打包进了index.js eval时被容错了，再index.js里能搜索到restStyle
*/
import resetStyle from '@css/resetStyle'