// location of file to plot.
var datafile_loc = 'https://github.com/wtriplett/ds030/raw/R1.0.0/derivatives/mriqcp/fMRIQC_compiled.csv';

// global var to hold parsed CSV data
var parsedCSVData = null;

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

// perform the paring and set up the buttons for plotting
// columns
Papa.parsePromise(datafile_loc).then(
    function(results, file) {

        console.log("Parsing complete:", results, file); // hopefully.
        parsedCSVData = results.data;

        // column names
        names = Object.keys(parsedCSVData[0]);

        // populate nav bar w/ column names
        for (i = 0; i < names.length; i++) {
            if (['subject', 'scan', 'session'].indexOf(names[i]) != -1)
                continue;
            var but = makeButton(names[i]);
            $('#buttons').append(but);
        }

        // set event handler for buttons.
        // if another csv is loaded in dynamically and buttons are rebuilt:
        $('.column-select').off('click');
        $('.column-select').on('click', function (a) { boxplot(a.target.id) });

    }
);

function boxplot (numericColumn) {
    var plotDetails = {
        x: Array(),
        y: Array(),
        name: numericColumn,
        type: 'box',
        jitter: 0.25,
        whiskerwidth: 0.2,
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
            plotDetails.y.push(eval('a.'+numericColumn))
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
                zeroline: false
            },
        }
    );
};
