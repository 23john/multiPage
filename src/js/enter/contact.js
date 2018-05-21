import resetStyle from '@css/resetStyle'
import contactScss from '@css/contact'
import '@js/common/common'
import render from '@view/contact'
var pageDage = {
    data : {
        header:'header',
        footer:'footer',
    }
};
$(function (){
    document.title='联系我们';
    const html = render(pageDage);
    $('#app').html(html);
})