var homeViewModel = function() {
	var self = this;
	self.buildVersion = ko.observable();

	self.startLogTime = ko.observable();
	self.logMessages = ko.observableArray();
	self.startRowCounter = 0;
	self.endRowCounter = 0;
	
    self.save = function() {
    };

    self.getVersion = function() {
	    $.ajax({
	        url: "version",
	        type: "GET",
	        dataType: "json",
	        success: function (data) {
	            self.buildVersion(data.buildVersion)
	        },
	        error:function () {
	            $("#content").hide();
	        }
	    });
    }

    self.logGridViewModel = new ko.simpleGrid.viewModel({
		data : self.logMessages,
		columns : [ {
			headerText : "Time",
			rowText : function (item) {
				if (item.timestamp && item.timestamp != "") {
					return moment(item.timestamp).format("YYYY-MM-DD HH:mm:ss");
				} else {
					return "";
				}
			}
		}, {
			headerText : "Severity",
			rowText : function (item) {
				return item.Severity;
			}
		},{
			headerText : "Category",
			rowText : function (item) {
				return item.Category;
			}
		}, {
			headerText : "Message",
			rowText : function(item){
				return item.message
			}
		}],
		pageSize : 25
	});

	self.showLogMessages = function() {
		self.logMessages.removeAll();
		self.startRowCounter = 0; 
		self.endRowCounter = 0;
		
		if (self.startLogTime()!=null) {
			self.url = "api/log/getLogMessages/" + self.tenantId + "?startRow=0&startTime=" + self.startLogTime();
		} else{
			self.url = "api/log/getLogMessages/" + self.tenantId + "?startRow=0";
		}
		$.getJSON(self.url, function(data) {
			$.each(data, function(i, val) {
				self.logMessages.push(val);
				self.endRowCounter++;
			});
		});
	}

	self.nextLogMessages = function() {
		self.logMessages.removeAll();
		self.startRowCounter = self.endRowCounter;
		$.getJSON("api/log/getLogMessages/" + self.tenantId + "?startRow=" + self.endRowCounter, function(data) {
			$.each(data, function(i, val) {
				self.logMessages.push(val);
				self.endRowCounter++;
			});
		});
	}

	self.prevLogMessages = function() {
		self.logMessages.removeAll();
		self.startRowCounter -= 25;
		if (self.startRowCounter<0) {
			self.startRowCounter = 0;
		}
		self.endRowCounter = self.startRowCounter;
		$.getJSON("api/log/getLogMessages/" + self.tenantId + "?startRow=" + self.startRowCounter, function(data) {
			$.each(data, function(i, val) {
				self.logMessages.push(val);
				self.endRowCounter++;
			});
		});
	}

};

ko.bindingHandlers.chosen = 
{
  update: function(element) 
  {
	  $(element).chosen({width:"95%"});
	  $(element).trigger('liszt:updated');
  }
};


$(document).ajaxError(function (event, jqxhr, settings, exception) {
	console.log(exception);
	console.log(event);
	console.log(settings);
	console.log(jqxhr);
	if (jqxhr.status >= 200 && jqxhr.status <= 300)
		return;
    if (jqxhr.responseJSON != null)
        $("#serverErrorMessage").html(jqxhr.responseJSON.message);
    else if (jqxhr.responseText != null)
        $("#serverErrorMessage").html(jqxhr.responseText);
    else {
        $("#serverErrorMessage").html(jqxhr.statusText);
    }
    $("#serverError").show();
});

function closeError() {
    $("#serverError").hide();
}


$(function () {
	
	$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
		console.log(originalOptions);
        $("#serverError").hide();
        $("#progressIndicator").show();
        jqXHR.complete(function () {
           $("#progressIndicator").hide();
        });
        
    });
	
	$(".tabs a").click(function(e) {
		var tabElement = e.target.parentElement;
		var newTab = e.target;
		var parent = tabElement.parentElement;
		var activeTab = $(parent).find('.active');
		var activeTabId = activeTab.data('tab-id');
		var newTabId = $(newTab).data('tab-id');
		var hideSave = $(newTab).data('hide-save');
		
		if (activeTabId == newTabId) return;
		
		activeTab.removeClass('active');
		$(newTab).addClass('active');

		$('#' + activeTabId).fadeOut('fast', function() {
			$('#' + newTabId).fadeIn('fast');
		});

		if (hideSave) {
			$("#saveBtn").hide();
		} else {
			$("#saveBtn").show();
		}
	})
    
    window.homeViewModel = new homeViewModel();

    window.homeViewModel.getVersion();

});
