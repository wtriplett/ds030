// location of file to plot.
//var datafile_loc = 'https://cdn.rawgit.com/wtriplett/ds030/R1.0.0/derivatives/mriqcp/fMRIQC_compiled.csv';
var datafiles = [
    {
        name: 'DS030 - Anatomical MRI QC Results',
        location: 'https://cdn.rawgit.com/wtriplett/ds030/R1.0.0/derivatives/mriqcp/aMRIQC_compiled.csv'
    },
    {
        name: 'DS030 - Functional MRI QC Results',
        location: 'https://cdn.rawgit.com/wtriplett/ds030/R1.0.0/derivatives/mriqcp/fMRIQC_compiled.csv'
    }
];

// global var to hold parsed CSV data
var parsedCSVData = null;
var groupedCSVData = null;

// create a button with name and id from user.
// used to create buttons to plot columns in CSV file.
function makeButton(name) {
    var btn = $('<button class="btn btn-default btn-xs btn-block column-select" type="button" id="'+name+'">'+name+'</button>');
    return btn;
}

// Call to Papa CSV parsing library with parameters.
// TODO: add error checking.
Papa.parsePromise = function(file) {
    return new Promise(function(resolve, reject) {
        Papa.parse(file, {
            delimiter: "",	// auto-detect
            newline: "",	// auto-detect
            header: true,
            dynamicTyping: true,
            preview: 0,
            encoding: "",
            worker: false,
            comments: false,
            step: undefined,
            complete: resolve,
            error: undefined,
            download: true,
            skipEmptyLines: true,
            chunk: undefined,
            fastMode: undefined,
            beforeFirstChunk: undefined,
            withCredentials: undefined
        });
    });
};

var plottingFunction = null;
var currentlyPlottedCol = '';

// perform the paring and set up the buttons for plotting
// columns
function loadData (dataspec) {
    Papa.parsePromise(dataspec.location).then(
        function(results, file) {

            console.log("Parsing complete:", results, file); // hopefully.
            parsedCSVData = results.data;

            // column names
            var names = Object.keys(parsedCSVData[0]);

            $('#buttons').empty();
            // populate nav bar w/ column names
            for (i = 0; i < names.length; i++) {
                if (['subject', 'scan', 'session'].indexOf(names[i]) != -1)
                    continue;
                $('#buttons').append(makeButton(names[i]));
            }

            $('#plotContainerTitle').html(dataspec.name)
            // set event handler for buttons.
            // if another csv is loaded in dynamically and buttons are rebuilt:
            $('.column-select').off('click');
            $('.column-select').on('click', function (a) { currentlyPlottedCol = a.target.id; plottingFunction(a.target.id) });

        }
    )
}

function boxplot (numericColumn) {

    var plotDetails = {
        x: Array(),
        y: Array(),
        text: Array(),
        name: numericColumn,
        type: 'box',
        jitter: 0.25,
        whiskerwidth: 0.2,
        hoverinfo: 'all',
        color: 'scan',
        marker: {
          //color: 'rgba(128,128,128,0.75)',
          size: 3
        },
        boxpoints: 'all' // alternative: 'suspectedoutliers'
    };

    // extract requested data from parsed CSV and populate
    _.each(parsedCSVData,
        function (a) {
            plotDetails.x.push(a.scan),
            plotDetails.y.push(a[numericColumn]),
            plotDetails.text.push(a.subject)
        }
    );

    // do the work...
    Plotly.newPlot('plotContainer', [plotDetails],
        {
            static: true,
            boxmode: 'group',
            margin: {t: 40, b:20},
            title: numericColumn,
            paper_bgcolor: 'rgb(243, 243, 243)',
            plot_bgcolor: 'rgb(243, 243, 243)',
            height: 575,
            showlegend: false,
            yaxis: {
                title: numericColumn,
                zeroline: false,
                mirror: 'ticks'
            },
            xaxis: {
                mirror: 'ticks'
            }
        }
    );
};

function scatterplot (numericColumn) {

    toBePlotted = Array();

    groupedCSVData = _.groupBy(parsedCSVData, function (a) { return a.scan });

    _.each(groupedCSVData,
        function (a, scan_name) {
            perScan = {
                x: Array(),
                y: Array(),
                text: Array(),
                type: 'scatter',
                mode: 'markers',
                hoverinfo: 'text+name+y',
                marker: { size: 7, opacity: 0.50 },
                name: scan_name
            };
            _.each(a, function(ele, ind) {
                perScan.x.push(ele.subject);
                perScan.y.push(ele[numericColumn]);
                perScan.text.push(ele.subject);
            });
            toBePlotted.push(perScan);
        }
    );

    // do the work...
    Plotly.newPlot('plotContainer', toBePlotted,
        {
            static: false,
            margin: {t: 40},
            title: numericColumn,
            paper_bgcolor: 'rgb(243, 243, 243)',
            plot_bgcolor: 'rgb(243, 243, 243)',
            height: 575,
            showlegend: true,
            hovermode: 'closest',
            xaxis: {
                autorange: true,
                mirror: 'ticks',
                showgrid: true,
                zeroline: false,
                showline: true,
                autotick: true,
                ticks: '',
                showticklabels: false
            },
            yaxis: {
                mirror: 'ticks',
                showline: true,
                showgrid: true
            }
        }
    );
};

plottingFunction = boxplot;

// initialize with functional dataset.
$(document).ready(function () {
    loadData(datafiles[1]);
    $('.plot-select').on('click', function (a) {
        plottingFunction = (a.target.id == 'plot-type-box' ? boxplot : scatterplot);
        plottingFunction(currentlyPlottedCol);
    })
 } );
