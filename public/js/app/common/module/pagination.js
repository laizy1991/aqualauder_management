/**
 * @description ajax分页组件
 * @author zhongna
 * @version 1.0.0
 * @dependencies jquery, template_native
 */


define(function(require, exports, module) {

  var template = require('./template_native');  // 模板引擎
  var dd = require('../../util/dialog');

  var Pagination = {

    defaultPage: 1,  // 默认页码

    curPage: 1,  // 当前页码

    totalPage: 1,  // 总页数

    maxShowPage: 5,  // 显示页码个数的最大值

    url: '',  // 请求数据的URL
    
    data: {}, //请求的数据

    curPageClassName: 'current',  // 当前页面的Class

    tmplId: '',  // 模板ID

    isCache: true,  // 是否缓存数据

    onInit: null,  // 数据初始化完成之后的回调

    onEmpty: null, // 返回数据为空时的回调


    /**
     * 构造函数
     * @param  {Object} args 单一对象配置参数
     */
    init: function(args) {
      var self = this;

      $.extend(self, args);

      // 包裹层
      this.$element = $(this.element);

      // 列表容器
      this.$listWrap = this.$element.find('[role="listWrap"]');

      // 分页容器
      this.$page = this.$element.find('[role="pageWrap"]');

      // 上一页
      this.$prev = null;

      // 下一页
      this.$next = null;

      // 页码
      this.$pageItem = null;

      // 数据缓存对象
      this.cache = {},

      // 加锁（防止用户疯狂点击时请求数过多）
      this.lock = false;
      
      // 初始化数据
      this.initList();

    },

    /**
     * 初始化数据列表
     */
    initList: function() {
        var self = this, curPageNum = 1;

        self.curPage = 1;
      
        $.extend(self.data, {page: curPageNum});
      
        $.getJSON(self.url, self.data, function(res) {
            if (res.error) {
                alert(res.error);
                //dd.alert(res.message);
                return;
    
            } else if (res.data.count === 0) {
                if (self.onEmpty && $.isFunction(self.onEmpty)) {
                    self.onEmpty.call(self);
                } else {
                    self.$listWrap.html('<div class="none-info">暂无数据</div>');
                }
                return;
            }
            self.$listWrap.html(template(self.tmplId, res));
            self.cacheData(curPageNum);
              
            self.totalPage = Math.ceil(res.data.count / res.data.size);
            // 生成页码
            self.generatePage(1);
    
            if (self.onInit && $.isFunction(self.onInit)) {
                self.onInit.call(self);
            }
        });
    },

    /**
     * 生成页码
     */
    generatePage: function(p) {
      var self = this, totalPage = this.totalPage, maxShowPage = this.maxShowPage, pageStart = p;
      
      if (totalPage < 2) {  // 总页数小于2时不显示页码
          this.$page.html('');
        return;
      }

      var pageHtml = [], i = 0, counter = 0;
      
      pageHtml.push('<div class="pagination">');
      pageHtml.push('<a class="prev disabled" role="prev" href="javascript:;"><b class="icon"></b></a>');

      for (i = pageStart, counter; counter < maxShowPage && i <= totalPage; i ++, counter ++) {
        pageHtml.push('<a class="page-item" role="pageItem" href="javascript:;">' + i + '</a>');
      }

      pageHtml.push('<a class="next" role="next" href="javascript:;"><b class="icon"></b></a>');
      pageHtml.push('</div>');

      this.$page.html(pageHtml.join(''));

      this.$pageItem = this.$element.find('[role="pageItem"]');
      this.$prev = this.$element.find('[role="prev"]');
      this.$next = this.$element.find('[role="next"]');

      this.$prev.data('isPrev', false);
      this.$next.data('isNext', true);
      this.$pageItem.eq(0).addClass(this.curPageClassName);

      // 点击页码
      this.$pageItem.on('click', function() {
        self.pageClick(this);
      });

      // 点击上一页
      this.$prev.on('click', function() {
        self.prevPage();
      });

      // 点击下一页
      this.$next.on('click', function() {
        self.nextPage();
      });

    },

    /**
     * 翻页
     */
    changePage: function(curpage) {
      var self = this,
          curPageNum = parseInt(curpage, 10);

      self.curPage = curPageNum;

      if (self.cache[curPageNum]) {
        self.$listWrap.html(self.cache[curPageNum]);
        self.$pageItem.filter(':contains(' + curPageNum + ')').addClass(self.curPageClassName).siblings('.' + self.curPageClassName).removeClass(self.curPageClassName);

        if (self.onInit && $.isFunction(self.onInit)) {
          self.onInit.call(self);
        }

      } else {

        self.$listWrap.html('<div class="ajax-loading">数据加载中...</div>');
        
        self.data.page = curPageNum;

        $.getJSON(self.url, self.data, function(res) {

          if (res.error) {
            dd.alert(res.message);
            return;
          }

          self.$listWrap.html(template(self.tmplId, res));
          self.$pageItem.filter(':contains(' + curPageNum + ')').addClass(self.curPageClassName).siblings('.' + self.curPageClassName).removeClass(self.curPageClassName);

          self.cacheData(curPageNum);
          self.lock = false;

          if (self.onInit && $.isFunction(self.onInit)) {
            self.onInit.call(self);
          }
        });

        self.lock = true;
      }


      if (curPageNum > 1) {
        self.$prev.removeClass('disabled');
        self.$prev.data('isPrev', true);

      } else {
        self.$prev.addClass('disabled');
        self.$prev.data('isPrev', false);
      }

      if (curPageNum == self.totalPage) {
        self.$next.addClass('disabled');
        self.$next.data('isNext', false);

      } else {
        self.$next.removeClass('disabled');
        self.$next.data('isNext', true);
      }

      // 切换页码的时候回滚到第一条数据
      /*var oftTop = self.$listWrap.offset().top,
          win = $(window);
      if (win.scrollTop() > oftTop) {
        win.scrollTop(oftTop);
      }*/

    },

    /**
     * 点击页码
     */
    pageClick: function(el) {
      var self = this;
      if (!self.lock) {
        var page = parseInt($(el).text(), 10);
        self.changePage(page);
      }
    },

    /**
     * 上一页
     */
    prevPage: function() {
      var self = this;

      if (this.$prev.data('isPrev') === true && !this.lock) {
        self.curPage --;

        if (self.curPage > 1 && self.curPage % self.maxShowPage === 0) {
          var pageStart = (self.curPage / self.maxShowPage - 1) * self.maxShowPage + 1;
          self.generatePage(pageStart);
        }

        self.changePage(self.curPage);
      }
    },

    /**
     * 下一页
     */
    nextPage: function() {
      var self = this;

      if (this.$next.data('isNext') === true && !this.lock) {
        self.curPage ++;

        if (self.curPage < self.totalPage && (self.curPage - 1) % self.maxShowPage === 0) {
          self.generatePage(self.curPage);
        }

        self.changePage(self.curPage);
      }
    },

    /**
     * 缓存数据
     */
    cacheData: function(p) {
      var self = this;

      if (self.isCache) {
        self.cache[p] = self.$listWrap.html();  // 缓存整个DOM节点
      }
    },
    
    reload: function(data) {
        var self = this;
        $.extend(self.data, data);
        self.init(self.args);
    }

  };

  module.exports = Pagination;
});