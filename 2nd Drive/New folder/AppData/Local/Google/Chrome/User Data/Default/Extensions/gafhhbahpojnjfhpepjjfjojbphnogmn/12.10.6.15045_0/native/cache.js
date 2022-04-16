(function(){
	var defaultNewTabURL = 'http://localhost:8080/index.html';
	var url = localStorage.getItem('newtab/url') || defaultNewTabURL;
	function cache(rendered){
        console.log('c: cache(%s)', rendered);
		
        console.log('c: url: %s', url);
		var x = new XMLHttpRequest();
		x.onreadystatechange = function(){
			if (x.readyState === 4 && x.status === 200){
				localStorage.setItem('newtab/html', x.responseText);
                if(!rendered)
                	pass(rendered);
			}else{
				console.log('c: html fetch failed with state: %s and status code: %s', x.readyState, x.status);
			}
		};
		x.open("GET", url, false);
        try{
            x.send();
        }catch (e){
            console.warn('c: caught: %s while attempting to get %s', e, url);
            console.dir(e);
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
            document.write(str + '<script type="text/javascript" src="newTabContentScript.js"></script>');
            cache(true);
            r=true;
		}
		console.log('c: %s', r?"already rendered":'no it wasnt');
	}

	if(localStorage.getItem('newtab/cache') == 'true'){
		pass();
	}else{		
		if(localStorage.getItem('newtab/url') == null){
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
		}

		var iframe = document.createElement('iframe');
		iframe.src = url;
		if(url != defaultNewTabURL)
			document.body.appendChild(iframe);
		document.body.style.height='98%';
	}

})();

