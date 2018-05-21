import resetStyle from '@css/resetStyle'
import aboutScss from '@css/about'
import '@js/common/common'
import render from '@view/about'
var pageDage = {
    data : {
        header:'header',
        footer:'footer',
    }
};
$(function (){
    document.title='关于我们';
    const html = render(pageDage);
    $('#app').html(html);
})