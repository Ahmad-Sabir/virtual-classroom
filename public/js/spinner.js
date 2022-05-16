import { hideAlert } from './alerts';
export const hideSpinner = () => {
	const el = document.querySelector('.spinner-border');
	if (el) el.parentElement.removeChild(el);
};
export const showSpinner = () => {
	hideAlert();
	hideSpinner();
	const markup = `<div class="spinner-border spinner-border-lg text-primary"></div>`;
	document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
};
