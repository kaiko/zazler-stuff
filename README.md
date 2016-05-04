
# [Zazler-stuff](http://www.zazler.com/) - Common and useful templates, parsers and engines for zazler

This is additional pack for zazler to provide common useful functionality.

Configure 

    zazler.templateEngine("mt.html", "zazler-stuff/microtemplate-extra.js");
    zazler.conf({
       templates: ["zazler-stuff/templates/"],
       parsers  : ["zazler-stuff/parsers/"]
    });

Write rule

    "write-rules": [{ 
        table: "tr",   
        on: "true", 
        action: "update", 
        where: "label=new.label:((isnull(lang):isnull(new.lang))|(new.lang=lang))", 
        set: { 
            at: "if(content!=new.content,now(),at)" 
        },
        follow: [{ 
            table: "tr", 
            on: "req.affected=0", 
            action: "insert", 
            set: { 
                at: "now()" 
            } 
        }] 
    }]

Template translating syntax

single word and sentence

    <!title> Title <!>
    <!key-word> Default content <!>

attributes

    <!attr:key attr:key> <a attr="value" attr="value2"> Default content </a> <!>

attributes with translated content

    <!href:home-link target:home-link-target title:home-link-title> <a href="/home" target="_self" title="Home"> <!> <!home-link-text>Home<!> </a>

all <!> tags will be removed


Database table structure for translations

    TABLE_NAME tr
        label TEXT
        lang CHAR(2) 
        content TEXT
        at DATE