NodeList.prototype.__proto__ = Array.prototype;
var ROTC = {
	request  : indexedDB.open('JROTC'),
	companies: ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL', 'INACTIVE'],
	clearResults() { cadets.innerHTML = "", this.cadets = []; return this; },
	getTrans(type) { return this.request.result.transaction(this.companies, type); },
	search(company) {
		var trans = this.clearResults().getTrans('readonly');
		trans.objectStore(company).openCursor().onsuccess = function(evt) {
			var cursor = this.result;
			if(cursor) ROTC.cadets.push(cursor.value), cursor.continue();
		};
		trans.oncomplete = function() {
			ROTC.cadets.sort(function(a, b) {
				return a.personal.lastName.localeCompare(b.personal.lastName);
			});
			for(var cadet of ROTC.cadets) {
				ROTC.createCadet(cadet);
			}
		}
	},
	bigSearch() {
		var company = controls.querySelector(':target').id;
		var store   = this.clearResults().getTrans('readonly').objectStore(company);
		store.get(searchBox.value).onsuccess = function() {
			ROTC.createCadet(this.result);
		};
	},
	addCadet() {
		var cadet = ['personal', 'uniform', 'promotions', 'awards', 'events', 'health'].reduce(function(cadet, prop) {
			cadet[prop] = {};
			for(var el of document.querySelectorAll(`[data-${prop}]`)) cadet[prop][el.dataset[prop]] = el.value.toUpperCase();
			return cadet;
		}, {});
		ROTC.getTrans('readwrite').objectStore(company.value).put(cadet).onsuccess = function() {
			cadetDialog.close();
			var cadetEl = ROTC.activeCadet.cadetEl;
			cadetEl.querySelector('.company').textContent  = cadet.personal.company;
			cadetEl.querySelector('.name').textContent     = `${cadet.personal.firstName} ${cadet.personal.lastName}`.toUpperCase();;
			cadetEl.querySelector('.idNumber').textContent = cadet.personal.idNumber;
			ROTC.cadets[cadetEl.dataset.index] = cadet;
		}
	},
	getCadetInfo(cadet) {
		for(var data of Object.keys(cadet)){
			for(var el of cadetDialog.querySelectorAll(`[data-${data}]`)) el.value = cadet[data][el.dataset[data]] || '';
		}
		document.querySelector('.addButton').innerHTML = '&#10003 SAVE';
		cadetDialog.showModal();
		cadetDialog.animate([{transform: 'translate3d(100%, 0, 0) scale(0)'}, {transform: 'translate3d(0, 0, 0) scale(1)'}], 500);
	},
	createCadet(data) {
		var personal = data.personal;
		var temp = cadetTemp.content.cloneNode(true);
		temp.querySelector('.company').textContent  = personal.company.toUpperCase();
		temp.querySelector('.name').textContent     = `${personal.firstName} ${personal.lastName}`.toUpperCase();
		temp.querySelector('.idNumber').textContent = personal.idNumber;
		temp.firstElementChild.setAttribute('contextmenu', 'cadetMenu');
		temp.firstElementChild.dataset.index = cadets.children.length;
		temp.firstElementChild.tabIndex = 0;
		cadetMenu.querySelector(`menuitem[label=${personal.company}]`).checked = true;
		cadets.appendChild(temp);
	},
	deleteCadet(cadet) {
		//ES6
		// var { firstName, lastName, idNumber, company } = cadet.personal;
		// var store   = this.getTrans('readwrite').objectStore(company);
		var store   = this.getTrans('readwrite').objectStore(cadet.personal.company);
		var request = store.delete(cadet.personal.idNumber).onsuccess = function() {
			console.log("%s %s %s was successfully deleted", cadet.personal.firstName, cadet.personal.lastName, cadet.personal.idNumber);
		}
		// var request = store.delete(idNumber).onsuccess = function() {
		// 	console.log(`${firstName} ${lastName} (${idNumber}) was successfully deleted`);
		// }
	},
	testing: {
		createDummy(amount) {
			var transaction = ROTC.getTrans('readwrite');
			var comps       = ROTC.companies.slice(0, -1);
			for(var count = 0; count < amount; count++) {
				var company = comps[~~(Math.random()*8)], idNumber = (''+Math.random()).slice(2, 9);
				transaction.objectStore(company).put({
					personal: {
						lastName  : 'Dummy',
						firstName : 'Dummy',
						idNumber  : idNumber,
						birthYear : 1998,
						birthMonth: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][~~(Math.random()*12)],
						gender    : 'Male',
						race      : ["Native American", "Hispanic (Other Than Black)", "Caucasian", "Asian + Pacific Islander", "African American"][~~(Math.random()*5)],
						address   : '123 45th st apt 67',
						state     : 'FL',
						city      : 'Miami',
						zipCode   : '33015',
						email     : 'dummydummy@dummy.com',
						schoolYear: '2014-2015',
						enrolled  : '2014-08-18',
						EGD       : '2018-05-24',
						company   : company,
						grade     : [9, 10, 11, 12][~~(Math.random()*4)],
						letLevel  : [1, 2, 3, 4][~~(Math.random()*4)],
						cellNum   : (''+Math.random()).slice(2, 12),
					}
				});
				transaction.oncomplete = function() {
					console.log(`%c ${amount} Dummy Cadets Were Successfully Added`, 'color: green; font-size: 20px');
				}
			};
		},
		createMe() {
			ROTC.getTrans('readwrite').objectStore('FOXTROT').put({
				personal: {
					lastName  : 'Reynoso',
					firstName : 'Edwin',
					idNumber  : '0298341',
					birthYear : '1998',
					birthMonth: 'Oct',
					gender    : 'Male',
					race      : 'Hispanic (Other Than Black)',
					address   : '6800 Nw 178Th St Apt 205',
					state     : 'FL',
					city      : 'Miami',
					zipCode   : '33015',
					email     : 'eorroe@gmail.com',
					schoolYear: '2014-2015',
					enrolled  : '2012-08-18',
					EGD       : '2014-11-13',
					company   : 'FOXTROT',
					grade     : '11',
					letLevel  : '3',
					cellNum   : '3475419673'
				}
			}).onsuccess = function() {
				console.log('%c YAY EDWIN WAS ADDED TO HIS OWN DATABASE', 'color: blue; font-size: 30px;');
			};
		}
	}
};

cadetDialog.closeEntry = function() {
	cadetDialog.animate([{transform: 'translate3d(0, 0, 0)'}, {transform: 'translate3d(0, -100%, 0)'}], 600)
	.onfinish = cadetDialog.close.bind(cadetDialog);
}

document.addEventListener('keydown', function(evt) {
	if(evt.target.nodeName != 'INPUT' && evt.keyCode == 8) evt.preventDefault();
});

ROTC.request.addEventListener('upgradeneeded', function() {
	for(var comp of ROTC.companies){
		var store = ROTC.request.result.createObjectStore(comp, {keyPath: 'personal.idNumber'});
		store.createIndex('LASTNAME', 'personal.lastName');
		store.createIndex('FIRSTNAME', 'personal.firstName');
		store.createIndex('LASTFIRST', ['personal.lastName', 'personal.firstName']);
	}
	console.log('%c JROTC DATABASE SUCCESSFULLY UPGRADED', 'color: green; font-size: 30px;');
});

searchBox.addEventListener('keyup', function(evt){
	(evt.keyIdentifier == 'Enter') && ROTC.bigSearch();
});

controls.addEventListener('click', function(evt){
	var target = evt.target;
	if (target.matches('button')) {
		location.hash = `#${target.id}`;
		ROTC.search(target.id);
		for(var menuItem of cadetMenu.querySelectorAll('menuitem')) menuItem.checked = false;
	} else if(target.id == 'ALL') {
		ROTC.clearResults();
	}
});

cadets.addEventListener('click', function(evt){
	var cadetEl = evt.target.closest('cadet');
	var cadet   = ROTC.cadets[cadetEl.dataset.index];
	if (evt.ctrlKey) {
		cadetEl.classList.toggle('selected');
	} else if (cadet) {
		ROTC.activeCadet = {cadet, cadetEl};
		ROTC.getCadetInfo(cadet);
	}
});

cadetDialog.querySelector('ul').addEventListener('click', function(evt) {
	for(var sect of document.querySelectorAll('section')) sect.removeAttribute('style');
	document.querySelector(`#${evt.target.textContent}`).style.display = 'block';
	document.querySelector('.active').className = 'sec flex';
	evt.target.classList.add('active');
});


//context menus
cadetMenu.addEventListener('click', function(evt) {
	var cadetEl = evt.relatedTarget.closest('cadet');
	var cadet   = ROTC.cadets[cadetEl.dataset.index];
	if(evt.target.label == 'Delete') {
		if(confirm(`You are about to permanently delete ${cadet.personal.firstName} ${cadet.personal.lastName} (${cadet.personal.idNumber})`)) {
			cadetEl.remove();
			ROTC.cadets[cadetEl.dataset.index] = null;
			ROTC.deleteCadet(cadet);
		}
	} else if(evt.target.label == 'Edit') {
		ROTC.getCadetInfo(cadet, cadetEl);
	}
});

var uniform = {
	"male": {
		"shirt": {
			"min": 13.5,
			"max": 19,
			"inc": 0.5
		},
		"pants": {
			"min": 26,
			"max": 38,
			"inc": 1
		},
		"shoes": {
			"min": 6,
			"max": 16,
			"inc": 0.5
		},
		"hats": {
			"min": 6.75,
			"max": 7.75,
			"inc": 0.5
		}
	},
	"female": {
		"shirt": {
			"min": 4,
			"max": 26,
			"inc": 2
		},
		"pants": {
			"min": 4,
			"max": 28,
			"inc": 1
		},
		"shoes": {
			"min": 4,
			"max": 11.5,
			"inc": 0.5
		},
		"hats": {
			"min": 6.75,
			"max": 7.75,
			"inc": 0.5
		}
	},
	"ranks": [
		"PRIVATE",
		"PRIVATE FIRST CLASS",
		"CORPORAL",
		"SERGEANT",
		"STAFF SERGEANT",
		"SERGEANT FIRST CLASS",
		"MASTER SERGEANT",
		"FIRST SERGEANT",
		"SERGEANT MAJOR",
		"COMMAND SERGEANT MAJOR",
		"SECOND LIEUTENANT",
		"FIRST LIEUTENANT",
		"CAPTAIN",
		"MAJOR",
		"CHUPI",
		"LIEUTENANT COLONEL",
		"COLONEL"
	]
}