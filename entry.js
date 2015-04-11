var settings = {
	lastName: /[^a-z-]/,
	firstName: /[^a-z-]/,
	idNumber: /[^0-9]/,
	birthYear: /[^0-9]/,
	city: /[^a-z-]/,
	zipCode: /[^0-9]/,
	cellNum: /[^0-9]/
};

newCadetButton.addEventListener('click', function(){
	cadetDialog.showModal();
	cadetDialog.animate([{transform: 'translate3d(0, -100%, 0)'}, {transform: 'translate3d(0, 0, 0)'}], 600);
	document.querySelector('.addButton').innerHTML = '&#10003 Add Cadet';
	document.querySelector('[data-personal=lastName]').focus();

	var thisYear  = new Date().getFullYear();
	var birthYear = document.querySelector('[data-personal=birthYear]');
	var enrolled  = document.querySelector('[data-personal=enrolled]');
	var EGD       = document.querySelector('[data-personal=EGD]');
	document.querySelector('[data-personal=schoolYear]').value = `${thisYear}-${thisYear + 1}`;
	birthYear.min    = (birthYear.max = thisYear) - 20;
	enrolled.max     = new Date().toISOString().slice(0, 10);
	enrolled.min     = EGD.min = `${thisYear-20}-01-01`;
	EGD.max = `${thisYear+5}-01-01`
});

cadetDialog.addEventListener('keydown', function(evt){
	if(evt.keyCode == 27) { evt.preventDefault(); this.closeEntry() };
});

cadetDialog.addEventListener('close', function(evt){
	evt.preventDefault();
	this.querySelector('form').reset();
});

cadetDialog.addEventListener('input', function(evt){
	if (evt.target.nodeName == 'INPUT') {
		var regex = settings[evt.target.dataset.personal];
		if (regex) evt.target.value = evt.target.value.replace(regex, '', 'gi');
	}
});

document.querySelector('form').addEventListener('submit', ROTC.addCadet);
document.querySelector('.closeButton').addEventListener('click', cadetDialog.closeEntry);