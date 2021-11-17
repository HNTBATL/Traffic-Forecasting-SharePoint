// put in script editor at top of page:
// <link rel="stylesheet" type="text/css" href="https://hntbdesigntraffic.sharepoint.com/SiteAssets/bootstrap/css/bootstrap-iso.css">
// <script type="text/javascript">
// (function(){
//      document.querySelector("#pageTitle").style.display = 'none';
// })();
// </script>

// Place the following line of code in Edit Web Part --> Miscellaneous --> JS Link to link the code/custom css/external libraries to the page:
// ~site/SiteAssets/js/jquery.js|~site/SiteAssets/js/jquery.SPServices.min.js|~site/SiteAssets/js/Chart.bundle.js|~site/SiteAssets/js/BurnRateByMonth.js|~site/SiteAssets/js/Chart.PieceLabel.js
var sitesChart = sitesChart || {};

sitesChart.Colors = [
  "#214154",
  "#265961",
  "#227066",
  "#76A665",
  "#F7E32E",
  "#EBD72C",
  "#AB9D20",
  "#6B6214"
];
sitesChart.Amount = [];
sitesChart.Date = [];
sitesChart.MainListAmount = []
sitesChart.MainListDate = []
sitesChart.Projects = {
  taskOne: [],
  tastTwo: []
}
sitesChart.taskOne = {}
sitesChart.taskOne.Amount = []
sitesChart.taskOne.Date = []

sitesChart.taskTwo = {}
sitesChart.taskTwo.Amount = []
sitesChart.taskTwo.Date = []


// Override the rendering
sitesChart.FieldRenderSetup = function() {
  var override = {};
  override.Templates = {};
  override.Templates.Header = sitesChart.CustomHeader;
  override.Templates.Item = sitesChart.CustomItem;
  override.Templates.Footer = sitesChart.CustomFooter;

  SPClientTemplates.TemplateManager.RegisterTemplateOverrides(override);
};

//Get the data from the list
sitesChart.CustomItem = function(ctx) {
  return "";
};

const toMaxTaskOne = 2500000
const toMaxTaskTwo = 2023600

//Override the Header
sitesChart.CustomHeader = function(ctx) {
  return `
    <div class="bootstrap-iso"> 
        <div class="container"> 
            <div class="panel panel-default"> 
                <div class="panel-heading" id="main-header">
                    <h2 align="center">HNTB Burn Rate by Month</h2>
                </div>
                <div class="panel-heading">
                            <div class="form-check" align="center">
                                <input class="form-check-input" type="radio" name="flexRadioDefault" id="task-order-1" checked>
                                <label class="form-check-label" for="flexRadioDefault1" style="font-size:18px;color:gray;">
                                    Task Order 1
                                </label>
                            </div>
                            <div class="form-check" align="center">
                                <input class="form-check-input" type="radio" name="flexRadioDefault" id="task-order-2">
                                <label class="form-check-label" for="flexRadioDefault1" style="font-size:18px;color:gray;">
                                    Task Order 2
                                </label>
                            </div>
                </div> 
                <div id="chart-panel">
                </div> 
            </div> 
        </div> 
    </div>
    `
};

const getBurnRateList = () => {
  let project
	$().SPServices({
		operation: "GetListItems",
		async: false,
		listName: "BurnRateByMonth",
		completefunc: function(listData, Status) {
			$(listData.responseXML).SPFilterNode("z:row").each(function() {
        // get task
        let taskOrder = $(this).attr("ows_Task") || ""
        let titleDate = $(this).attr("ows_Title") || ""
        let amount = $(this).attr("ows_Amount") || ""
        project = {
          taskOrder,
          titleDate,
          amount
        }
        sitesChart.Amount.push(amount)
        sitesChart.Date.push(titleDate)
        if (project.taskOrder == 1) {
          sitesChart.taskOne.Amount.push(project.amount)
          sitesChart.taskOne.Date.push(project.titleDate)
        } else {
          sitesChart.taskTwo.Amount.push(project.amount)
          sitesChart.taskTwo.Date.push(project.titleDate)
        }
			});
		}
	})
  return ''
}

const getMainList = () => {
	$().SPServices({
		operation: "GetListItems",
		async: false,
    listName: "MergedFile_V1",
		// listName: "MasterFileDraft_V5",
		completefunc: function(listData, Status) {
			$(listData.responseXML).SPFilterNode("z:row").each(function() {        
        let totalCost = $(this).attr("ows_TOTAL_x0020_COST_x0020_CALC")
        let gdotNtp = $(this).attr("ows_GDOT_x0020_NTP2") || ""
        sitesChart.MainListAmount.push(totalCost)
        sitesChart.MainListDate.push(gdotNtp)
			});
		}
	})
  return ''
}

const generateCharts = (taskOrder) => {
  if (taskOrder === 'Task Order 1') {
    chartTaskOne()
  }
  if (taskOrder === 'Task Order 2') {
    chartTaskTwo()
  }
}

const chartTaskOne = () => {

  const toMax = toMaxTaskOne
  let toMaxLine = [];
  let trendLine = [];
  let avgSlope = 0.0;
  let avgInter = 0.0;
  let j = 0;
  let amountCount = 0;

  for(let entry of sitesChart.taskOne.Date) {
    toMaxLine.push(toMax)
  }

  for (j; j < sitesChart.taskOne.Date.length; j++) {
    let slope = 0.0;
    let inter = 0.0;

    if (j <= 0 || sitesChart.taskOne.Amount[j] == "NaN") {
      continue;
    } else {
      inter =
        sitesChart.taskOne.Amount[j - 1] -
        (sitesChart.taskOne.Amount[j] - sitesChart.taskOne.Amount[j - 1]) * j;
      slope = -(sitesChart.taskOne.Amount[j - 1] - sitesChart.taskOne.Amount[j]);
    }
    amountCount++;
    avgInter += parseFloat(inter);
    avgSlope += parseFloat(slope);
  }

  avgSlope = avgSlope / amountCount;
  avgInter = avgInter / amountCount;

  for (let i = 0; i < sitesChart.taskOne.Date.length; i++) {
    trendLine.push(avgSlope * (i + 1) + avgInter - 200000);
  }
  // check trendline

  let count = 0;
  for (let entry of sitesChart.taskOne.Amount) {
    if (sitesChart.taskOne.Amount[count] != "NaN") {
      count++;
    }
  }

  var chart1Data = {
    labels: sitesChart.taskOne.Date,
    datasets: [
      {
        label: "Budget Limit",
        fill: false,
        borderDash: [6, 3],
        backgroundColor: "#ff0000",
        borderColor: "#ff0000",
        // backgroundColor: 'magenta',
        // borderColor: "magenta",
        data: toMaxLine
      },
      {
        label: "Trend Line",
        fill: false,
        borderDash: [2, 2],
        backgroundColor: sitesChart.Colors[3],
        borderColor: sitesChart.Colors[3],
        // backgroundColor: 'teal',
        // borderColor: 'teal',
        data: trendLine
      },
      {
        label: "Amounts",
        fill: true,
        backgroundColor: sitesChart.Colors[0],
        borderColor: sitesChart.Colors[0],
        // backgroundColor: 'goldenrod',
        // borderColor: 'goldenrod',
        data: sitesChart.taskOne.Amount
      }
    ]
  };

  //************Chart options***************
  var chart1Options = {
    responsive: true,
    maintainAspectRatio: true,
    title: {
      display: true,
      text: ""
    },
    tooltips: {
      callbacks: {
        label: function(tooltipItem, data) {
          return (
            ": $" +
            Number(
              chart1Data.datasets[2].data[tooltipItem.index]
            ).toLocaleString()
          );
        }
      }
    },
    scales: {
      xAxes: [
        {
          ticks: {
            callback: function(value, index, values) {
              return sitesChart.taskOne.Date[index];
            }
          }
        }
      ],
      yAxes: [
        {
          ticks: {
            stepSize: 500000,
            beginAtZero: true,
            max: toMaxLine[0] + 500000,
            callback: function(value, index, values) {
              return "$" + Number(value).toLocaleString();
            }
          }
        }
      ]
    },
    legend: {
      display: false
    }
  };

  //chart
  var chart1 = $("#chartCanvas-1")
    .get(0)
    .getContext("2d");

  new Chart(chart1, {
    type: "line",
    data: chart1Data,
    options: chart1Options
  });
  return chart1
}

const chartTaskTwo = () => {

  const toMax = toMaxTaskTwo;
  let toMaxLine = [];
  let trendLine = [];
  let avgSlope = 0.0;
  let avgInter = 0.0;
  let j = 0;
  let amountCount = 0;


  for(let entry of sitesChart.taskTwo.Date) {
    toMaxLine.push(toMax)
  }


  for (j; j < sitesChart.taskTwo.Date.length; j++) {
    let slope = 0.0;
    let inter = 0.0;

    if (j <= 0 || sitesChart.taskTwo.Amount[j] == "NaN") {
      continue;
    } else {
      inter =
        sitesChart.taskTwo.Amount[j - 1] -
        (sitesChart.taskTwo.Amount[j] - sitesChart.taskTwo.Amount[j - 1]) * j;
      slope = -(sitesChart.taskTwo.Amount[j - 1] - sitesChart.taskTwo.Amount[j]);
    }
    amountCount++;
    avgInter += parseFloat(inter);
    avgSlope += parseFloat(slope);
  }


  avgSlope = avgSlope / amountCount;
  avgInter = avgInter / amountCount;

  for (let i = 0; i < sitesChart.taskTwo.Date.length; i++) {
    trendLine.push(avgSlope * (i + 1) + avgInter + toMax - 400000);
  }

  let amountLen = sitesChart.taskTwo.Amount.length
  let trendlineLen = trendLine.length
  trendline = trendLine.slice(0, trendlineLen-1)
  sitesChart.taskTwo.Amount = sitesChart.taskTwo.Amount.slice(0, amountLen-1)

  trendLine.push(2023600)
  sitesChart.taskTwo.Amount.push(0)
  let count = 0;
  for (let entry of sitesChart.taskTwo.Amount) {
    if (sitesChart.taskTwo.Amount[count] != "NaN") {
      count++;
    }
  }

  var chart2Data = {
    labels: sitesChart.taskTwo.Date,
    datasets: [
      {
        label: "Budget Limit",
        fill: false,
        borderDash: [6, 3],
        backgroundColor: "#ff0000",
        borderColor: "#ff0000",
        data: toMaxLine
      },
      {
        label: "Trend Line",
        fill: false,
        borderDash: [2, 2],
        backgroundColor: sitesChart.Colors[3],
        borderColor: sitesChart.Colors[3],
        data: trendLine
      },
      {
        label: "Amounts",
        fill: true,
        backgroundColor: sitesChart.Colors[0],
        borderColor: sitesChart.Colors[0],
        data: sitesChart.taskTwo.Amount
      }
    ]
  };

  //************Chart options***************
  var chart2Options = {
    responsive: true,
    maintainAspectRatio: true,
    title: {
      display: true,
      text: ""
    },
    tooltips: {
      callbacks: {
        label: function(tooltipItem, data) {
          // check if data accessible
          return (
            ": $" +
            Number(
              chart2Data.datasets[2].data[tooltipItem.index]
            ).toLocaleString()
          );
        }
      }
    },
    scales: {
      xAxes: [
        {
          ticks: {
            callback: function(value, index, values) {
              return sitesChart.taskTwo.Date[index];
            }
          }
        }
      ],
      yAxes: [
        {
          ticks: {
            stepSize: 500000,
            beginAtZero: true,
            max: 2500000,
            callback: function(value, index, values) {
              return "$" + Number(value).toLocaleString();
            }
          }
        }
      ]
    },
    legend: {
      display: false
    }
  };

  //chart
  var chart2 = $("#chartCanvas-2")
    .get(0)
    .getContext("2d");

  new Chart(chart2, {
    type: "line",
    data: chart2Data,
    options: chart2Options
  });
  return chart2
}

sitesChart.CustomFooter = function(ctx) {
  return "";
};

const clearCanvas = () => {
    $("#chart-panel").empty()
    $("#chartCanvas-1").empty()
    $("#chartCanvas-2").empty()
}

const addChartCanvas = (taskOrder='All Task Orders') => {
  let chart1 = `
  <div class="row">
    <div class="panel-body"> 
      <div class="row"> 
        <div class="col-sm-12"> 
          <canvas id="chartCanvas-1" style="align:center"></canvas> 
        </div> 
      </div> 
    </div> 
  </div>
  `
  let chart2 = `
  <div class="row">
    <div class="panel-body"> 
      <div class="row"> 
        <div class="col-sm-12"> 
          <canvas id="chartCanvas-2" style="align:center"></canvas> 
        </div> 
      </div> 
    </div> 
  </div>
  `
  if (taskOrder === 'Task Order 2') {
    $("#chart-panel").append(chart2)
  } else {
    $("#chart-panel").append(chart1)
  }
}

$(document).ready(sitesChart.FieldRenderSetup()); // JavaScript source code
$(document).ready(() => {
  addChartCanvas('Task Order 1')
  getBurnRateList()
  getMainList()
  generateCharts('Task Order 1')
  $("#task-order-1").click(() => {
    document.getElementById('task-order-1').toggleAttribute('checked')
    clearCanvas()
    if(document.getElementById('task-order-1').checked) {
        addChartCanvas('Task Order 1')
        generateCharts('Task Order 1')
    } else {
        addChartCanvas('Task Order 2')
        generateCharts('Task Order 2')
    }
  })
  $("#task-order-2").click(() => {
    debugger
  document.getElementById('task-order-2').toggleAttribute('checked')
  debugger
  clearCanvas()
  if(document.getElementById('task-order-1').checked) {
      addChartCanvas('Task Order 1')
      generateCharts('Task Order 1')
  } else {
      addChartCanvas('Task Order 2')
      generateCharts('Task Order 2')
  }
})

})
