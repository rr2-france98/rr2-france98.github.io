let lang = 'en',
		curTranslate = null;

const $elements = document.querySelectorAll("[data-i18n]");

try {
  const userLang = navigator.language || navigator.userLanguage,
				wantLang = localStorage.getItem('wantLang');

	lang = wantLang || userLang.split('-')[0];
} catch(error) {}

/*localStorage.setItem('myCat', 'Tom');
localStorage.clear();*/

const replaceText = (el) => {
	const key = el.getAttribute('i18n-key');
	el.innerHTML = curTranslate[key] || key;
}

const loadLang = () => {
	if(['en', 'fr', 'es'].indexOf(lang) === -1)
		lang = 'en';

	fetch(`i18n/${i18n_file}-${lang}.json`)
  .then(response => response.json())
  .then(translate => {
		curTranslate = translate;

		$elements.forEach(el => replaceText(el));
	});
}

if(lang !== "fr")
	loadLang();


// Add listeners
const $i18nSwitchers = document.querySelectorAll('[i18n-switcher]');
[...$i18nSwitchers].forEach($switcher => $switcher.addEventListener('click', e => {
	lang = e.target.getAttribute('i18n-switcher');
	loadLang();

	try {
		localStorage.setItem('wantLang', lang);
	} catch(error) {}
}));
