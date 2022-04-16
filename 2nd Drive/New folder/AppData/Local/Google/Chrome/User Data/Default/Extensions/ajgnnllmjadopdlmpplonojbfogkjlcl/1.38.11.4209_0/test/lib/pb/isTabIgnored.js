var original = chrome.extension.getBackgroundPage().FA.Background.isTabIgnored;

module.exports = {
	stub: stub,
	restore: restore
}

function stub(val){
	if(typeof val === 'undefined') val = false;
	chrome.extension.getBackgroundPage().FA.Background.isTabIgnored = function(){ return val }
}

function restore(){
	chrome.extension.getBackgroundPage().FA.Background.isTabIgnored = original
}
