(function(root){
    var tbody = document.querySelector('tbody#tbody');
    var info = document.querySelector('#info');
    var amounts = [100,200,500,1000,2000,5000];
    var fileTypes = ['png','jpg','jpeg'];
    var canvas = document.createElement('canvas');
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
        this.hold = function(hold){
            this.holding = !!hold;
            return this;
        },
        this.setContent = function(content){
            info.innerHTML = content;
            return this;
        },
        this.close = function(){
            info.innerHTML = '已上传 0 / 6';
            return this;
        },
        this.timeout = function(time){
            if(this.timer)clearTimeout(this.timer);
            this.timer = setTimeout(function(){
                if(this.timer)clearTimeout(this.timer);
            }.bind(this), time);
            return this;
        }
    };
    function init(){
        var html = '';
        for(var i=0;i<amounts.length;i+=1){
            html += '<tr class="loop-value">\
            <td><div class="val"><i class="highligh">'+amounts[i]+'</i></div></td>\
            <td><div class="val"><label class="light pointer">&#xe64b; 上传\
            <input type="file" style="display:none" accept="image/*" oninput="window.FILE_OCR(this.files[0],'+i+','+amounts[i]+', 210, 170),this.value = \'\';" />\
            </label></div></td>\
            </tr>';
        };
        html += '<tr class="table-foot"><td colspan="2"></td></tr>';
        tbody.innerHTML = html;
    };
    window.FILE_OCR = function(file, index, amount, x, y){
        console.log('%cOCR.start', 'color:#00a09d','amount='+amount, 'x='+x, 'y='+y);
        var ext = file.type.substr(6, 5);
        if(fileTypes.indexOf(ext) == -1)return root.alert('文件格式仅支持: ' + fileTypes.join(', '), 2000);
        var box = root.box({});
        if(box.holding)return;
        box.hold(true);
        
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(e){
            var img = new Image();
            img.src = e.target.result;
            img.onload = function(){
                ctx.clearRect(0,0,canvas.width,canvas.height);
                ctx.drawImage(img, x, y, canvas.width, canvas.height,0,0,canvas.width,canvas.height);
                QRDecode.decode(img.src);
                QRDecode.callback = function(code){
                    console.log('%cQRDecode', 'color:#00a09d',code);
                    if(code.indexOf('wxp://') != 0){
                        box.hold(false).setContent('请上传<i class="icon-cny"></i><b class="highligh">'+amount+'</b> 元的微信收款码').timeout(5000);
                    }else{
                        tbody.children[index].dataset.code = code;
                        tbody.children[index].dataset.amount = amount;
                        
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
                            var value = obj.data.text.replace(/([0-9\.])/,'$1');
                            console.log('%cOCR.end:', 'color:#00a09d', 'amount='+amount, 'value='+obj.data.text);
                            if(amount != value){
                                box.hold(false).setContent('请上传<i class="icon-cny"></i><b class="highligh">'+amount+'</b> 元的二维码').timeout(5000);
                            }else{
                                box.hold(false).submit();
                            };
                            img = obj = null;
                        });
                    }
                };
                img = null;
            };
            reader = null;
        };
        reader.error = function(){
            box.setContent('图片解析失败',true);
            reader = null;
        };

    }

})({});
