$( document ).ready(function() {
  $('#new-feed').click(function(event) {
    var key = $('#key').val();
    var feed = $('#feed').val();
    var name = $('#name').val();
    var channel = $('#channel').val();
    var startDay = $('#startDay').val();
    var startTime = $('#startTime').val();
    var endDay = $('#endDay').val();
    var endTime = $('#endTime').val();
    var interval = $('#interval').val();
    var operation = $('#operation').val();

    if (key == '' || feed == '') {
      $('#new-feed-alert').show();
    }
    else {
      addNewGraph(key, feed, name, channel, startDay + 'T' + startTime + 'Z', endDay + 'T' + endTime + 'Z', interval, operation);
    }
    return false;
  });
});

/*
 * Coordinate getting the feed information, fetching the datastreams, displaying the graph.
 */
function addNewGraph(key, feed, name, channel, start, end, interval, operation) {

	console.log(start + ' ' + end + ' ' + interval);
	$.getJSON('https://api.xively.com/v2/feeds/' + feed + '/datastreams/' + channel + '.json?start=' + start + '&end='  + end + '&interval=' + interval + '?key=' + key + '&function=' + operation, function(data) {

		console.log('https://api.xively.com/v2/feeds/' + feed + '/datastreams/' + channel + '.json?start=' + start + '&end='  + end + '&interval=' + interval + '?key=' + key + '&function=' + operation);
		
        var xively_datapoints = data.datapoints;
        var chartdata = [];
        
        for (i = 0; i < xively_datapoints.length; i++) {
            chartdata.push([
                Date.parse(xively_datapoints[i].at),
                parseFloat(xively_datapoints[i].value)
            ]);
        }
    		
		var chart = new Highcharts.StockChart({
			chart: {
				renderTo: 'container'
			},
		
			xAxis: {
	    		events: {
	    			setExtremes: function(e) {
	    			
	    			if (e.trigger == 'navigator') {
							if (e.DOMEvent.type == 'mouseup') {
											
								var minDate = Highcharts.dateFormat('%Y-%m-%dT%H:%M:%SZ', e.min);
								var maxDate = Highcharts.dateFormat('%Y-%m-%dT%H:%M:%SZ', e.max);
						
								var start = moment(minDate);
								var end = moment(maxDate);
						
								var interval = getBestInterval(start, end);
							
								addNewGraph(key, feed, name, channel, minDate, maxDate, interval, operation);
							}
	    				}
	    			}
	    		}
	    	},
		
			rangeSelector: {
				selected: 1
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
			},
			
			series : [{
				name : 'NESL Door Sensor',
				data : chartdata,
				tooltip: {
					valueDecimals: 2
				}
			}]
		});
	});
}


/* Returns the best interval to graph the specified date range 
 * or undefined if the range is too large. 
 */
function getBestInterval(start, end) {
  var hours = end.diff(start, 'hours');
  
  // https://xively.com/dev/docs/api/quick_reference/historical_data/
  var intervals = [
    {value:     0, max: 6},
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
    $('#name').val(event.currentTarget.attributes['data-name'].value);
    $('#channel').val(event.currentTarget.attributes['data-channel'].value);
    $('#startDay').val(event.currentTarget.attributes['data-startDay'].value);
    $('#startTime').val(event.currentTarget.attributes['data-startTime'].value);
    $('#endDay').val(event.currentTarget.attributes['data-endDay'].value);
    $('#endTime').val(event.currentTarget.attributes['data-endTime'].value);
    $('#interval').val(event.currentTarget.attributes['data-interval'].value);
    $('#operation').val(event.currentTarget.attributes['data-operation'].value);
  });
});