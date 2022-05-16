import { hideSpinner } from './spinner';
export const hideAlert = () => {
	hideSpinner();
	const el = document.querySelector('.alert');
	if (el) el.parentElement.removeChild(el);
};
export const showAlert = (dom, type, msg) => {
	hideAlert();
	//hideSpinner();
	const markup = `<div class="alert alert-${type} alert-dismissible">
					<button type="button" class="close" data-dismiss="alert">&times;</button>
					<h4 class="alert-heading">${type.toUpperCase()}!</h4>
					<p>${msg}</p>
					</div>`;
	document.querySelector(`${dom}`).insertAdjacentHTML('afterbegin', markup);
};

export const emailverifyAlert = (type, msg, status) => {
	hideSpinner();
	const markup = `<div class='card text-white bg-${type} mb-3 card-alert' style='max-width: 20rem;'>
		<div class='card-header'><h4>Email Verify Alert</h4></div>
		<div class='card-body'>
			<h4 class='card-title'>${status.toUpperCase()}</h4>
			<p class='card-text'>
				${msg}
			</p>
		</div>
	</div>`;
	document.querySelector('.email_Alert').insertAdjacentHTML('afterbegin', markup);
};
