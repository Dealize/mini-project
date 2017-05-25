define(['FFF'], function (FFF) {
    var F = FFF.FFF,
        Widget = F.Widget;
    function Main() {
        Widget.apply(this, arguments)
    }

    Main.ATTRS = {
        boundingBox: {
            value: $("<div class='carousel_container'>"+
                "<ul class='carousel_img'></ul>" +
                "<ul class='carousel_points'></ul>"+
                "</div>")
        },
        imgList:{
            value:[]
        },
        speed:{
            value:'fast'
        },
        currentIndex:{
            value:1
        },
        autoToggle:{
            value:true
        },
        currentDomIndex:{
            value:''
        }
    };
    F.extend(Main, Widget, {
        initialize: function () {
            this.autoToggle = true;

        },
        renderUI: function () {
            this._$boundingBox = this.getBoundingBox();
            this.__render_img();
            this.__render_points();
            this.__init_dom_width();
            this.__calculate_set_dom_position();
        },
        bindUI: function () {
            var that = this;
            this.__bind_tap_event();
            this.__bind_set_currentIndex();
            this.__bind_imgDom_event();
            this.__bind_currentDomIndexChange();
        },
        syncUI:function () {
            this._init();
            this.__auto_carousel();
        },
        __set_imgUrl_Left:function (left) {
            this._$imgUl.css({'transform':'translateX('+left+'px)'});
        },
        __render_img:function () {
            this._$imgUl = this.getBoundingBox().find('.carousel_img');
            this._$imgList = this._$imgList || this._$imgUl.find('li');
            this._imgList = this._imgList || this.getImgList();
            var that = this,
                imgLength = this._imgList.length,
                roundIndex ;
            var domStr = '';
            //要做成无缝效果，必须再追加相同dom，论证之后是要加4个   012 0120
            for(var i=0;i<4;i++){
                if(imgLength>i){
                    roundIndex = i;
                }else{
                    roundIndex = i - imgLength;
                }
                this._$imgList.push(this._$imgList[roundIndex]);
            }
            this._$imgList.forEach(function (item, index) {
                domStr += item[0].outerHTML
            })
            this._$imgUl.append(domStr);
            this._$imgList =this._$imgUl.find('li');
            this._$imgList.each(function (index, item) {
                item.dataset.domindex = index;
            })

        },
        __render_points:function () {
            var domStr = '';
            this._$pointUl = this.getBoundingBox().find('.carousel_points');
            this._$pointList.forEach(function (item, index) {
                domStr += item[0].outerHTML;
            })
            this._$pointUl.append(domStr);
            this._$pointList = this._$pointUl.find('li');
        },
        __bind_tap_event:function () {
            var startX,disX,moveX,
                offsetX,
                movePos,
                that = this;
            this._direction = 'left';
            this._$imgUl.on('touchstart',function (e) {
                if(that.EVENTLOCK){
                    console.error('1111');
                   return;
                }
                startX = e.touches[0].clientX;
                offsetX = that._$imgUl.offset().left;
                clearInterval(that._autoTimer);

            });
            this._$imgUl.on('touchmove',function (e) {
                if(that.EVENTLOCK){
                    console.error('1111');
                    return;
                }
                e.preventDefault();
                disX = e.touches[0].clientX - startX;
                moveX  = Math.round(offsetX + disX);
                // that._$imgUl.css('transform','translateX('+moveX+'px)');
            });
            this._$imgUl.on('touchend',function (e) {
                if(that.EVENTLOCK){
                    console.error('1111');
                    return;
                }
                if(disX>0){
                    that._direction = 'right';
                    that.__set_ulPosition_when_specialCase();
                }else if(disX<0){
                    that._direction = 'left';
                }
                var index = that.__calculate_currentIndex_by_direction();

                that.__animate_change_index(index,function () {
                    clearInterval(that._autoTimer);
                    that.__auto_carousel();
                });
            })

        },
        __init_dom_width:function () {
            this._containerWidth = this._$boundingBox.width();
            this._imgItemWidth = $(this._$imgList[0]).width();
            this._imgUlWidth = this._imgItemWidth*this._$imgList.length;
            this._$imgUl.width(this._imgUlWidth);
        },
        __calculate_set_dom_position:function () {
            var that = this;
            this._imgListPosition = [];
            var beginX = Math.round((this._containerWidth - this._imgItemWidth)/2);
            this._$imgList.forEach(function (item,index) {
                that._imgListPosition.push(beginX - that._imgItemWidth*index);
            })
            console.log(this._imgListPosition);
        },
        __bind_set_currentIndex:function () {
            var that = this;
            this.on('currentIndexChange',function (data) {
                that.__set_points_state(data.value);
            })
        },
        __animate_change_index:function (targetIndex,fn) {
            var that = this,
                currentDomIndex = targetIndex;
                moveX = that.__get_position_by_index(targetIndex);
            //会有一种情况：在动画未执行完时候又进行了新的滑动事件，就会造成动画的紊乱。
            //所以这里加一个全局的事件锁，来进行这个操作
            that.EVENTLOCK = true;
            if(targetIndex==2 && that._direction=='left'){
                currentDomIndex = targetIndex+that._imgList.length;
                moveX = that._imgListPosition[targetIndex+that._imgList.length];
                that._$imgList[currentDomIndex].className = that._$imgList[targetIndex].className
            }else if(targetIndex==2 && that._direction=='right'){
                moveX = that._imgListPosition[targetIndex];
            }
            that._$imgUl.animate({
                'transform':'translateX('+moveX+'px)',
            },that.getSpeed(),'easing',function (e) {
                that.setCurrentIndex(targetIndex);
                if(targetIndex==2){
                    that.__set_imgUrl_Left(that._imgListPosition[targetIndex]);
                }
                fn && fn();
                that.EVENTLOCK = false;
            })
        },
        __get_position_by_index:function (index) {
            var that = this,
                imgListLength = that._imgList.length,
                finalIndex
            ;
            if(index > imgListLength){
                index -= imgListLength;
            }
            switch (index){
                case 0:
                    finalIndex = that._imgList.length;
                    break;
                case 1:
                    finalIndex = that._imgList.length + 1;
                    break;
                // case 2:
                //     finalIndex = that._imgList.length + 2;
                //     break;
                default:
                    finalIndex = index;
                    break;
            }
            that._$finalImgDom = that._$imgList[finalIndex];
            that.setCurrentDomIndex(finalIndex);
            return that._imgListPosition[finalIndex];
        },
        __calculate_currentIndex_by_direction:function () {
            var currentIndex = this.getCurrentIndex();
            if(this._direction=='left'){
                currentIndex++;
            }else if(this._direction=='right'){
                currentIndex--;
            }
            currentIndex = this.__get_final_index(currentIndex);
            return currentIndex;
        },
        __get_final_index:function (index) {
            if(index<0){
                index = this._imgList.length - 1;
            }else if (index>= this._imgList.length){
                index = 0;
            }
            return index;
        },
        __auto_carousel:function () {
            var that = this,
                currentIndex;
            if(this.autoToggle){
                that._autoTimer = setInterval(function () {
                        currentIndex = that.getCurrentIndex();
                        currentIndex++;
                        that._direction = 'left';
                        currentIndex = that.__get_final_index(currentIndex);
                        that.__animate_change_index(currentIndex);
                },1000)
            }
        },
        __set_ulPosition_when_specialCase:function () {
            var currentIndex = this.getCurrentIndex();
            if(this._direction=='right' && currentIndex==2){
                this.__set_imgUrl_Left(this._imgListPosition[this._imgList.length+currentIndex]);
                console.info(6666);
            }
        },
        __bind_imgDom_event:function () {
            this._$imgUl.on('webkitAnimationEnd','.carousel_imgContainer',function () {
                console.log('webkitAnimationEnd',this);
            })
        },
        __bind_currentDomIndexChange:function () {
            var that = this;
            this.on('currentDomIndexChange',function (data) {
                that._$imgList.each(function (index, item) {
                    if(data.value==index){
                        $(item).addClass('seletedImg');
                        $(item).removeClass('otherImg');
                    }else{
                        $(item).removeClass('seletedImg');
                        $(item).addClass('otherImg');
                    }
                })
            })
        },
        __set_points_state:function (currentIndex) {
            var that = this;
            that._$pointList.each(function (index,item) {
                if(index==currentIndex){
                    $(item).addClass('activePoint');
                }else{
                    $(item).removeClass('activePoint');
                }
            })
        },
        _init:function () {
            this.setCurrentIndex(0);
            this.__set_imgUrl_Left(this.__get_position_by_index(0));

        },


    });



    function Lunbo1(){
        Main.apply(this,arguments);
    }
    Lunbo1.ATTRS = {

    }

    F.extend(Lunbo1,Main,{
        initialize:function () {
            this.callParent();
            this.getBoundingBox().addClass('carousel2');
        },
        renderUI:function () {
            this._render_imgList();
            this._render_pointList();
            this.callParent();

        },
        bindUI:function () {
            var that = this;
            this.callParent();
        },
        syncUI:function () {
            this.callParent();
        },
        _render_imgList:function () {
            var _$item,that = this;
            that._$imgList = [];
            this._imgList = this.getImgList();
            this._imgList.forEach(function (item,index) {
                _$item = $('<li class="carousel_imgItem">' +
                        '<div class="carousel_imgContainer">' +
                            '<div class="carousel_imgText">' +
                                 '<span class="carousel_imgText1">1111</span>' +
                                 '<span class="carousel_imgText2">222</span>' +
                                 '<span class="carousel_imgText3">333</span>' +
                            '</div>' +
                            '<div class="carousel_imgBody" style="background-image:url('+item+')"></div>' +
                        '</div>' +
                    '</li>');
                that._$imgList.push(_$item);
            })
        },
        _render_pointList:function () {
            var _$item,that = this;
            that._$pointList = [];
            this._imgList = this.getImgList();
            this._imgList.forEach(function (item,index) {
                _$item = $('<li class="carousel_pointItem"></li>');
                that._$pointList.push(_$item);
            })
        }
    })


    function Lunbo2(){
        Main.apply(this,arguments);
    }
    Lunbo2.ATTRS = {

    }

    F.extend(Lunbo2,Main,{
        initialize:function () {
            this.callParent();
            this.getBoundingBox().addClass('carousel3');
        },
        renderUI:function () {
            this._render_imgList();
            this._render_pointList();
            this.callParent();

        },
        bindUI:function () {
            var that = this;
            this.callParent();
        },
        syncUI:function () {
            this.callParent();
        },
        _render_imgList:function () {
            var _$item,that = this;
            that._$imgList = [];
            this._imgList = this.getImgList();
            this._imgList.forEach(function (item,index) {
                _$item = $('<li class="carousel_imgItem">' +
                    '<div class="carousel_imgContainer" style="background-image:url('+item+')">' +
                        '<div class="carousel_imgText">' +
                            '<span class="carousel_imgText1">1111</span>' +
                            '<span class="carousel_imgText2">222</span>' +
                        '</div>' +
                    '</div>' +
                    '</li>');
                that._$imgList.push(_$item);
            })
        },
        _render_pointList:function () {
            var _$item,that = this;
            that._$pointList = [];
            this._imgList = this.getImgList();
            this._imgList.forEach(function (item,index) {
                _$item = $('<li class="carousel_pointItem"></li>');
                that._$pointList.push(_$item);
            })
        }
    })

    new Lunbo1({
        imgList:['1.png','2.png','3.png','4.png','4.png','4.png','4.png','4.png','4.png'],
        autoToggle:false
    }).render({
        container: $(".container1"),
        type: 'append'
    });

    new Lunbo2({
        imgList:['1.png','2.png','3.png','4.png'],
        autoToggle:false,
        speed:'slow'
    }).render({
        container: $(".container2"),
        type: 'append'
    });
});