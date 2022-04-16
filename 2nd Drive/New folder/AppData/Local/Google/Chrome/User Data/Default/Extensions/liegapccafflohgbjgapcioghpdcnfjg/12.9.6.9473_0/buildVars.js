



 
 

var buildVars = {
    defaults: {
        disappearingAskLogoURL: 'icons/tb_icon_search_disappearing_ask.png',
        includeOptionsPage: false,
        includeBrowserAction: false,
        forceNewTab: true,
        noSuccessPage: true,
        isTBPartOfPage: false,
        chromeManifestNewTab: 'spent',
        chromeEnableTopSites: false,
        hasExecutablePackages: true,
        chromeHideToolbarSearch: false,
        chromeShowToolbar: 'new-tab',
        chromeToolbarStyleSheet: ''
    },
    buildTime: {
        disappearingAskLogoURL: '',
        includeOptionsPage: false,
        includeBrowserAction: false,
        forceNewTab: true,
        noSuccessPage: true,
        isTBPartOfPage: false,
        chromeManifestNewTab: 'stubby',
        chromeEnableTopSites: false,
        hasExecutablePackages: false,
        chromeHideToolbarSearch: false,
        chromeShowToolbar: 'new-tab',
        chromeToolbarStyleSheet: ''
    }
};

/*
ChromeExtensionCopies.chromeShowToolbar: new-tab
ChromeExtensionCopies.chromeManifestNewTab: stubby
ChromeExtensionCopies.chromeHideToolbarSearch: ${ChromeExtensionCopies.chromeHideToolbarSearch}
ChromeExtensionCopies.chromeEnableTopSites: ${ChromeExtensionCopies.chromeEnableTopSites}
ChromeExtensionCopies.chromeToolbarStyleSheet: ${ChromeExtensionCopies.chromeToolbarStyleSheet}
 */