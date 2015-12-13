var ARIA = {
    attachToDocument : function() {
        document.addEventListener('focus', this.onEvent.bind(this), true);
        document.addEventListener('click', this.onEvent.bind(this), true);
        document.addEventListener('mouseenter', this.onEvent.bind(this), true);
    },
    onEvent : function(event) {
        var element = event.target,
            role = element.role;

        if(role) {
            var Component = this.components[role];

            if(Component) {
                var instance = element.aria || new Component(element),
                    handler = instance['on' + event.type];

                if(handler) handler.call(instance, event);
            }
        }
    }
};
