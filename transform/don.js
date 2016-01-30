({
    node : 'document',
    content : [
        {
            node : 'doctype',
            name : 'html'
        },
        {
            element : 'html',
            content : [
                {
                    element : 'head',
                    content : [
                        {
                            element : 'meta',
                            attributes : { charset : 'utf-8' }
                        },
                        {
                            element : 'meta',
                            attributes : {
                                name : 'viewport',
                                content : 'width=device-width,maximum-scale=1,initial-scale=1,user-scalable=0'
                            }
                        },
                        {
                            element : 'title',
                            content : 'ARIADOM'
                        },
                        {
                            node : 'comment',
                            content : 'role getter'
                        },
                        {
                            element : 'script',
                            attributes : { src : '../design/role.js' }
                        }
                    ]
                }
            ]
        }
    ]
})
