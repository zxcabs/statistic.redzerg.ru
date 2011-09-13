(function(){
//autocomplete Option
	var 	open = function() {
					$(this).removeClass("ui-corner-all").addClass("ui-corner-top").width($('input[name=pl2]').width());
				}
		,	close = function() {
					$(this).removeClass("ui-corner-top").addClass("ui-corner-all");
				}
		,	autocompletesearch = function () {
					$('#middle .content-index').removeClass('content-middle');
					$('.player input').unbind('autocompletesearch');
				};
		
	var option1 = {
			source: function( request, response ) {
				$.ajax({
						url: "/player/search",
						dataType: "json",
						data: {
							'include': request.term,
							'with': $('input[name=pl2]').val()
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
				$('input[name=pl1]').val(this.value);
			},
			open: open,
			close: close,
			appendTo: '.players .result-pl1',
			search: autocompletesearch
	}, 
	
	option2 = {
			source: function( request, response ) {
				$.ajax({
						url: "/player/search",
						dataType: "json",
						data: {
							'include': request.term,
							'with': $('input[name=pl1]').val()
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
				$('input[name=pl2]').val(this.value);
			},
			open: open,
			close: close,
			appendTo: '.players .result-pl2',
			search: autocompletesearch
	};
////// autocomplete option

//ajax form option
/*
	var ajaxFormOption = {
			//target: '#form-result',
			dateType: 'json',
			success: function (data) {
				var $res = $('#form-result');
				var $err = $('.error', $res).hide();
				var $stat = $('.stat', $res).hide();
				if (data.error) {
					$err.html(data.error).show();
				} else {
					$('.pl1 .name', $res).html(data.pl1);
					$('.pl2 .name', $res).html(data.pl2);
					$('.pl1 .score', $res).html(data.scr1);
					$('.pl2 .score', $res).html(data.scr2);
					$('.pl1 .per', $res).html(data.per1);
					$('.pl2 .per', $res).html(data.per2);
					$('.total', $res).html(data.gameCount);
					
					$('.urls', $res).html('');
					for(var i in data.matchsUrl) {
						$('.urls', $res).append('<li><a href="' + data.matchsUrl[i] + '">' + data.matchsUrl[i] + '</a></li>');
					};
					
					$stat.show();
				};
				
				$res.show();
			}
		};
*/
///// ajax form option

	$(document).ready(function() {
		$('input[name=pl1]').autocomplete(option1);
		$('input[name=pl2]').autocomplete(option2);
	//	$('#statInfoForm').ajaxForm(ajaxFormOption);
	});
	
})();