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

({
    tag : 'root',
    content : {
        tag : 'article',
        content : [
            { tag : 'heading', content : 'Link' },
            {
                tag : 'section',
                content : {
                    tag : 'link',
                    attrs : { href : '//yandex.ru' },
                    content : 'Simple'
                }
            },
            {
                tag : 'section',
                content : {
                    tag : 'link',
                    attrs : { href : '//google.ru', rel : 'external' },
                    content : 'External'
                }
            }
        ]
    }
})
