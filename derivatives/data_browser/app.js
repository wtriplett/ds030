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
            margin: {t: 40, b:25},
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

    layoutBits = {
        static: false,
        margin: {t: 40},
        title: numericColumn,
        paper_bgcolor: 'rgb(255, 255, 255)',
        plot_bgcolor: 'rgb(243, 243, 243)',
        height: 575,
        showlegend: true,
        hovermode: 'closest',
        yaxis: {
            mirror: 'ticks',
            showline: false,
            title: numericColumn,
            showgrid: true
        },
        xaxis: {
            autorange: true,
            mirror: 'ticks',
            showgrid: true,
            zeroline: false,
            showline: true,
            autotick: true,
            ticks: '',
            showticklabels: false
        }
    };

    groupedCSVData = _.groupBy(parsedCSVData, function (a) { return a.scan });
    scan_names = Object.keys(groupedCSVData);
    subplt_coverage = 1/scan_names.length;
    // each iteration defines a subplot subdivision of the x-axis using the
    // same y-axis. See: https://plot.ly/javascript/subplots/
    for (n = 1; n<=scan_names.length; n++) {
        scan_name = scan_names[n-1]
        x_ind = (n == 1) ? '' : n; // first axis should have no numeric suffix

        domain = [ // normalized [0, 1] region of overall plot window to devote to this subplt
            (n-1)*subplt_coverage,
            (n)*subplt_coverage
        ]
        layoutBits['xaxis'+x_ind] = { domain: domain }

        perScan = {
            x: Array(),
            y: Array(),
            text: Array(),
            type: 'scatter',
            mode: 'markers',
            hoverinfo: 'text+name+y',
            xaxis: 'x'+x_ind,
            yaxis: 'y',
            marker: { size: 6, opacity: 0.50 },
            name: scan_name
        };
        for (e=0; e < groupedCSVData[scan_name].length; e++) {
            // TODO: cache this
            perScan.x.push(groupedCSVData[scan_name][e].subject);
            perScan.y.push(groupedCSVData[scan_name][e][numericColumn]);
            perScan.text.push(groupedCSVData[scan_name][e].subject);
        }
        toBePlotted.push(perScan);
    }

    // do the work...
    Plotly.newPlot('plotContainer', toBePlotted, layoutBits);
};

plottingFunction = boxplot;

// initialize with functional dataset.
$(document).ready(function () {
    loadData(datafiles[0]);
    $('.plot-select').on('click', function (a) {
        plottingFunction = (a.target.id == 'plot-type-box' ? boxplot : scatterplot);
        plottingFunction(currentlyPlottedCol);
    })
    $('#loadAnatomical').on('click', function (a) { loadData(datafiles[0]); Plotly.newPlot('plotContainer',[]) });
    $('#loadFunctional').on('click', function (a) { loadData(datafiles[1]); Plotly.newPlot('plotContainer',[]) });
 });
