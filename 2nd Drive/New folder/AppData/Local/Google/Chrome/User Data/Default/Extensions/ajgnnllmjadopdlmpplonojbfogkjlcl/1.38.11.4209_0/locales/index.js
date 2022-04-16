
var t = {
  'ar_SA': require('./ar_SA/inpages.json'),
  'da_DK': require('./da_DK/inpages.json'),
  'de_DE': require('./de_DE/inpages.json'),
  'en_US': require('./en_US/inpages.json'),
  'el_GR': require('./el_GR/inpages.json'),
  'es_ES': require('./es_ES/inpages.json'),
  'fi_FI': require('./fi_FI/inpages.json'),
  'fr_FR': require('./fr_FR/inpages.json'),
  'he_IL': require('./he_IL/inpages.json'),
  'hr_HR': require('./hr_HR/inpages.json'),
  'id_ID': require('./id_ID/inpages.json'),
  'it_IT': require('./it_IT/inpages.json'),
  'ja_JP': require('./ja_JP/inpages.json'),
  'ko_KR': require('./ko_KR/inpages.json'),
  'nb_NO': require('./nb_NO/inpages.json'),
  'nl_NL': require('./nl_NL/inpages.json'),
  'pt_BR': require('./pt_BR/inpages.json'),
  'pt_PT': require('./pt_PT/inpages.json'),
  'ro_RO': require('./ro_RO/inpages.json'),
  'ru_RU': require('./ru_RU/inpages.json'),
  'sk_SK': require('./sk_SK/inpages.json'),
  'sv_SE': require('./sv_SE/inpages.json'),
  'tr_TR': require('./tr_TR/inpages.json'),
  'zh_CN': require('./zh_CN/inpages.json'),
  'zh_TW': require('./zh_TW/inpages.json')
}

module.exports = function(language){
  language = language || 'en_US';
  return t[language];
}
