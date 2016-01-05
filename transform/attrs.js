void function() {
    var reduce = Array.prototype.reduce;
    Object.defineProperty(Element.prototype, 'attrs', {
        enumerable : true,
        get : function() {
            var element = this;
            return reduce.call(this.attributes, function(res, attr) {
                res[attr.name] = attr.value;
                return res;
            }, {});
        }
    });
}();

/*void function() {
    var reduce = Array.prototype.reduce;
    Object.defineProperty(Element.prototype, 'attrs', {
        enumerable : true,
        get : function() {
            var element = this;
            return reduce.call(this.attributes, function(res, attr) {
                var name = attr.name;
                Object.defineProperty(res, name, {
                    enumerable : true,
                    set : function(value) {
                        element.setAttribute(name, value);
                    },
                    get : function() {
                        return attr.value;
                    }
                });
                return res;
            }, {});
        }
    });
}();*/
