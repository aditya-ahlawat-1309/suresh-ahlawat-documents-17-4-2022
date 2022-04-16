// this file holds data that will dynamically be filled in by the templated build
Common.extend(Common, {
	activeUrl: "http://live.tb.ask.com/tr.gif",
	unifiedLoggingPixelUrl: "http://anx.tb.ask.com/anx.gif",
	localStorageCommunicationUrl: "http://eliteunzip.dl.tb.ask.com/blank.jhtml",
	searchFaviconUrl: "http://ak.imgfarm.com/images/toolbar/native/chrome/search-engines/ask/favicon.ico",
	chromeExtensionResetSearchSettingsUrl: "http://eula.mindspark.com/ask/reset-homepage-default-search-settings/",
	chromeExtensionUpdateEulaUrl: "http://eula.mindspark.com/ask/updates/chrome/",
    searchUrl: "http://search.tb.ask.com/search/GGmain.jhtml",
    searchSuggUrl: "http://ssmsp.ask.com/query",
    downloadUrl: "http://free.eliteunzip.com/index.jhtml",
	extensionId: "EliteUnzip",
    isChromeUpdateSearchRequired: "false" === "true",
    browserHomeUrlDesc: "Ask",
    keyword: "askws",
    isChromeStore: "true" === "true",
    isChrome25UpgradeRequired: "false" === "true",
   	companyKeyName: "EliteUnzip_aa",
    includeNPAPI: false,
    coBrandID: "BDG",
	getInstructionsUrl: function() {
		return config.instructionsUrl;
	},
    cso: {
        homepage: "",
        homepageInternal: "",
        search: "",
        searchInternal: "",
        searchPostParams: "",
        searchSuggest: "",
        searchSuggestPostParams: "",
        instant: "",
        instantPostParams: "",
        imageSearch: "",
        imageSearchPostParams: ""
    },
    newTabCache: "true" === "true",
    newTabURL: "http://ak.imgfarm.com/images/vicinio/chrome/spent/spentK.html"
});