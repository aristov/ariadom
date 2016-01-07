({
    tagName : 'root',
    childNodes : [
        {
            tagName : 'article',
            childNodes : [
                {
                    tagName : 'heading',
                    childNodes : ['Link']
                },
                {
                    tagName : 'section',
                    childNodes : [
                        {
                            tagName : 'link',
                            attributes : [
                                { name : 'href', value : '//yandex.ru' }
                            ],
                            childNodes : ['Simple']
                        }
                    ]
                },
                {
                    tagName : 'section',
                    childNodes : [
                        {
                            tagName : 'link',
                            attributes : [
                                { name : 'href', value : '//google.ru' },
                                { name : 'rel', value : 'external' }
                            ],
                            childNodes : ['External']
                        }
                    ]
                }
            ]
        }
    ]
})

/* DON - Document object notation */

({
    element : 'root',
    child : {
        element : 'article',
        children : [
            { element : 'heading', text : 'Link' },
            {
                element : 'section',
                child : {
                    element : 'link',
                    attributes : { href : '//yandex.ru' },
                    text : 'Simple'
                }
            },
            {
                element : 'section',
                child : {
                    element : 'link',
                    attributes : { href : '//google.ru', rel : 'external' },
                    text : 'External'
                }
            }
        ]
    }
})
