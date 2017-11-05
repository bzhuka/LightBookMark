//listening for an event / one-time requests
chrome.extension.onMessage.addListener(function(request, sender, sentResponse) {
	switch(request.type) {
		case "refresh":
			refresh();
		break;
	}
	return true;
});