var module = (function() {
    var _id = "", _bridge = "";

    function _promise_callbacks(resolve, reject) {
        var unique = (Math.random() * 10000).toFixed(0);
        
        global["webjs__resolve_" + unique] = function({ result }) {
            resolve(result !== "undefined" ? JSON.parse(result) : undefined);
    
            delete global["webjs__resolve_" + unique];
            delete global["webjs__reject_"  + unique];
        }
    
        global["webjs__reject_" + unique] = function({ error }) { 
            reject(error !== "undefined" ? JSON.parse(error) : undefined);
    
            delete global["webjs__resolve_" + unique];
            delete global["webjs__reject_"  + unique];
        }
    
        return [ "webjs__resolve_" + unique, "webjs__reject_" + unique ];
    }
    
    function _unfold_params(params) {
        var string = "";
    
        params.forEach(function(param) {
            if (string.length > 0) {
                string += ",";
            }
            string += JSON.stringify(param);
        });
    
        return string;
    }
    
    function _result_callback(callback_name) {
        return "function(result) {" +
            _bridge + ".postMessage(JSON.stringify({" +
                "\"script\":\"" + callback_name + "\"," +
                "\"result\":(result !== undefined) ? JSON.stringify(result) : \"undefined\"" +
            "}))" +
        "}"
    }
    
    function _error_callback(callback_name) {
        return "function(error) {" +
            _bridge + ".postMessage(JSON.stringify({" +
                "\"script\":\"" + callback_name + "\"," +
                "\"error\":(error !== undefined) ? JSON.stringify(error) : \"undefined\"" +
            "}))" +
        "}"
    }
    
    function _evaluate(script) {
        view.object(_id).action("evaluate", {
            "script": script
        });
    }

    return {
        initialize: function(id, bridge) {
            var dir_path = this.__ENV__["dir-path"];

            _id = id, _bridge = bridge;

            _evaluate(dir_path + "/bridge.js");
            _evaluate("webjs.initialize(\"" + bridge + "\", \"" + $env["OS"] + "\")");

            return this;
        },

        import: function(path) {
            if (Array.isArray(path)) {
                path.forEach(function(path) {
                    _evaluate(path);
                });
            } else {
                _evaluate(path);
            }
        },
        
        call: function(name, params) {
            return new Promise(function(resolve, reject) {
                var [ resolve_name, reject_name ] = _promise_callbacks(resolve, reject);
        
                _evaluate(name + "(" + 
                    (params ? _unfold_params(params) + "," : "") +
                    _result_callback(resolve_name) + "," +
                    _error_callback(reject_name) + 
                ")");
            });
        },

        callback: function(name, params) {
            _evaluate(name + "(" +
                (params ? JSON.stringify(params) : "") +
            ")");
        },

        blob: function(path, content_type) {
            return new Promise(function(resolve, reject) {
                read("/", path.substring(1))
                    .then(function(bytes) {
                    
                    })
                    .catch(function(error) {
                    
                    });
            });
        },
    }
})();

__MODULE__ = module;
