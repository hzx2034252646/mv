$(function() {
    var baseURL = 'https://api.imjad.cn/cloudmusic/',
        isMobile = window.outerWidth < 500 ? true : false,
        search_mv = [],
        keyword = '',
        page = 1,
        quality = '480';

    window.onresize = function() {
        isMobile = window.outerWidth < 500 ? true : false;
    }

    function scroll() {
        var scrollTop = window.pageYOffset;
        var clientHeight = window.innerHeight;
        var scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        if (scrollTop + clientHeight >= scrollHeight) {
            keyword && searchMV(keyword, ++page);
        }
    }
    $(window).bind('scroll', scroll);
    $(window).scroll(function() {
        var scrollTop = window.pageYOffset;
        if (scrollTop > 0) {
            $('.header').addClass('active')
        } else {
            $('.header').removeClass('active')
        }
    })

    function searchMV(s, page) {
        $('.tip').hide();
        $('.loading').show();
        $(window).unbind('scroll', scroll);
        $.getJSON(baseURL, 'type=search&search_type=1004&s=' + s + '&offset=' + (page - 1), function(data) {
            $('.loading').hide();
            data = data.result.mvs;
            var singer, len, cover,
                listCount = $('.mv_list_item').length,
                $list = $('.mv_list');
            data.forEach(function(value, index) {
                search_mv.push(value);
                cover = value.cover.replace(/https:\/\/(p3|p4)/, 'https://p1');
                singer = value.artists[0].name;
                len = value.artists.length;
                if (len > 1) {
                    for (var i = 1; i < len; i++) {
                        singer = singer + '、' + value.artists[i].name;
                    }
                }
                $list.append(
                    '<li class="mv_list_item" id=' + value.id + '>' +
                    '<span class="cover">' +
                    '<img class="lazy" data-original=' + cover + ' alt="">' +
                    '</span>' +
                    '<span class="title" title="' + value.name + '">' + value.name + '</span>' +
                    '<span class="singer" title="' + singer + '">' + singer + '</span>' +
                    '</li>');
            })
            $(window).bind('scroll', scroll);
            var count = data.length;
            if (listCount == 0 && count < 20) {
                $('.loading').hide();
                $(window).unbind('scroll', scroll);
            }
            if (listCount != 0 && count < 20) {
                $('.noMore').show();
                $(window).unbind('scroll', scroll);
            }
            var m = parseInt(window.innerWidth / 300);
            var n = count % m;
            if (n != 0) {
                for (var i = 0; i < m - n; i++) {
                    $list.append('<li></li>');
                }
            }
            $('.loading').hide();
            $('img.lazy').lazyload({
                effect: "fadeIn"
            }).removeClass('lazy');
        })
    }

    function search() {
        var s = $.trim($('.search_input').val());
        if (!s) {
            return;
        }
        page = 1;
        search_mv = [];
        keyword = s;
        $('.mv_list').html('');
        $('.header').removeClass('active')
        $('.search_input').blur();
        searchMV(keyword, page);
    }
    $('.search_input').keyup(function(ev) {
        var s = $.trim($('.search_input').val());
        if (!s && isMobile) {
            $('.header_search').hide();
            $('.header_logo').show();
            $('.sbtn').show();
        }
        if (ev.which == 13) {
            search();
        }
    })
    $('.search_btn').click(function() {
        search();
    })
    $('.sbtn').click(function() {
        $('.header_search').css('display', 'flex');
        $(this).hide();
        $('.header_logo').hide();
    })
    $('.setting li').click(function() {
        $(this).addClass('li-active').siblings().removeClass('li-active');
        quality = this.id;
    })
    document.oncontextmenu = function(ev) {
        var oEvent = ev || window.event;
        var x = oEvent.clientX + window.pageXOffset;
        var y = oEvent.clientY + window.pageYOffset;
        var clientWidth = document.documentElement.clientWidth;
        var clientHeight = document.body.clientHeight > window.innerHeight ? document.body.clientHeight : document.documentElement.clientHeight;
        var w = $('.setting').width();
        var h = $('.setting').height() + 10;
        if (x + w >= clientWidth) {
            $('.setting').css('left', x - w);
        } else {
            $('.setting').css('left', x);
        }
        if (y + h >= clientHeight) {
            $('.setting').css('top', y - h);
        } else {
            $('.setting').css('top', y);
        }
        $('.setting').show();
        return false;
    }
    $(document).click(function() {
        $('.setting').hide();
    })
    $('.mv_list').delegate('.mv_list_item', 'click', function() {
        var id = this.id;
        $.getJSON(baseURL, 'type=mv&id=' + id, function(data) {
            var url = data.data.brs[quality];
            window.open('javascript: location.replace("' + url + '")');
            var mv = JSON.parse(localStorage.getItem('mv')) || [],
                json = search_mv.find(item => item.id == id) || mv.find(item => item.id == id);
            var index = mv.findIndex(item => item.id == id);
            index != -1 && mv.splice(index, 1);
            mv.unshift(json);
            localStorage.setItem('mv', JSON.stringify(mv));
        })
    })
    $('.mv_list').delegate('.delete', 'click', function(ev) {
        ev.stopPropagation();
        var id = $(this).parent().parent().attr('id');
        var mv = JSON.parse(localStorage.getItem('mv'))
        var i = mv.findIndex(item => item.id == id);
        mv.splice(i, 1);
        localStorage.setItem('mv', JSON.stringify(mv));
        $(this).parent().parent().remove();
        var listCount = mv.length,
            $list = $('.mv_list');
        var m = parseInt(window.innerWidth / 300);
        var n = listCount % m;
        $list.find('li').not('.mv_list_item').remove();
        if (n != 0) {
            for (var i = 0; i < m - n; i++) {
                $list.append('<li></li>');
            }
        }
    })
    function loadMV() {
        var mv = JSON.parse(localStorage.getItem('mv')) || [];
        var singer, len, cover,
            $list = $('.mv_list');
        mv.forEach(function(value, index) {
            cover = value.cover.replace(/https:\/\/(p3|p4)/, 'https://p1');
            singer = value.artists[0].name;
            len = value.artists.length;
            if (len > 1) {
                for (var i = 1; i < len; i++) {
                    singer = singer + '、' + value.artists[i].name;
                }
            }
            $list.append(
                '<li class="mv_list_item storage_mv" id=' + value.id + '>' +
                '<span class="cover">' +
                '<img class="lazy" data-original=' + cover + ' alt="">' +
                '<span class="delete">&times;</span>' +
                '</span>' +
                '<span class="title" title="' + value.name + '">' + value.name + '</span>' +
                '<span class="singer" title="' + singer + '">' + singer + '</span>' +
                '</li>');
        })
        var listCount = mv.length;
        var m = parseInt(window.innerWidth / 300);
        var n = listCount % m;
        if (n != 0) {
            for (var i = 0; i < m - n; i++) {
                $list.append('<li></li>');
            }
        }
        $('img.lazy').lazyload({
            effect: "fadeIn"
        });
    }
    loadMV();
})