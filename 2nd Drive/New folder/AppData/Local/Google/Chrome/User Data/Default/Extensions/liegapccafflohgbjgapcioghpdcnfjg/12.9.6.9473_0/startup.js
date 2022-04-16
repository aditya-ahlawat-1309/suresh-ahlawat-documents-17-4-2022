(function(){
    window.go = function startupGo(){
        console.log('loading extension: bg.html');
        window.location='bg.html';
    };

    window.cls = function startupCls(){
        console.log('clearing local storage');
        localStorage.clear();
    };

    window.show=function(){
        var urlString = 'chrome-extension://' + chrome.runtime.id + '/debug.html';
        if(chrome.tabs)
            chrome.tabs.create({url:urlString});
        else{
            console.log('this is broken');
        }
    }

    window.addUniversalConsole=function(){
        var s = document.createElement('script');
        s.src='shared/universalConsole.js';
        document.body.appendChild(s);
    }

    /*(function(){
     if(!localStorage.getItem('shown') == true){
     localStorage.setItem('shown',true);
     setTimeout(window.show,1000);
     }
     })();*/

    var insertedContentScripts = false;

    window.dlp=function(){
        var addScript = function addScript(sources, callback){
                //console.log('s: addScript(%O)', arguments);
                if (sources.length > 0){
                    var src = sources.shift(),
                        script = document.createElement('script');

                    script.setAttribute('type', 'text/javascript');
                    script.setAttribute('src', chrome.extension.getURL(src));
                    script.addEventListener('load', function(){addScript(sources, callback);});
                    document.head.appendChild(script);
                    //console.log('s: added script: %s', src);
                }else{
                    callback();
                }
            },
            addContentScripts = function addContentScripts(callback){
                //console.log('s: addContentScripts(%O)', arguments);
                var addContentScriptsLoadListener = function addContentScriptsLoadListener(){
                    //console.log('s: addContentScriptsLoadListener(%O)', arguments);
                    if (insertedContentScripts) {
                        callback();
                    }else{
                        insertedContentScripts = true;
                        var scripts = [
                            "common/js/common.js",
                            "common/js/dynamic.js"
                        ];
                        addScript(scripts, callback);
                    }
                };
                //document.addEventListener('load', addContentScriptsLoadListener);
                addContentScriptsLoadListener();
            },
            loadDLP = function loadDLP(){
                //console.log('s: loadDLP(%O)', arguments);
                try{
                    var frame = document.createElement('iframe');
                    frame.src = Common.localStorageCommunicationUrl;
                    document.body.appendChild(frame);
                    console.log('s: loaded iframe to DLP: %s', Common.localStorageCommunicationUrl);
                }catch (e){
                    //nop
                }
            };
        addContentScripts(loadDLP);
    }
})();

