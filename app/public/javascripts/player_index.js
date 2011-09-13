(function(){
//autocomplete Option
	var 	open = function() {
					$(this).removeClass("ui-corner-all").addClass("ui-corner-top").width($('input[name=pl2]').width());
				}
		,	close = function() {
					$(this).removeClass("ui-corner-top").addClass("ui-corner-all");
				}
		,	autocompletesearch = function () {
					$('form[name=player_info] input[name=pl]').unbind('autocompletesearch');
				};
		
	var option = {
			source: function( request, response ) {
				$.ajax({
						url: "/player/search",
						dataType: "json",
						data: {
							'include': request.term
						},
						success: function(data) {
							var arr = [];
							for (var i = 0; i < data.length; i += 2) {
								arr.push({label: data[i] + '  -  ' + data[i + 1], value: data[i]});
							};
							response(arr);
						}
					});
			},
			minLength: 1,
			select: function( event, ui ) {
				$('input[name=pl]').val(this.value);
			},
			open: open,
			close: close,
			appendTo: 'form[name=player_info] .pl-result',
			search: autocompletesearch
	};
////// autocomplete option
	$(document).ready(function() {
		$('input[name=pl]').autocomplete(option);
	});
	
})();