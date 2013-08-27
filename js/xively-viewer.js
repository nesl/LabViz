var metadata = [];

$( document ).ready(function() {
  $('#new-feed').click(function(event) {
  	$('#new-feed-alert').hide();
    var key = $('#key').val();
    var feed = $('#feed').val();
    var channel = $('#channel').val();
    var startDay = $('#startDay').val();
    var startTime = $('#startTime').val();
    var endDay = $('#endDay').val();
    var endTime = $('#endTime').val();
    var interval = $('#interval').val();
    var operation = $('#operation').val();
    
    var dateObject = new Date();
    
	var currentDate = ("0" + dateObject.getDate()).slice(-2);
	var currentMonth = ("0" + (dateObject.getMonth() + 1)).slice(-2);
	var currentYear = dateObject.getFullYear();
	
	var currentHours = ("0" + dateObject.getHours()).slice(-2);
    var currentMinutes = ("0" + dateObject.getMinutes()).slice(-2);
    var currentSeconds = ("0" + dateObject.getSeconds()).slice(-2);
    
	var time = dateObject.getTime();
	
	reDate = new RegExp('(?:[0-9]){4}-(?:[0-9]){2}-(?:[0-9]){2}', 'i');
	reTime = new RegExp('(?:[0-9]){2}:(?:[0-9]){2}:(?:[0-9]){2}', 'i');
	    
    if (startDay == '' && endDay == '') {
    	var startDay = currentYear + '-' + currentMonth + '-' + currentDate;
    	var endDay = startDay;
		$('#startDay').val(startDay);
		$('#endDay').val(endDay);
    }
    
    if (endDay == '') {
        var endDay = currentYear + '-' + currentMonth + '-' + currentDate;
        $('#endDay').val(endDay);
    }
    
    if (startDay == '') {
        var startDay = endDay;
        $('#startDay').val(startDay);
    }
    
    if (startTime == '') {

    	var startTime = '00:00:00';
    	$('#startTime').val(startTime);
    	
    }
    
    if (endTime == '') {

    	var endTime = currentHours + ':' + currentMinutes + ':' + currentSeconds;
    	$('#endTime').val(endTime);

    	
    }
    
    if (interval == '') {
    	var start = moment(startDay + 'T' + startTime + 'Z');
    	var end = moment(endDay + 'T' + endTime + 'Z');

    	var interval = getBestInterval(start, end);
		$('#interval').val(interval);
    }
    
	if (key == '' || feed == '' || key == '' || startDay + startTime >= endDay + endTime || !reDate.test(endDay) || !reDate.test(startDay) || !reTime.test(endTime) || !reTime.test(startTime)) {
      $('#new-feed-alert').show();
    } else {
    	addNewGraph('container' + time, key, feed, name, channel, startDay + 'T' + startTime + 'Z', endDay + 'T' + endTime + 'Z', interval, operation, false);
    }
    return false;
  });
});

/*
 * Coordinate getting the feed information, fetching the datastreams, displaying the graph.
 */
function addNewGraph(renderContainer, key, feed, name, channel, start, end, interval, operation, clean) {

	if (!clean) {
	    metadata[renderContainer] = { 'key': key, 'feed': feed, 'name': name, 'operation': operation, 'channel': channel };
		$( '#graphs' ).append( '<div class="' + renderContainer + '-container"><button type="button" class="close pull-right" data-dismiss="alert">&times;</button><div id="' + renderContainer + '" style="height: 500px; min-width: 500px"></div><hr /></div>' );
		var clean = [];
	}
	
	if (operation) { operation = '&function=' + operation; }
	
	$('#' + renderContainer).highcharts('StockChart', {
		chart: {
			renderTo: renderContainer,
			zoomType: 'x'
		},
			
		scrollbar: {
			liveRedraw: false
		},
			
		navigator : {
			adaptToUpdatedData: false,
		},
		
		xAxis: {
			events: {
				setExtremes: afterSetExtremes
			}
		},
		
		rangeSelector : {
			buttons: [{
				type: 'hour',
				count: 1,
				text: '1h'
			}, {
				type: 'day',
				count: 1,
				text: '1d'
			}, {
				type: 'month',
				count: 1,
				text: '1m'
			}, {
				type: 'year',
				count: 1,
				text: '1y'
			}, {
				type: 'all',
				text: 'All'
			}],
			inputEnabled: false, // it supports only days
			selected : 4 // all
		},
		
		exporting: {   
			chartOptions:{		               
				yAxis: {
					labels: {
						style: {
							color: '#000',
							fontSize: '14px'
						}
					}
				}           
			}
		}
	});
		
	$.getJSON('https://api.xively.com/v2/feeds/' + feed + '.json?key=' + key, function(data) {
		var rawData = data;
		var datastreams = data.datastreams;
		datastreams.forEach(function (element, index, array) {
			if (channel == element.id || channel == '') {
				$.getJSON('https://api.xively.com/v2/feeds/' + feed + '/datastreams/' + element.id + '.json?start=' + start + '&end='  + end + '&interval=' + interval + '?key=' + key + operation, function(data) {

					var xively_datapoints = data.datapoints;
					var chartdata = clean;
				
					for (i = 0; i < xively_datapoints.length; i++) {
						chartdata.push([
							Date.parse(xively_datapoints[i].at),
							parseFloat(xively_datapoints[i].value)
						]);
					}
									
					chartdata.sort();
			
					var chart = $('#' + renderContainer).highcharts();
						
					chart.addSeries({
							data : chartdata,
							tooltip: {
								valueDecimals: 2
							},
							dataGrouping: {
								enabled: false
							}
					});
					chart.setTitle({
						text: 'Activity for ' + rawData.title
					});
				});
			}
		});
	});
}

function afterSetExtremes(e) {
									
	var minDate = Highcharts.dateFormat('%Y-%m-%dT%H:%M:%SZ', e.min);
	var maxDate = Highcharts.dateFormat('%Y-%m-%dT%H:%M:%SZ', e.max);
						
	var start = moment(minDate);
	var end = moment(maxDate);
						
	var interval = getBestInterval(start, end);
							
	var url,
		currentExtremes = this.getExtremes(),
		range = e.max - e.min;
		
	var id = e.target.chart.renderTo.id;
	
	var info = metadata[id];
									
	var chart = $(e.target.chart.renderTo).highcharts();
								
								
	chart.showLoading('Loading data from server...');
																								
	$.getJSON('https://api.xively.com/v2/feeds/' + info['feed'] + '/datastreams/' + info['channel'] + '.json?start=' + minDate + '&end='  + maxDate + '&interval=' + interval + '?key=' + info['key'] + '&function=' + info['operation'], function(data) {
								
		var xively_datapoints = data.datapoints;
		var chartdata = [];
		
		
		for (i=0; i < chart.series[0].data.length; i++) {
			if (chart.series[0].data[i]) {
				chartdata.push([
					chart.series[0].data[i].x,
					chart.series[0].data[i].y,
				]);
			}
		}
															
		for (i = 0; i < xively_datapoints.length; i++) {
			chartdata.push([
				Date.parse(xively_datapoints[i].at),
				parseFloat(xively_datapoints[i].value)
			]);
		}
									
		chartdata.sort();
		
		chart.series[0].setData(chartdata);
		chart.hideLoading();
								
	});

}

/* Returns the best interval to graph the specified date range 
 * or undefined if the range is too large. 
 */
function getBestInterval(start, end) {
  var hours = end.diff(start, 'hours');
  
  // https://xively.com/dev/docs/api/quick_reference/historical_data/
  var intervals = [
    {value:     1, max: 6},
    {value:    30, max: 12},
    {value:    60, max: 24},
    {value:   300, max: 5*24},
    {value:   900, max: 14*24},
    {value:  1800, max: 31*24},
    {value:  3600, max: 31*24},
    {value: 10800, max: 90*24},
    {value: 21600, max: 180*24},
    {value: 43200, max: 366*24},
    {value: 86400, max: 366*24}    
  ];
  var usableIntervals = _.filter(intervals, function(interval) { return hours <= interval.max; });
  return usableIntervals[0].value;
}

/* Some sample data is always useful to demonstrate the product */
$(document).ready(function() {
  $('.sample-data').click(function(event) {
    $('#key').val(event.currentTarget.attributes['data-key'].value);
    $('#feed').val(event.currentTarget.attributes['data-feed'].value);
    $('#channel').val(event.currentTarget.attributes['data-channel'].value);
    $('#startDay').val(event.currentTarget.attributes['data-startDay'].value);
    $('#startTime').val(event.currentTarget.attributes['data-startTime'].value);
    $('#endDay').val(event.currentTarget.attributes['data-endDay'].value);
    $('#endTime').val(event.currentTarget.attributes['data-endTime'].value);
    $('#interval').val(event.currentTarget.attributes['data-interval'].value);
    $('#operation').val(event.currentTarget.attributes['data-operation'].value);
  });
});