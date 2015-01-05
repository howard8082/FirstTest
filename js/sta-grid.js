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
    return $.widget("sta.grid", {
        options: {
            autoColumnWidth : true, // 自适应宽度, 在表格宽度大于容器宽度时候无效
            jsonData : null,        // 表格数据
            renderer : null,        // 单元格个性绘制, key - function 形式， function接受参数：1，当前记录；2，行索引；3，列索引
            rowCount : -1,          // 默认行数，如果-1，表示按数据行数来。如果指定行数，则当记录条数小于行数时，自动空行填充
            
            // callback
            resize : null
        },
        
        // 表格当前各列的宽度
        _currentWidth: [ ],
        
        _bodyCellsSel: "div[role='grid'] table tbody tr:nth-child(1) td",
        
        _headerCellsSel: "div[role='grid-head'] table thead tr th",
        
        _mapping_key_order: [ ],      // 按顺序映射json的key
        
        /**
         * 重写widget的_create函数。对表格对象进行处理
         */
        _create : function () {
            // 0, 外层样式
            this.element.addClass( 'wrap-grid' );
            
            // 1, Topbar 样式
            var tb = this.element.find( "div[role='toolbar']" );
            tb.addClass( "topbar" )
              .addClass( "toolbar" )
              .addClass( "transparent" );
            //this.element.find( ".topbar[data-show='yes']" ).addClass( 'show-view' );
            this.element.find( ".topbar[data-show='no']" ).addClass( 'hidden-view' );
            
            // Topbar 下各种默认元素汇集
            tb.find( "button" ).addClass( "small" );
            tb.find( "button i[role='l_icon']" ).addClass( "on-left fg-gray" );
            
            // 2, 表头 样式
            var gdh = this.element.find( "div[role='grid-head']" );
            gdh.find( "thead th" ).addClass( "text-left bg-bsBlue fg-white" );
            
            this._fnDrawEmptyGrid();
            this._fnDrawEmptyRows();
            
            //$(window).resize(function() { this._fnCaculateColumnWidth(); this._refresh() });
            this._fnInitMapping();
            this._fnPutValue();
            this._fnCaculateColumnWidth();
            //alert('do create');
            this._refresh();
        },
        
        ///#region 私有函数
        _setOption : function ( key, value ) {
            alert('暂时不支持');
        },
        
        /**
         * 绘制grid本体table结构
         */
        _fnDrawEmptyGrid : function () {
            var innerGrid = this.element.find( "div[role='grid']" );
            innerGrid.append( "<table border='0'><tbody></tbody></table>" );
            innerGrid.find( "table" ).addClass( "dataTable" );
        },
        
        /**
         * 绘制所有空行
         */
        _fnDrawEmptyRows : function () {
            var hc = this.element.find( "div[role='grid-head'] table thead tr th" ).length;
            var d = (this.options.jsonData.local ? this.options.jsonData.local : this.options.jsonData.remote).Data;
            if ( this.options.rowCount !== -1 ) {
                if ( d.length > this.options.rowCount ) {
                    this.options.rowCount = d.length;
                }
            } else {
                this.options.rowCount = d.length;
            }
            
            for ( var i = 0; i < this.options.rowCount; i++ ) {
                this._fnDrawEmptyRow( i % 2, hc );
            }
        },
        
        /**
         * 绘制一条空行
         * @param mod 取模
         * @param hc head count, 每行单元格个数。按照定义的表头来给出值
         * @return 新增的tr实例
         */
        _fnDrawEmptyRow : function ( mod, hc ) {
            this.element.find( "div[role='grid'] table tbody" ).append( "<tr class=" + ( mod === 0 ? "'odd'" : "'even'" ) + "></tr>");
            var rtn = this.element.find( "div[role='grid'] table tbody tr:last-child" );
            for ( var i = 0; i < hc; i++ ) {
                rtn.append( "<td></td>" );
            }
            return rtn;
        },
        
        /**
         * 计算并设置表格每列的宽度
         */
        _fnCaculateColumnWidth : function () {
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
                
                if ( totalWidth <  this._fnGetWrapWidth() ) {
                    var f = this._fnGetWrapWidth() / totalWidth;
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
                    this._currentWidth[ idx ] += this._fnGetWrapWidth() - totalWidth;
                }
                
                return;
            }
        },
        
        _fnOrigWidth : function ( cells ) {
            var tmp = [ ];
            cells.each(function( index ) {
                tmp.push( $(this).width() );
            });
            return tmp;
        },
        
        _fnGetWrapWidth : function () {
            return this.element.width();
        },
        
        /**
         * 获取dom中的mapping key，并按序存储
         */
        _fnInitMapping : function() {
            var mko = this._mapping_key_order;
            this.element.find( this._headerCellsSel ).each(function ( index ) {
                mko.push( $(this).attr( "data-mapping" ) );
            });
        },
        
        /**
         * 将数据填入表格
         */
        _fnPutValue : function () {
            if ( this.options.jsonData !== null ) {
                
                if ( this.options.jsonData.local ) {
                    this._fnPutLocalDataValue( this.options.jsonData.local.Data );
                    return;
                }
                
                if ( this.options.jsonData.remote ) {
                    // TODO
                }
            }
        },
        
        /**
         * 绘制单元格
         * @param key data-mapping的值
         * @param rcd 某行数据对应的json格式
         *
         * @return 根据是否有key对应的render绘制出单元格内容
         */
        _fnCellRender : function ( key, rowIdx, rcd ) {
            if ( this.options.renderer === null ) {
                return rcd[ key ];
            }
            
            if ( this.options.renderer[ key ] === undefined ) {
                return rcd[key];
            }
            
            return this.options.renderer[ key ]( rcd, rowIdx, $.inArray( key, this._mapping_key_order ) );
        },
        
        /**
         * 清理表格单元View数据
         */
        _fnCleanCells : function () {
            this.element.find( "div[role='grid'] td" ).html( null );
        },
        
        /**
         * 将本地json数据，放入相应单元格中
         * @json 对应配置中jsonData.local.Data中的数据
         */
        _fnPutLocalDataValue : function ( json ) {
            this._fnCleanCells();
            var that = this, row = 0;
            $.each(json, function ( index ) {
                $.each(json[ index ], function( key, value ) {
                    var i = $.inArray( key, that._mapping_key_order );
                    if ( i === -1) {
                        return true;
                    }
                    var s = "div[role='grid'] table tbody tr:nth-child(" + ( index + 1 ) + ") td:nth-child(" + ( i + 1 ) + ")";
                    that.element.find( s ).html( that._fnCellRender( key, index, json[ index ] ) ); 
                });
            });
        },
        
        _refresh : function () {
            
            // 重置宽度
            var cw = this._currentWidth;
            this.element.find( this._bodyCellsSel ).each(function( index ) {
                $(this).width( cw[ index ] );
            });
            this.element.find(this._headerCellsSel).each(function( index ) {
                $(this).width( cw[ index ] );
            })
        },
        ///#endregion 私有函数
        
        doAlert : function( v ) {
            //alert("Hello world " + v);
        }
    });
}))