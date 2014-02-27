﻿var testClientModel;

var emptyTestClientModel =
{
    HttpMethod: '',
    UriPathTemplate: '',
    Samples: {},
    UriParameters: [],
    BodyParameters: [],
    BaseAddress: ''
};

(function () {
    function BuildUriPath(template, uriParameters) {
        var path = template;
        for (var i in uriParameters) {
            var parameter = uriParameters[i];
            var variableName = '{' + parameter.name + '}';
            var parameterValue = parameter.value();
            if (parameterValue != "") {
                path = path.replace(variableName, parameterValue);
            }
        }
        return path;
    }

    function TestClientViewModel(data) {
        var self = this;

    	self.HttpMethod = data.HttpMethod;
        self.UriPathTemplate = data.UriPathTemplate;
        self.UriPath = ko.observable(self.UriPathTemplate);
    	self.BaseAddress = data.BaseAddress;
    	
        self.UriParameters = new Array();
        for (var i in data.UriParameters) {
            var uriParameter = data.UriParameters[i];
            var uriParameterValue = ko.observable(uriParameter.value);
            uriParameterValue.subscribe(function () {
                self.UriPath(BuildUriPath(self.UriPathTemplate, self.UriParameters));
            });
            self.UriParameters.push({ name: uriParameter.name, value: uriParameterValue });
        }

        self.RequestHeaders = ko.observableArray();

        self.RequestMediaType = ko.observable();

        var sampleTypes = new Array();
        for (var index in data.Samples) {
            sampleTypes.push(index);
        };
        self.SampleTypes = sampleTypes;

        self.ShouldShowBody = ko.observable(sampleTypes.length > 0);

        self.RequestBody = ko.observable();

        self.RequestMediaType.subscribe(function () {
            self.RequestBody(decodeSample(data.Samples[self.RequestMediaType()]) || "");
            var headers = self.RequestHeaders;
            var mediaType = self.RequestMediaType();
            if (mediaType && mediaType != "") {
                addOrReplaceHeader(headers, "content-type", mediaType);
            }
        });

        self.RequestBody.subscribe(function () {
            var headers = self.RequestHeaders;
            var contentLengh = self.RequestBody().length;
            addOrReplaceHeader(headers, "content-length", contentLengh);
        	if (self.HttpMethod=="POST") {
        		addOrReplaceHeader(headers, "content-type", "application/x-www-form-urlencoded");
        	} else {
        		addOrReplaceHeader(headers, "content-type", "application/xml");
        	}
        });

        self.addHeader = function () {
            self.RequestHeaders.splice(0, 0, { name: "", value: "" });
        };

        self.removeHeader = function (header) {
            self.RequestHeaders.remove(header);
        };

        self.response = ko.observable();

        self.sendRequest = function () {

            var uriPath = self.UriPath();
            var http = "http://" + self.BaseAddress;
            var https = "https://" + self.BaseAddress;

            // Just take the entire uriPath if it's an absolute URI.
            var uri = (uriPath.slice(0, http.length) == http || uriPath.slice(0, https.length) == https) ? uriPath : data.BaseAddress + uriPath;
        				        	
            var httpMethod = self.HttpMethod;
        	
            var headers = self.RequestHeaders();
            var requestBody = self.ShouldShowBody() ? self.RequestBody() : null;
        	      	
            SendRequest(httpMethod, uri, headers, requestBody, function (httpRequest) {
 
                var httpResponse = getHttpResponse(httpRequest);
                self.response(httpResponse);
                $("#testClientResponseDialog").dialog("open");
            });
        };

        $("#testClientDialog").dialog({
            autoOpen: false,
            height: "auto",
            width: "700",
            modal: true,
            open: function () {
            	jQuery('.ui-widget-overlay').bind('click', function() {
            		jQuery('#testClientDialog').dialog('close');
            	});
            },
            buttons: {
                "Send": function () {
                    self.sendRequest();
                }
            }
        });

        $("#testClientResponseDialog").dialog({
            autoOpen: false,
            height: "auto",
            width: "550",
            modal: true,
            open: function () {
            	jQuery('.ui-widget-overlay').bind('click', function() {
            		jQuery('#testClientResponseDialog').dialog('close');
            	});
            }
        });

        $("#testClientButton").click(function () {
            $("#testClientDialog").dialog("open");
        });
    }

    // Initiate the Knockout bindings
    var initialModel = testClientModel || emptyTestClientModel;
    ko.applyBindings(new TestClientViewModel(initialModel));
})();

function decodeSample(sampleString) {
    return unescape(sampleString).replace(/\+/gi, " ").replace(/\r\n/gi, "\n");
}

function addOrReplaceHeader(headers, headerName, headerValue) {
    var headerList = headers();
    for (var i in headerList) {
        if (headerList[i].name.toLowerCase() == headerName) {
            headers.replace(headerList[i], { name: headerList[i].name, value: headerValue });
            return;
        }
    }
    headers.push({ name: headerName, value: headerValue });
}

function SendRequest(httpMethod, url, requestHeaders, requestBody, handleResponse) {
    if (httpMethod.length == 0) {
        alert("HTTP Method should not be empty");
        return false;
    }

    if (url.length == 0) {
        alert("Url should not be empty");
        return false;
    }

    var httpRequest = new XMLHttpRequest();
    try {
    	
    	httpRequest.open(httpMethod, encodeURI(url), false);
    }
       catch (e) {
       	alert("SendRequest:"+ e);
        alert("Cannot send request. Check the security setting of your browser if you are sending request to a different domain.");
        return false;
    }

    try {
        for (var i in requestHeaders) {
            var header = requestHeaders[i];
            httpRequest.setRequestHeader(header.name, header.value);
        }
    } catch (e) {
        alert("Invalid header.");
        return false;
    }

	httpRequest.onreadystatechange = function() {
		switch (this.readyState) {
		case 4:
			handleResponse(httpRequest);
			break;
		default:
			break;
		}
	};

	httpRequest.ontimeout = function() {
		alert("Request timed out.");
	};

	if (requestBody == null) requestBody = "";

    try {
    	httpRequest.send(requestBody);
    } catch (e) {
        alert(e);
        return false;
    }

    return true;
}

function getHttpResponse(httpRequest) {

    var statusCode = httpRequest.status;
    var statusText = httpRequest.statusText;
    var responseHeaders = httpRequest.getAllResponseHeaders();
    var rawResponse = httpRequest.responseText;
		
    // IE - #1450: sometimes returns 1223 when it should be 204
    if (statusCode === 1223) {
        statusCode = 204;
        statusText = "No Content";
    }

    var responseStatus = statusCode + "/" + statusText;
 	
 	return { status: responseStatus, headers: responseHeaders, content: rawResponse };
 	
	
    
}