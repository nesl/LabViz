LabViz
======

This project aims at providing visualization of sensor data on a web interface, optimized for mobile platforms (especially the Ipad). It's first use is intended to showcase sensor data from the Network and Embedded Systems Laboratory at UCLA. The program (or a variant of it) will run on IPads or other mobile devices outside other labs in Boelter Hall, UCLA. 

An working example of this can be accessed at http://nesl.github.io/LabViz

Author
------
Written by Aamoy Gupta in 2013, under the MIT License.

Information
-----------
LabViz is written in JavaScript. It uses JQuery, Twitter Bootstrap, and HighCharts for the visualizations in the frontend. The backend scripts use Moment for timestamp parsing, the Xively Javascript API, and D3 for compatibility with mobile devices.

LabViz acquires Xively feeds through the use of a key-id pair. The feed id is a unique number associated with the feed. The API key grants permissions to the clients. It is suggested to use API Keys with only "READ" permissions. Feeds are acquired through the use of JSON strings which allow for extra parameters such as time bounds, data resolution, and channel selection. Undocumented Xively API also allows basic statistical functions, such as average and sum.

Usage
-----
LabViz is fairly easy to use. The only required fields are the API Key and Feed ID. This will call all the channels by default, and load data for the current day at the highest possible resoltuion allowed by Xively API. Entering a time and/or date range enables the user to call datapoints for that specific time range. The data interval option will allow the user to select an initial data resolution (this changes dynamically when user tries to zoom in or out, or changes the date range). The user can also specify a specific channel to display (as opposed to all the series on one graph). Finally, a user can use the Xively undocumented API to get the sum or the average over a period of time.

Once the fields are configured to the user's liking, a graph can be generated. The graph can be manipulated through zooming and gestures with both a pointing device or a touchscreen interface. The number of graphs that can be generated at once is dependent on browser cache, as well as the Xively API Call Limit and is virtually unlimited.

Some examples, namely the door sensor, temperature sensor, and light sensor are provided as well. These examples may be accessed by clicking them. The fields will automatically be filled in. The examples can also be used as a way to quickly set up a mobile device for exhibition (for instance, in the Boelter Hall deployment).

Modification
------------
Source code is available at https://github.com/nesl/LabViz under the MIT License.

Common Modifications:

- To add more examples, or quick-links, check the index.html file.
- To change the name of the org, check the index.html file

Bugs/Issues
-----------

- Loading a large number of points at high resolution (for several months or so), takes some time to load from the server. Usually, the graph can be generated after some time, at which points the data points are cached, and there are no further issues. In some cases, the graph hangs seemingly indefinitely. To solve this, cancel the get operation by closing the graph and/or reloading the page. Flushing the browser cache may also help.
- Xively sometimes returns a subset of the data points the user asks for, despite the correct JSON calls in an appropriate resolution.

Improvements
------------

- Statistical Javascript package in backend to provide the user with more options and data. These tools will include regressions for the loaded points, curve smoothing, etc.
- Using the aforementioned statistical tools to make predictions based on several models (for different amounts of time).





