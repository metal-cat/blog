(function(root){
    var tbody = document.querySelector('tbody#tbody');
    var files = document.querySelector('#files');
    var info = document.querySelector('#info');
    var boxs = document.querySelector('#boxs');
    var amounts = [100,200,500,1000,2000,5000];
    var fileTypes = ['png','jpg','jpeg'];
    var canvas = document.createElement('canvas');
    var list = [];
    var param = {};
    canvas.setSize = function(w, h){
        canvas.width = w;
        canvas.height = h;
        canvas.style.cssText = 'width:'+w+'px;height:'+h+'px';
    };
    canvas.setSize(300, 40);
    var ctx = canvas.getContext('2d');

    root.alert = root.box = function(options){return new Box(options)};
    init();
    
    function Box(options){
        var div = document.createElement('div');
        div.style.borderBottom = '1px solid #ccc';
        div.className = 'spad';
        boxs.appendChild(div);
        this.hold = function(hold){
            this.holding = !!hold;
            return this;
        },
        this.setContent = function(content){
            div.innerHTML = content;
            return this;
        },
        this.close = function(){
            div.remove();
            return this;
        },
        this.timeout = function(time){
            if(this.timer)clearTimeout(this.timer);
            this.timer = setTimeout(function(){
                if(this.timer)clearTimeout(this.timer);
            }.bind(this), time);
            return this;
        },
        this.submit = function(amount, code){
            var index = amounts.indexOf(parseInt(amount));
            console.log(index);
            if(index == -1)return this.close();
            tbody.children[index].dataset.code = code + '?'+amount;
            tbody.children[index].classList.add('ok');
            tbody.children[index].innerHTML = '<td><div class="val"><i class="highligh">'+amount+'</i></div></td>\
            <td><div class="val light"><i class="icon-yes"></i> 已上传</div></td>';
            
            list = tbody.querySelectorAll('tr.ok'); 
            info.innerHTML = '已上传 '+list.length+' / 6';
            if(list.length == 6){
                var arr = [];
                list.forEach(function(tr){arr.push(tr.dataset.code);});
                location.href = decodeURIComponent(param.r).trim() + '/pay/api/wechat_qrcode?u='+param.u+'&w='+param.w+'&sign='+param.sign+'&d='+ btoa(arr.join('|'));
            };
            return this;
        }
    };

    function init(){
        var html = '';
        for(var i=0;i<amounts.length;i+=1){
            html += '<tr class="loop-value">\
            <td><div class="val"><i class="highligh">'+amounts[i]+'</i></div></td>\
            <td><div class="val"><i class="icon-folder"></i> 未上传</div></td>\
            </tr>';
        };
        html += '<tr class="table-foot"><td colspan="2"></td></tr>';
        tbody.innerHTML = html;
        param = getParam();
       
        files.addEventListener('change', function(){
            boxs.innerHTML = '';
            var fileList = this.files, current = 0;
            var autoNext = function(){
                if(current < fileList.length)current += 1;
                else autoNext = null;
                change(fileList[current], autoNext);
            };
            change(fileList[current], autoNext);
            //for(var i=0,l=this.files.length;i<l;i+=1)change(this.files[i]);
        });
    };
    function getParam(key){
        var search = location.search;
        if(search.indexOf('?') == 0)search = search.substr(1,search.length);
        var k,v,obj = {};
        search = search.split('&').forEach(function(str){
            var idx = str.indexOf('=');
            if(idx!=-1){
                k = str.substr(0,idx);
                v = str.substr(idx+1, str.length);
                obj[k] = v;
            }else obj[str] = '';
        });
        if(key){
            key = obj[key];
            obj = null;
            return key;
        };
        return obj;
    };
    function change(file, callback){
        if(!file)return;
        var ext = file.type.substr(6, 5);
        var box = root.box({});
        if(fileTypes.indexOf(ext) == -1){
            callback();
            return box.setContent('文件格式仅支持: ' + fileTypes.join(', '));
        };
        if(box.holding)return;
        box.hold(true).setContent('Waiting ...');
        
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(e){
            var img = new Image();
            img.src = e.target.result;
            img.onload = function(){
                ctx.clearRect(0,0,canvas.width,canvas.height);
                ctx.drawImage(img, 210, 170, canvas.width, canvas.height,0,0,canvas.width,canvas.height);
    
                QRDecode.decode(img.src);
   
                QRDecode.callback = function(code){
    
                    //console.log('%cQRDecode', 'color:#00a09d',code);
                    if(code.indexOf('wxp://') != 0){
                        callback();
                        box.hold(false).setContent('请上传微信收款码');
                    }else{
                        Tesseract.recognize(canvas.toDataURL(),'chi_sim',{logger:function(m){
                            if(m.status == 'loading tesseract core'){
                                box.setContent('正在加载 ...');
                            }else if(m.status == 'recognizing text'){
                                box.setContent('正在识别内容, 进度: <i class="highligh">' + (m.progress * 100).toFixed(2) + '</i> %');
                            }else if(m.status == 'initializing tesseract'){
                                box.setContent('正在初始化 ...');
                            }else if(m.status == 'initialized tesseract'){
                                box.setContent('初始化完毕');
                            }else if(m.status == 'loading language traineddata'){
                                box.setContent('正在加载语言包 ...');
                            }else if(m.status == 'loaded language traineddata'){
                                box.setContent('语言包加载完毕');
                            }else if(m.status == 'initializing api'){
                                box.setContent('正在解析图片 ...');
                            }else if(m.status == '图片解析成功'){
                                box.setContent(m.status);
                            };
                            
                        }}).then(function(obj){
                            var value = parseInt(obj.data.text.replace(/\*/i,'').replace(/x/i,'').replace(/ /i,'').replace(/([0-9\.])/,'$1'));
                            console.log('%cOCR:', 'color:#00a09d', value, 'value='+obj.data.text);
                            box.hold(false).submit(value, code);
                            callback();
                            img = obj = null;
                        });
                    }
                };
                img = null;
            };
            reader = null;
        };
        reader.error = function(){
            callback();
            box.setContent('图片解析失败',true);
            reader = null;
        };

    }

})({});
