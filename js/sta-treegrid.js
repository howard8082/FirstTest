/**
 * TreeGrid控件
 * 依赖: jqueryui
 *          core.js; widget.js
 *       sta-grid.js
 *
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
    return $.widget(
        "sta.treegrid",
        $.sta.grid,
        {
            options : {
                height : '100px'
            },
            
            _role : {
                gridBody : 'treegrid'
            },
            
            ///#region 私有方法
            _create : function () {
                // treegrid不给出最小行数，因为比较难算出具体行数。可以给出默认高度，最好是每行的默认高度? TODO
                this.options.rowCount = -1;
                this._super();
            },
            
            _fnDrawEmptyGrid : function () {
                //alert( this.options.sss );
                this._super();
                var innerGrid = this.element.find( "div[role='" + this._role.gridBody + "']" );
                innerGrid.find( "table" ).removeClass( "dataTable" );
            }
            ///#endregion 私有方法
        }
    );
}))