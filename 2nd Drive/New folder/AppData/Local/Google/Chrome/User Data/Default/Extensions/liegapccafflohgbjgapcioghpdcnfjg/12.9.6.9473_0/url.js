(function(){
    var UL_QUEUE_NAME = 'newtab/offline';
    var NUCLEAR = {external : 'http://search.tb.ask.com',
					internal : 'spentK.html'};

    var url = localStorage.getItem('newtab/url') || Common.newTabURL || NUCLEAR.external;
    var offLineArr = [];
    var offLineArrStr = localStorage.getItem(UL_QUEUE_NAME);
    var ts = new Date();
    var urlStr = localStorage.getItem('newtab/url');
    var URL_RE = /^http(s?)\:\/\/.*/;


    function UL(type,date){
        var d = new Date(date);
        if(typeof type != 'string'){
            throw 'uLinvalidType';
        } else if(!(d instanceof Date)) {
            throw 'uLinvalidDate';
        }
        var obj = {
            "type" : type,
            "date" : date
        };
        return obj;
    }
    window.Mindspark_ = window.Mindspark_ || {}
    window.Mindspark_.UL=UL;
    window.Mindspark_.offLineArr = offLineArr;
    window.Mindspark_.fireUL = fireUL;
    //Copied from Toolbar.js
    var toolbarInfo = self.toolbarInfo = {
        toolbarId: Global.getToolbarId(),
        partnerId: Global.getPartnerId(),
        partnerSubId: Global.getPartnerSubId(),
        installDate: Global.getInstallDate(),
        installTimestamp: Global.getInstallTimestamp(),
        toolbarBuildDate: config.buildDate,
        toolbarVersion: config.version
    };
    Mindspark_.shared.unifiedLogging.init({
        toolbarData: toolbarInfo,
        toolbarConfig: config,
        eventUrl: Common.unifiedLoggingPixelUrl,
        localStorageMechanism: {
            get: function(key) {
                return Global.retrieve(key);
            },
            set: function(key, value) {
                return Global.store(key, value);
            }
        },
        excludeButtonTypes: [
            'SearchBox',
            'EditFeaturesButton'
        ]
    });
    
    function fireUL(arr){
        if(!arr){
            throw new Error('fireULInvalidArray');
        }
        Mindspark_.shared.unifiedLogging.logCapNativeEvent(
            "OffLineEvents",
            {
                "events" : JSON.stringify(arr)
            }
        );
        
    };
    function isValidUrl(url){
        //requirements
        //must contain a '.' or a 'localhost'
        //If this is invoked, you have all failed me.

        var testRE = /(.+\..+|localhost)/;
        return testRE.test(url);
        

    }
	
	function getValidUrl(testUrl){
		if (!isValidUrl(testUrl)){
	        console.log('Creating UL for complete URL failure');
	        offLineArr.push(UL('URL_FAILURE', ts));
	        try{
	            testUrl = chrome.extension.getURL(NUCLEAR.internal);
	        } catch(e){
	            testUrl = NUCLEAR.external;
	        }
		}
		return testUrl;
	}

    function reroute(k){
		url = getValidUrl(url);
        if(!k){
            console.warn('c: trying again to %s', url);
            cache(null,true)
        }
        else{
            console.warn('c: No XHR capabilities redirecting to: %s', url);
            window.location=url;
        }
    }

    function cache(rendered, kill){
        function hasContent(str){
            if(!str || str.length ==0)
                return false;
            if(str.indexOf('<') > -1 && str.indexOf('>') == -1)
                return false;

            return true;
        }
        console.log('c: cache(%s)', rendered);
        
        console.log('c: url: %s', url);
        var x = new XMLHttpRequest();
        x.onreadystatechange = function(){
            if (x.readyState === 4 && x.status === 200){
                if(!hasContent(x.responseText)){
                    reroute(kill);
                }
                localStorage.setItem('newtab/html', x.responseText);
                if(!rendered)
                    pass(rendered);
            }else if (x.readyState === 4){
                console.log('c: html fetch failed with state: %s and status code: %s', x.readyState, x.status);
                reroute(kill);
            }
        };
        x.open("GET", url, false);
        try{
            x.send();
        }catch (e){
            console.warn('c: caught: %s while attempting to get %s', e, url);
            console.dir(e);
            reroute(kill);
        }
        console.log('c: cache returns');
    }
    function pass(r){
        console.log('c: pass(%s)', r);
        var str = localStorage.getItem('newtab/html') || '';
        if (r){
            //nop
        }else if(!str){
            cache();
        }else{
            document.body.innerHTML+=(str + '<script type="text/javascript" src="newTabContentScript.js"></script>');
            cache(true);
            r=true;
        }
        console.log('c: %s', r?"already rendered":'no it wasnt');
    }

   if(offLineArrStr){
        offLineArr = JSON.parse(offLineArrStr);
        if(!(offLineArr instanceof Array) && offLineArr.length)
            offLineArr = [].slice.call(offLineArr);
        if(!(offLineArr instanceof Array))
            offLineArr = [];
    }

    if(!URL_RE.test(urlStr)){
        console.log('Creating UL for DLP failure');
        offLineArr.push(UL('NO_DLP_URL_FOR_NEWTAB', ts));
    }
    if(!URL_RE.test(Common.newTabURL)){
        console.log('Creating UL for Vicinio failure');
        offLineArr.push(UL('NO_CONFIG_URL_FOR_NEWTAB', ts));
    }

	url = getValidUrl(url);
    
    if(navigator.onLine){
        if(offLineArr.length>0){
            try{
                fireUL(offLineArr);
                offLineArr =[];
            } catch (err){
                console.log('fireUL failed');                
                offLineArr.push( UL('ULFailedToSend' , ts));
                offLineArr.push( UL(err.message , ts));
                offLineArr.push( UL('newTabOpenedOffline' , ts));
            }
        }       
    } else {
        //Queue up an offline event;
        offLineArr.push( UL('newTabOpenedOffline', ts));
    }

    localStorage.setItem(UL_QUEUE_NAME, JSON.stringify(offLineArr));

    if(localStorage.getItem('newtab/cache') == 'true'){
        pass();
    }else{      
		var newTabUrl = localStorage.getItem('newtab/url');
        if(newTabUrl == null || newTabUrl == 'null'){
            if(localStorage.getItem('devMode') == 'true'){
                var wrapper = document.createElement('div');
                wrapper.style.margin = 'auto';
                wrapper.style.width = '400px';
                var h1 = document.createElement('h1');
                var img =document.createElement('img');
                img.src = 'http://lorempixel.com/400/200/cats/';
                var form = document.createElement('form');
                var urlLabel = document.createElement('label');
                var cacheLabel = document.createElement('label');
                var urlInput = document.createElement('input');
                var cacheInput = document.createElement('input');
                var submit = document.createElement('button');

                h1.innerHTML="Please Configure Defaults";
                urlLabel.innerHTML = "New Tab URL";
                urlLabel.style.display = 'block';
                cacheLabel.innerHTML = "Caching?";
                cacheLabel.style.display = 'block';
                submit.innerHTML = "Submit";

                urlInput.setAttribute('type','text');
                cacheInput.setAttribute('type','checkbox');
                cacheInput.setAttribute('checked',true);

                urlLabel.appendChild(urlInput);
                cacheLabel.appendChild(cacheInput);
                form.appendChild(urlLabel);
                form.appendChild(cacheLabel);
                form.appendChild(submit);
                wrapper.appendChild(h1);
                wrapper.appendChild(img);
                wrapper.appendChild(form);
                document.body.appendChild(wrapper);
                submit.onclick=function(e){
                    var u = urlInput.value,
                        c = cacheInput.checked;
                    if(u.indexOf(':\/\/') > -1){
                        localStorage.setItem('newtab/cache',c);
                        localStorage.setItem('newtab/url',u);
                        window.location.reload();
                    }
                    else{
                        alert("Invalid URL");
                        e.preventDefault();
                    }
                        
                    
                }
            } else {
                console.warn('c: Not Dev Mode, redirecting to: %s', NUCLEAR.external);
                window.location=NUCLEAR.external;
            }
        }else{
            console.warn('c: no cache, iframe.src: %s', url);
            var iframe = document.createElement('iframe');
            iframe.src = url;
            document.body.appendChild(iframe);
            document.body.style.height='98%';
        }
    }

})();



/*(function init(){
    Object.prototype.extend = Object.prototype.extend || function(obj){
        if(typeof obj == 'object'){
            for(var key in obj){
                if(obj.hasOwnProperty(key)){
                    this[key] = obj[key];
                }
            }
        }
        return this;
    }

    var url = localStorage.getItem('newtab/url');
    var frame = document.querySelector('iframe');
    frame.setAttribute('src', url);
    frame.style.extend({
        height : '100%',
        width : '100%',
        position : 'absolute',
        top: '0',
        left : '0',

    });
    document.body.style.extend({
        overflow:'hidden'
    })
})();*/
