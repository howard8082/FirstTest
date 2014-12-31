/**
 * 通用Grid控件
 * 依赖：jqueryui
 *          core.js; widget.js
 * @author zhuhao
 */
(function ( factory ) {
    "use strict";
    if ( typeof define === 'function' && define.amd )
    {
        define( ['jquery'], factory );
    }
    else
    {
        factory( jQuery );
    }
}(function ( $ ) {
    "use strict";
    return $.widget("ui.sta_grid", {
        options: {
            // 自适应宽度
            autoColumnWidth : true
        },
        
        // 表格当前各列的宽度
        _currentWidth: [ ],
        
        _bodyCellsSel: ".wrap-grid-tbody table tbody tr:nth-child(1) td",
        
        _headerCellsSel: ".wrap-grid-thead table tbody tr td",
        
        /**
         * 重写widget的_create函数。对表格对象进行处理
         */
        _create: function () {
            this._fnCaculateColumnWidth();
            this._refresh();
        },
        
        ///#region 私有函数
        /**
         * 计算并设置表格每列的宽度
         */
        _fnCaculateColumnWidth: function () {
            if ( this.options.autoColumnWidth ) {
                var bodyCells = this.element.find(this._bodyCellsSel);
                var headerCells = this.element.find(this._headerCellsSel);
                
                var bcWidth = [ ], hcWidth = [ ];               
                hcWidth = this._fnOrigWidth( headerCells );
                bcWidth = this._fnOrigWidth( bodyCells );
                
                if ( bcWidth.length === 0 ) {
                    bcWidth = hcWidth;
                }
                
                var totalWidth = 0, c = 0;
                while ( hcWidth.length !== 0 ) {
                    var h = hcWidth.pop(), b = bcWidth.pop();
                    this._currentWidth.unshift( c = h > b ? h : b );
                    totalWidth += c;
                }
                
                if ( totalWidth <  this.element.parent().width() ) {
                    var f = this.element.parent().width() / totalWidth;
                    totalWidth = 0;
                    for ( var i = 0; i < this._currentWidth.length; i++ ) {
                        totalWidth += this._currentWidth[ i ] = parseInt( f * this._currentWidth[ i ] );
                    }
                    
                    // totalWith 肯定小于 parent.width()
                    var idx = -1, tmp = 0;
                    for ( var i = 0; i < this._currentWidth.length; i++ ) {
                        if ( this._currentWidth[ i ] > tmp ) {
                            tmp = this._currentWidth[ i ];
                            idx = i;
                        }
                    }
                    this._currentWidth[ idx ] += this.element.parent().width() - totalWidth;
                }
                
                return;
            }
        },
        
        _fnOrigWidth: function ( cells ) {
            var tmp = [];
            cells.each(function( index ) {
                tmp.push( $(this).width() );
            });
            return tmp;
        },
        
        _refresh: function () {
            var cw = this._currentWidth;
            this.element.find(this._bodyCellsSel).each(function( index ) {
                $(this).width( cw[ index ] );
            });
            this.element.find(this._headerCellsSel).each(function( index ) {
                $(this).width( cw[ index ] );
            })
        }
        ///#endregion 私有函数
    });
}))