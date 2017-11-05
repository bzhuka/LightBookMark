// // popup.js
// window.onload = function() {
// 	document.getElementById("button").onclick = function()
// 		chrome.extension.sendMessage({
// 			type: "refresh"
// 		})
// }

//Event listener
function onAnchorClick(event) {
	chrome.tabs.create({
		selected:true,
		url:event.srcElement.href
	});
	return false;
}


function buildPopupDom(divName, data) {
	var popupDiv = document.getElementById(divName);

	var tbl = document.createElement('table');
	var tblBody = document.createElement('tbody');
	popupDiv.appendChild(tbl);

	for (var i = 0, ie = data.length; i < ie; ++i) {
		var row = document.createElement('tr');

		//extracrt the novel name and chapter number
		var vars = data[i].split("/");
		vars.pop();
		var chapterNum = vars.pop();
		var novelname = vars.pop();
		var websitename = vars.pop();

		var temp = chapterNum.split("-");
		var number = temp.pop();
		temp.pop();
		var name = temp.pop();

		var cellName = document.createElement("td");
		var cellNameText = document.createTextNode(name);
		var cellNumber = document.createElement("td");
		var cellNumberText = document.createTextNode(number);
		cellNumber.href = data[i];
		cellNumber.addEventListener('click', onAnchorClick);
		cellName.appendChild(cellNameText);
		cellNumber.appendChild(cellNumberText);
		row.appendChild(cellName);
		row.appendChild(cellNumber);
		tblBody.appendChild(row);
	}
	tbl.appendChild(tblBody);
}

function buildLightNovelList(divName) {
	var numRequestsOutstanding = 0;


	var microsecondsPerMonth = 1000 * 60 * 60 * 24 * 30;
  	var sixMonthsAgo = (new Date).getTime() - microsecondsPerMonth;

	chrome.history.search({
		'text':'',
		'startTime': sixMonthsAgo
	},
	function(historyItems) {

		for (var i = 0; i < historyItems.length; ++i) {
			var url = historyItems[i].url;
			var processVisitsWithUrl = function(url) {
				return function(visitItems) {
					processVisits(url, visitItems);
				};
			};
			chrome.history.getVisits({url, url}, processVisitsWithUrl(url));
			numRequestsOutstanding++;
		}
		if (!numRequestsOutstanding) {
			onAllVisitsProcessed();
		}
	});

	var latestChapter = {};

	var processVisits = function(url, visitItems) {
		//chops off chapter number
		var vars = url.split("/");
		vars.pop();
		var chapterNum = vars.pop();
		var novelname = vars.pop();
		var websitename = vars.pop();

		//get chapter number
		var temp = chapterNum.split("-");
		var number = temp.pop();
		var no_num = temp.join("-");

		for (var i = 0, ie = visitItems.length; i < ie; ++i) {
			if (websitename != "www.wuxiaworld.com") {
				continue;
			}

			latestChapter[websitename + "/" + novelname + "/" + no_num + "-"] = number;
		}

		if (!--numRequestsOutstanding) {
			onAllVisitsProcessed();
		}
	}

	var onAllVisitsProcessed = function() {
		urlArray = [];

		for (var url in latestChapter) {
			urlArray.push(url + latestChapter[url] + "/");
		}

		buildPopupDom(divName, urlArray.slice(0, 10));
	};
}

document.addEventListener('DOMContentLoaded', function () {
	buildLightNovelList("history_div");
});