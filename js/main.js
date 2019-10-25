var position = document.querySelector('#position');
var home = document.querySelector('#N-HOME');
var nav = document.querySelector('#nav-container');
var icon = 'info';
nav.opened = nav.querySelector('li.focus');
nav.querySelectorAll('li').forEach(function(li){
    li.addEventListener('click', function(){
        if(nav.opened)nav.opened.classList.remove('focus');
        this.classList.add('focus');
        home.classList.remove('column');
        icon = getIcon(this.className);
        position.innerHTML = '<i style="margin:0 5px" class="big flt-l '+icon+'"></i>Current position is: ' + this.textContent;
        home.innerHTML = '<div class="pad center err iconfont">\
            <div class="icon-tomb-fox logo pad_y"></div>\
            <h2 class="title ' + icon + '"> ' + this.textContent + ' </h2>\
            <div>This is test content.</div>\
        </div>';
        nav.opened = this;
    });
});

function getIcon(str){
    var name = 'info', arr = str.split(' ');
    for(var i=0,l=arr.length;i<l;i+=1){
        if(arr[i].match(/^icon\-([a-zA-Z0-9\_\-]+)$/g)){
            name = arr[i];
        }
    };
    return name;
}