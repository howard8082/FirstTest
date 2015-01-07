/**
 * 通用函数库
 *
 * @author zhuhao
 */
(function( $ ) {
    
    // 项目上下文
    $.extend( $, { _vp_ : "/" } );
    
    
    $.extend( $, {
        // $.helper 定义
        helper : 
        {
            /**
             * 根据项目规范，生成url字符串
             * @param ns 命名空间缩写
             * @param controller controller名称
             * @param action action名称
             * @return 对应的url。（不带有参数） 
             */
            toRoute : function ( ns, controller, action ) {
                return $._vp_ + ns + "/" + controller + "/" + action + "/";
            },
            
            convertToJson : function ( selectors ) {
            }
        },
        
        // $.console 定义
        console : 
        {
            log : function () {},
            debug : function () {},
            error : function () {},
            
            group : function () {},
            groupEnd : function () {}
            // TODO More func
        }
    });
    
    if ( navigator.userAgent.toUpperCase().search(/MSIE/) === -1 ) {
        $.extend( $, {
            console : console
        } );
    }
    
})( jQuery );