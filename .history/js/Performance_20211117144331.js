// Place the following line of code in Edit Web Part --> Miscellaneous --> JS Link to link the code/custom css/external libraries to the page:
// ~site/SiteAssets/js/jquery.js|~site/SiteAssets/js/Chart.bundle.js|~site/SiteAssets/js/PerformanceUseList.js

// add condition:
// if complexity === 'BRIDGE' && projectType === 'new forecast/update/bridge':
// then projectType = 'bridge' && complexity = 'SIMPLE'
var sitesChart = sitesChart || {};

let currentYear = new Date().getFullYear();
let yearMinusOne = parseInt(currentYear) - 1
let yearMinusTwo = parseInt(currentYear) - 2
let yearMinusThree = parseInt(currentYear) - 3
let yearMinusFour = parseInt(currentYear) - 4

let canvasChart1
let canvasChart2
let canvasChart3
let canvasChart4
let canvasChart5
let canvasChart6

let bar1Data
let bar2Data
let bar3Data
let bar4Data
let bar5Data
let bar6Data

let allChartDatasets = {
  bar1Data: [], bar2Data: [], bar3Data: [], bar4Data: [], bar5Data: [], bar6Data: []
}

let listTable

colors = {
  GS: '#007940',
  HNTB: "#f46521",
  GDOT: "#223d76"

};
sitesChart.AssignedTo = [];
sitesChart.allProjects = []
sitesChart.Projects = {
    allApproved: {
      HNTB: [],
      GS: []
    },
    forecast: {
      HNTB: [],
      GS: []
    },
    review: {
      HNTB: [],
      GS: []
    },
    update: {
      HNTB: [],
      GS: []
    },
    bridge: {
      HNTB: [],
      GS: []
    },
    maintenance: {
      HNTB: [],
      GS: []
    },
    other: {
      HNTB: [],
      GS: []
    },
}

// Override the rendering.
sitesChart.FieldRenderSetup = function() {
  var override = {};
  override.Templates = {};
  override.Templates.Header = sitesChart.CustomHeader;
  override.Templates.Item = sitesChart.CustomItem;
  override.Templates.Footer = sitesChart.CustomFooter;

  SPClientTemplates.TemplateManager.RegisterTemplateOverrides(override);
};

// Get the data from the listz
sitesChart.CustomItem = function(ctx) {
  return "";
};

let inputFrom = ""
let inputTo = ""

// Override the Header
sitesChart.CustomHeader = function(ctx) {
  return (`<div class="bootstrap-iso"> 
              <div class="container"> 
                  <div class="panel panel panel-default"> 
                  <div class="panel-heading"> 
                    <h1 align="center">Performance Report</h1> 
                  </div>

                  <div class="panel-heading">
                    <div class="form-group" id="yearSelection">
                      <div class="row">
                      <div class="col-sm-4"></div>
                      <div class="col-sm-4">
                      <div class="row"> 
                          <h3 align="center">Filter Projects by Year</h3><br>
                              <select class="form-control" id="byYear">
                                <option>${currentYear}</option>
                                <option>${yearMinusOne}</option>
                                <option>${yearMinusTwo}</option>
                                <option>${yearMinusThree}</option>
                                <option>${yearMinusFour}</option>
                              </select>
                          </div><br>
                          <div class="row"> 
                          <div class="col-sm-4"></div> 
                          <div class="col-sm-4"><button type="button" id="yearSelectButton" class="btn btn-default" style="font-size:18px">Submit</button></div> 
                          <div class="col-sm-4"></div> 
                        </div> 
                      </div>
                      <div class="col-sm-4"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="panel-heading" > 
                       <div class="form-group"> 
                       <h3 align="center">Filter Projects by Custom Dates</h3><br>
                       <br> 
                       <div class="row">
                       <div class="col-sm-6">
                            <div class="row"> 
                              <label class="col-sm-6 control-label" style="font-size:18px;color:gray;">&nbsp; From:</label> 
                              <div class="col-sm-6"><input type="date" class="form-control form-control-lg" id="fromDate" placeholder="Enter date here..."></div> 
                          </div> 
                          <div class="row"> 
                              <label class="col-sm-6 control-label" style="font-size:18px;color:gray;">&nbsp; To:</label> 
                              <div class="col-sm-6"> <input type="date" class="form-control form-control-lg" id="toDate" placeholder="Enter date here..."></div> 
                          </div>
                       </div>
                        <div class="col-sm-6">
                          <div class="row"> 
                              <label class="col-sm-6 control-label" style="font-size:18px;color:gray;">&nbsp; Complexity:</label>
                              <div class="col-sm-6">
                              <select class="form-control" id="complexity">
                                <option>All (default)</option>
                                <option>Simple</option>
                                <option>Medium</option>
                                <option>Complex</option>
                                <option>Bridge</option>
                              </select> 
                              </div>
                          </div> 
                          <div class="row"> 
                              <label class="col-sm-6 control-label" style="font-size:18px;color:gray;">&nbsp; Project Type:</label> 
                              <div class="col-sm-6">
                              <select class="form-control" id="projectType">
                                <option>All (default)</option>
                                <option>Maintenance</option>
                                <option>New Forecast/Update/Bridge</option>
                                <option>Review</option>
                              </select> 
                              </div>
                              
                          </div>
                       </div>
                       </div>
                          
                      </div><br>
                        <div class="row"> 
                          <div class="col-sm-5"></div> 
                          <div class="col-sm-2"><button type="button" class="btn btn-default" style="font-size:18px">Submit</button></div> 
                          <div class="col-sm-5"></div> 
                        </div> 
                  </div> 
                      <div class="panel-body"></div> 
                  </div> 
              </div> 
          </div>
        `)
};

// INITIAL CUSTOM FOOTER - OPTIONAL
sitesChart.CustomFooter = function() {
  return "";
};

function getElementPosition(obj) {
  var curleft = 0, curtop = 0;
  if (obj.offsetParent) {
      do {
          curleft += obj.offsetLeft;
          curtop += obj.offsetTop;
      } while (obj = obj.offsetParent);
      return { x: curleft, y: curtop };
  }
  return undefined;
}

function getEventLocation(element,event){
  var pos = getElementPosition(element);
  
  return {
    x: (event.pageX - pos.x),
      y: (event.pageY - pos.y)
  };
}

let bar1Options = {
  onClick: e => {
    let barId = canvasChart1.getDatasetAtEvent(e)[0]._model.datasetLabel
    let chartId = e.currentTarget.id
    let rowId = 'row1'
    let chartBarRowId = { chartId, barId, rowId }
    clearProjectListsFromCanvas()
    addProjectListToCanvas(chartBarRowId)
},

    legend: {
      display: true
    },
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "No. of Avg. Business Days",
            fontSize: 14
          },
          ticks: {
            min: 0
          }
        }
      ],
      xAxes: [
        {
          scaleLabel: {
            display: true,
          }
        }
      ]
    }
  };

let bar2Options = {
  onClick: e => {
    let barId = canvasChart2.getDatasetAtEvent(e)[0]._model.datasetLabel
    let chartId = e.currentTarget.id
    let rowId = 'row1'
    let chartBarRowId = { chartId, barId, rowId }
    clearProjectListsFromCanvas()
    addProjectListToCanvas(chartBarRowId)
  },

    legend: {
      display: true
    },
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "No. of Projects"
          },
          ticks: {
            min: 0
          },
          stacked: true
        }
      ],
      xAxes: [
        {
          scaleLabel: {
            display: true,
          },
          stacked: true
        }
      ]
    }
  };

let bar3Options = {
  onClick: e => {
    let barId = canvasChart3.getDatasetAtEvent(e)[0]._model.datasetLabel
    let chartId = e.currentTarget.id
    let rowId = 'row2'
    let chartBarRowId = { chartId, barId, rowId }
    clearProjectListsFromCanvas()
    addProjectListToCanvas(chartBarRowId)
  },
  legend: {
    display: true
  },
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    yAxes: [
      {
        scaleLabel: {
          display: true,
          labelString: "No. of Avg. Business Days"
        },
        ticks: {
          min: 0
        }
      }
    ],
    xAxes: [
      {
        scaleLabel: {
          display: true,
        }
      }
    ]
  }
};

let bar4Options = {
  onClick: e => {
    let barId = canvasChart4.getDatasetAtEvent(e)[0]._model.datasetLabel
    let chartId = e.currentTarget.id
    let rowId = 'row2'
    let chartBarRowId = { chartId, barId, rowId }
    clearProjectListsFromCanvas()
    addProjectListToCanvas(chartBarRowId)
  },
    legend: {
      display: true
    },
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "No. of Projects"
          },
          ticks: {
            min: 0
          },
          stacked: true
        }
      ],
      xAxes: [
        {
          scaleLabel: {
            display: true,
          },
          stacked: true
        }
      ]
    }
};

let bar5Options = {
  onClick: e => {
    let barId = canvasChart5.getDatasetAtEvent(e)[0]._model.datasetLabel
    let chartId = e.currentTarget.id
    let rowId = 'row3'
    let chartBarRowId = { chartId, barId, rowId }
    clearProjectListsFromCanvas()
    addProjectListToCanvas(chartBarRowId)
},

    legend: {
      display: true
    },
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "No. of Avg. Business Days",
            fontSize: 14
          },
          ticks: {
            min: 0
          }
        }
      ],
      xAxes: [
        {
          scaleLabel: {
            display: true,
          }
        }
      ]
    }
  };

  let bar6Options = {
    onClick: e => {
      let barId = canvasChart6.getDatasetAtEvent(e)[0]._model.datasetLabel
      let chartId = e.currentTarget.id
      let rowId = 'row3'
      let chartBarRowId = { chartId, barId, rowId }
      clearProjectListsFromCanvas()
      addProjectListToCanvas(chartBarRowId)    
    },
  
      legend: {
        display: true
      },
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "No. of Projects"
            },
            ticks: {
              min: 0
            },
            stacked: true
          }
        ],
        xAxes: [
          {
            scaleLabel: {
              display: true,
            },
            stacked: true
          }
        ]
      }
    };
  
// "NEW FORECAST"+"UPDATE" TOTAL DURATION - LOST TIME / NUM OF PROJECTS
const setBar1Data = (data) => {

  allChartDatasets.bar1Data = data

  let totalHNTB = data.HNTB.filter(e => !isNaN(e.totalDurMinusLost)).map(p => p.totalDurMinusLost).reduce((a,b) => a + b, 0)
  let totalGS = data.GS.filter(e => !isNaN(e.totalDurMinusLost)).map(p => p.totalDurMinusLost).reduce((a,b) => a + b, 0)
  let countHNTB = data.HNTB.length
  let countGS = data.GS.length
  let averageHNTB = totalHNTB == 0 || countHNTB == 0 ? 0 : Math.round(totalHNTB/countHNTB)
  let averageGS = totalGS == 0 || countGS == 0 ? 0 : Math.round(totalGS/countGS)

    barData = {
        labels: ["New Forecast/Update/Bridge"],
        datasets: [
          {
            label: "GS",
            backgroundColor: [colors.GS, colors.GS],
            data: [averageGS]
          },
          {
            label: "HNTB",
            backgroundColor: [colors.HNTB, colors.HNTB],
            data: [averageHNTB] // hntbDays
          },
        ]
      };
      return barData
}

// "REVIEW" TOTAL DURATION - LOST TIME / NUM OF PROJECTS
const setBar3Data = (data) => {

  allChartDatasets.bar3Data = data

  let totalRevTimeHNTB = data.HNTB.filter(e => !isNaN(e.totalRevTime)).map(p => p.totalRevTime).reduce((a,b) => a + b, 0)
  let totalRevCountHNTB = data.HNTB.filter(e => !isNaN(e.totalReviewCount)).map(p => p.totalReviewCount).reduce((a,b) => a + b, 0)
  let averageRevTimeHNTB = Math.round(totalRevTimeHNTB/totalRevCountHNTB)

  let totalRevTimeGS = data.GS.filter(e => !isNaN(e.totalRevTime)).filter(p => p.totalRevTime < 300).map(p => p.totalRevTime).reduce((a,b) => a + b, 0)
  let totalRevCountGS = data.GS.filter(e => !isNaN(e.totalReviewCount)).map(p => p.totalReviewCount).reduce((a,b) => a + b, 0)
  let averageRevTimeGS = Math.round(totalRevTimeGS/totalRevCountGS)

    barData = {
        labels: ["Review"],
        datasets: [
          {
            label: "GS",
            backgroundColor: [colors.GS, colors.GS],
            data: [averageRevTimeGS]
          },
          {
            label: "HNTB",
            backgroundColor: [colors.HNTB, colors.HNTB],
            data: [averageRevTimeHNTB]
          },
        ]
      };
    return barData
}

// "NEW FORECAST"/"UPDATE" NUM OF REVIEWS
const setBar2Data = (data) => {

  allChartDatasets.bar2Data = data

    barData =  {
        labels: ["New Forecast/Update/Bridge"],
        datasets: [
          {
            label: "GS",
            backgroundColor: [colors.GS],
            data: [data.GS.length] 
          },
          {
            label: "HNTB",
            backgroundColor: [colors.HNTB],
            data: [data.HNTB.length] 
          },
        ]
      };
      return barData
}

// "REVIEW" NUM OF REVIEWS
const setBar4Data = (data) => {
  allChartDatasets.bar4Data = data

    barData = {
        labels: ["Review"],
        datasets: [
          {
            label: "GS",
            backgroundColor: [colors.GS],
            data: [data.GS.length] 
          },
          {
            label: "HNTB",
            backgroundColor: [colors.HNTB],
            data: [data.HNTB.length] 
          },
        ]
      };
      return barData
}

// average "MAINTENANCE" review time
const setBar5Data = (data) => {

  allChartDatasets.bar5Data = data

  let totalHNTB = data.HNTB.filter(e => !isNaN(e.totalDurMinusLost)).map(p => p.totalDurMinusLost).reduce((a,b) => a + b, 0)
  let totalGS = data.GS.filter(e => !isNaN(e.totalDurMinusLost)).map(p => p.totalDurMinusLost).reduce((a,b) => a + b, 0)
  let countHNTB = data.HNTB.length
  let countGS = data.GS.length
  let averageHNTB = totalHNTB == 0 || countHNTB == 0 ? 0 : Math.round(totalHNTB/countHNTB)
  let averageGS = totalGS == 0 || countGS == 0 ? 0 : Math.round(totalGS/countGS)

    barData = {
        labels: ["Maintenance"],
        datasets: [
          {
            label: "GS",
            backgroundColor: [colors.GS],
            data: [averageGS] 
          },
          {
            label: "HNTB",
            backgroundColor: [colors.HNTB],
            data: [averageHNTB] 
          },
        ]
      };
      return barData
}

// "MAINTENANCE" total
const setBar6Data = (data) => {

  allChartDatasets.bar6Data = data

    barData = {
        labels: ["Maintenance"],
        datasets: [
          {
            label: "GS",
            backgroundColor: [colors.GS],
            data: [data.GS.length] 
          },
          {
            label: "HNTB",
            backgroundColor: [colors.HNTB],
            data: [data.HNTB.length] 
          },
        ]
      };
      return barData
}

function ExcelDateToJSDate(serial) {
  let utc_days  = Math.floor(serial - 25568);
  let utc_value = utc_days * 86400;                                        
  let date_info = new Date(utc_value * 1000).toLocaleString()

  if (date_info[1] == '/') {
    date_info = `0${date_info}`
    if (date_info[4] == '/') {

      date_info = `${date_info.slice(0,3)}0${date_info.slice(3)}`

    }
  } else {
    if (date_info[4] == '/') {

      date_info = `${date_info.slice(0,3)}0${date_info.slice(3)}`

    }
  }
  return date_info.slice(0,10)
}

let projects = []

function getAllListItems() {
	$().SPServices({
		operation: "GetListItems",
		async: false,
    listName: "MergedFile_V1",
		completefunc: function(listData, Status) {
			$(listData.responseXML).SPFilterNode("z:row").each(function() {
                let project
                let complexity = $(this).attr("ows_COMPLEXITY") || ""
                let gdotNtp = $(this).attr("ows_GDOT_x0020_NTP") || ""
                let pmRequest = $(this).attr("ows_PM_x0020_REQUEST") || ""
                let hntbInformed = $(this).attr("ows_HNTB_x0020_INFORMED") || ""                
                let totalRevTime = $(this).attr("ows_TOTAL_x0020_REVIEW_x0020_TIME0") || ""
                let status = $(this).attr("ows_CURRENT_x0020_STATUS") || ""
                let durMinusLostTime = $(this).attr("ows_TOTAL_x0020_WORKING_x0020_DAYS_x2") || 0
                let taskId = $(this).attr("ows_Title") || ""
                let existingRev = $(this).attr("ows_EXISTING_x0020_REVIEW_x002f__x00") || ""
                let finalRev = $(this).attr("ows_FINAL_x0020_REVIEW_x002f__x0020_") || ""
                let existingReviewDates = $(this).attr("ows_EXISTING_x0020_REVIEW_x002f__x00") || []
                let finalReviewDates = $(this).attr("ows_FINAL_x0020_REVIEW_x002f__x0020_") || []
                let itemId = $(this).attr("ows_ID")
                let existingSub = $(this).attr('ows_EXISTING_x0020_SUBMITTAL') || ""
                let finalSub = $(this).attr('ows_FINAL_x0020_SUBMITTAL') || ""
                let finalRevApp = $(this).attr("ows_FINAL_x0020_REVIEW_x002f__x0020_") || ""
                let countMapSubm = $(this).attr('ows_COUNT_x0020_MAP_x0020_SUBMITTAL') || ""
                let countMapRevApp =  $(this).attr('ows_COUNT_x0020_MAP_x0020_REVIEW_x00') || ""
                let countMapSent =  $(this).attr('ows_COUNT_x0020_MAP_x0020_SENT_x0020') || ""
                let countsReceived = $(this).attr('ows_COUNTS_x0020_RECEIVED_x0020_FROM') || ""
                let piNum = $(this).attr('ows_P_x002e_I_x002e__x0020__x0020_NO') || "" 

                let allReviews = []

                if (existingReviewDates !== "01/00/00") {
                  allReviews.push(existingReviewDates)
                } 
                if (finalReviewDates !== "01/00/00") {
                  allReviews.push(finalReviewDates)
                }

                let totalReviewCount = Math.round(allReviews.join().length/8)
                totalRevTime = Math.round(totalRevTime.slice(7))
                let projectType = $(this).attr("ows_TYPE_x0020_OF_x0020_PROJECT")
                let ntpDate = gdotNtp.length > 8 ? Date.parse(gdotNtp.slice(0, 8)) : Date.parse(gdotNtp)
                let pmReqDate = pmRequest.length > 8 ? Date.parse(pmRequest.slice(0, 8)) : Date.parse(pmRequest)
                let hntbInformedDate = hntbInformed.length > 8 ? Date.parse(hntbInformed.slice(0, 8)) : Date.parse(hntbInformed)
                let finalDate = finalRevApp.length > 8 ? Date.parse(finalRevApp.slice(finalRevApp.length - 8)) : Date.parse(finalRevApp)
                let totalDurMinusLost = Math.round(durMinusLostTime.slice(7))
                project = {
                    itemId: itemId,
                    taskId: taskId,
                    piNum: piNum,
                    status: status,
                    complexity: complexity.toUpperCase(),
                    gdotNtp: gdotNtp,
                    pmRequest: pmRequest,
                    hntbInformed: hntbInformed,
                    ntpDate: ntpDate,
                    pmReqDate: pmReqDate,
                    hntbInformedDate: hntbInformedDate,
                    finalRevApp: finalRevApp,
                    finalDate: finalDate,
                    projectType: projectType,
                    totalRevTime: totalRevTime,
                    totalDurMinusLost: totalDurMinusLost,
                    finalRev: finalRev,
                    allReviews: allReviews,
                    totalReviewCount: totalReviewCount,
                    existingSub: existingSub,
                    finalSub: finalSub,
                    existingRev: existingRev,
                    countMapSubm: countMapSubm,
                    countMapRevApp: countMapRevApp,
                    countMapSent: countMapSent,
                    countsReceived: countsReceived
                }
                if (project.taskId) sitesChart.allProjects.push(project)                
                if (project.status === "Approved") {
                  if (project.taskId.includes("1451.")) {
                    sitesChart.Projects.allApproved.HNTB.push(project)
                  }
                  if (project.taskId.includes("1453.")) {
                    sitesChart.Projects.allApproved.GS.push(project)
                  }
                }
                sitesChart.Projects.review.HNTB = sitesChart.Projects.allApproved.HNTB.filter(p => p.projectType === "REVIEW")
                sitesChart.Projects.review.GS = sitesChart.Projects.allApproved.GS.filter(p => p.projectType === "REVIEW")
                sitesChart.Projects.update.HNTB = sitesChart.Projects.allApproved.HNTB.filter(p => p.projectType === "UPDATE")
                sitesChart.Projects.update.GS = sitesChart.Projects.allApproved.GS.filter(p => p.projectType === "UPDATE")
                sitesChart.Projects.forecast.HNTB = sitesChart.Projects.allApproved.HNTB.filter(p => p.projectType === "NEW FORECAST")
                sitesChart.Projects.forecast.HNTB = sitesChart.Projects.allApproved.HNTB.filter(p => p.projectType === "NEW FORECAST")
                sitesChart.Projects.maintenance.HNTB = sitesChart.Projects.allApproved.HNTB.filter(p => p.projectType === "MAINTENANCE")
                sitesChart.Projects.maintenance.GS = sitesChart.Projects.allApproved.GS.filter(p => p.projectType === "MAINTENANCE")
                sitesChart.Projects.bridge.HNTB = sitesChart.Projects.allApproved.HNTB.filter(p => p.projectType.includes("BRIDGE"))
                sitesChart.Projects.bridge.GS = sitesChart.Projects.allApproved.GS.filter(p => p.projectType.includes("BRIDGE"))
                sitesChart.Projects.other.HNTB = sitesChart.Projects.allApproved.HNTB.filter(p => p.projectType !== "REVIEW").filter(p => p.projectType === "UPDATE").filter(p => p.projectType === "NEW FORECAST")
                sitesChart.Projects.other.GS = sitesChart.Projects.allApproved.GS.filter(p => p.projectType !== "REVIEW").filter(p => p.projectType === "UPDATE").filter(p => p.projectType === "NEW FORECAST")
			});
		}
	})

  let validDate = /^(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d$/

  const fields = {
    countMapSubm: 'COUNT_x0020_MAP_x0020_SUBMITTAL',
    countMapRevApp: 'COUNT_x0020_MAP_x0020_REVIEW_x00',
    countMapSent: 'COUNT_x0020_MAP_x0020_SENT_x0020',
    countsReceived: 'COUNTS_x0020_RECEIVED_x0020_FROM',
    existingSub: 'EXISTING_x0020_SUBMITTAL',
    finalSub: 'FINAL_x0020_SUBMITTAL',
    finalRevApp: 'FINAL_x0020_REVIEW_x002f__x0020_',
    existingRev: 'EXISTING_x0020_REVIEW_x002f__x00',
    pmRequest: 'PM_x0020_REQUEST',
    gdotNtp: 'GDOT_x0020_NTP',
    existingSub: 'EXISTING_x0020_SUBMITTAL',
    finalRevApp: 'FINAL_x0020_REVIEW_x002f__x0020_'
  }

//   used to fix wanky format
  // existingRevFixDate.map(p => {
  //   let fixed = `${p.existingRev.slice(0,6)}${p.existingRev.slice(8)}`
  //   updateItem1(p.itemId, fields.existingRev, fixed)
  // })
  return projects  
}

const fixDateFormat = date => {
  if (date[4] == '/') {
    date = `${date.slice(0,3)}0${date.slice(3)}`
    date = date.slice(0, 10)
  }
}

let filteredProjects = []

const filterItems = async (from, to, complexity, type) => {
    let reviewsHNTB = await sitesChart.Projects.review.HNTB.filter(r => {
        if (typeof r.ntpDate === "number" && typeof r.finalDate === "number") {
            if (r.ntpDate >= from && r.finalDate <= to) {
                return r
            }
        }
    })
    let updatesHNTB = await sitesChart.Projects.update.HNTB.filter(r => {
        if (typeof r.ntpDate === "number" && typeof r.finalDate === "number") {
            if (r.ntpDate >= from && r.finalDate <= to) {
                return r
            }
        }
    })
    let forecastsHNTB = await sitesChart.Projects.forecast.HNTB.filter(r => {
        if (typeof r.ntpDate === "number" && typeof r.finalDate === "number") {
            if (r.ntpDate >= from && r.finalDate <= to) {
                return r
            }
        }
    })
    let bridgesHNTB = await sitesChart.Projects.bridge.HNTB.filter(r => {
      if (typeof r.ntpDate === "number" && typeof r.finalDate === "number") {
          if (r.ntpDate >= from && r.finalDate <= to) {
              return r
          }
      }
  })
  let maintHNTB = await sitesChart.Projects.maintenance.HNTB.filter(r => {
    if (typeof r.ntpDate === "number" && typeof r.finalDate === "number") {
        if (r.ntpDate >= from && r.finalDate <= to) {
            return r
        }
    }
  })
    let reviewsGS = await sitesChart.Projects.review.GS.filter(r => {

      
      if (typeof r.ntpDate === "number" && typeof r.finalDate === "number") {
          if (r.ntpDate >= from && r.finalDate <= to) {
              return r
          }
      }
  })
  let updatesGS = await sitesChart.Projects.update.GS.filter(r => {
    
      if (typeof r.ntpDate === "number" && typeof r.finalDate === "number") {
          if (r.ntpDate >= from && r.finalDate <= to) {
              return r
          }
      }
  })
  let forecastsGS = await sitesChart.Projects.forecast.GS.filter(r => {
    
      if (typeof r.ntpDate === "number" && typeof r.finalDate === "number") {
          if (r.ntpDate >= from && r.finalDate <= to) {
              return r
          }
      }
  })
  let bridgesGS = await sitesChart.Projects.bridge.GS.filter(r => {
    
    if (typeof r.ntpDate === "number" && typeof r.finalDate === "number") {
        if (r.ntpDate >= from && r.finalDate <= to) {
            return r
        }
    }
})
let maintGS = await sitesChart.Projects.maintenance.GS.filter(r => {
  
  if (typeof r.ntpDate === "number" && typeof r.finalDate === "number") {
      if (r.ntpDate >= from && r.finalDate <= to) {
          return r
      }
  }
})

  let updatesForecastsBridgesHNTB = updatesHNTB.concat(forecastsHNTB).concat(bridgesHNTB)
  let updatesForecastsBridgesGS = updatesGS.concat(forecastsGS).concat(bridgesGS)

  let reviews = { HNTB: reviewsHNTB, GS: reviewsGS}
  let updatesForecastsBridges = { HNTB: updatesForecastsBridgesHNTB, GS: updatesForecastsBridgesGS }
  let maintenance = { HNTB: maintHNTB, GS: maintGS }
    
  // WITH THE COMPLEXITY FILTER
  updateCharts(reviews, updatesForecastsBridges, maintenance, type, complexity)
    
}

const updateCharts = (reviews, updatesForecastsBridges, maintenance, type, complexity) => {

  // allChartDatasets should be empty here, if not, reset
  allChartDatasets = {
    bar1Data: [], bar2Data: [], bar3Data: [], bar4Data: [], bar5Data: [], bar6Data: []
  }

  let chart1
  let chart2
  let chart3
  let chart4
  let chart5
  let chart6

  const chartsToRemove = []
  // add BRIDGE as a complexity
    if (type === "Review") {
        // if complexity == "All (default) just use the reviews without filtering"
        let reviewsByCompexityHNTB = complexity === "All (default)" ? reviews.HNTB : reviews.HNTB.filter(r => r.complexity.includes(complexity.toUpperCase()))
        let reviewsByCompexityGS = complexity === "All (default)" ? reviews.GS : reviews.GS.filter(r => r.complexity.includes(complexity.toUpperCase()))
        let reviewsByCompexity = { HNTB: reviewsByCompexityHNTB, GS: reviewsByCompexityGS }

        chartsToRemove.push('#barChart1', '#chart1', '#barChart2', '#chart2')
        chartsToRemove.push('#barChart5', '#chart5', '#barChart6', '#chart6')

        if (reviewsByCompexity.HNTB.length > 0 || reviewsByCompexity.GS.length > 0) {
          debugger
          
            bar3Data = setBar3Data(reviewsByCompexity)
            bar4Data = setBar4Data(reviewsByCompexity)
            
            chart3 = $("#barChart3").get(0).getContext("2d");
            chart4 = $("#barChart4").get(0).getContext("2d");
    
            canvasChart3 = new Chart(chart3, {
                type: "bar",
                data: bar3Data,
                options: bar3Options
              });
            
              canvasChart4 = new Chart(chart4, {
                type: "bar",
                data: bar4Data,
                options: bar4Options
            });
        } else {
          debugger
          chartsToRemove.push('#barChart3', '#chart3', '#barChart4', '#chart4')
        }
    } if (type === "Maintenance") {
      // if complexity == "All (default) just use the reviews without filtering"
      let maintByCompexityHNTB = complexity === "All (default)" ? maintenance.HNTB : maintenance.HNTB.filter(r => r.complexity.includes(complexity.toUpperCase()))
      let maintByCompexityGS = complexity === "All (default)" ? maintenance.GS : maintenance.GS.filter(r => r.complexity.includes(complexity.toUpperCase()))
      let maintByCompexity = { HNTB: maintByCompexityHNTB, GS: maintByCompexityGS }

      chartsToRemove.push('#barChart1', '#chart1', '#barChart2', '#chart2')
      chartsToRemove.push('#barChart3', '#chart3', '#barChart4', '#chart4')

      if (maintByCompexity.HNTB.length > 0 || maintByCompexity.GS.length > 0) {
        
          bar5Data = setBar5Data(maintByCompexity)
          bar6Data = setBar6Data(maintByCompexity)
          
          chart5 = $("#barChart5").get(0).getContext("2d");
          chart6 = $("#barChart6").get(0).getContext("2d");
  
          canvasChart5 = new Chart(chart5, {
              type: "bar",
              data: bar5Data,
              options: bar5Options
            });
          
            canvasChart6 = new Chart(chart6, {
              type: "bar",
              data: bar6Data,
              options: bar6Options
          });
      } else {
        chartsToRemove.push('#barChart5', '#chart5', '#barChart6', '#chart6')
      }
  } if (type === "All (default)") {

        let updatesForecastsBridgesByComplexityHNTB = complexity === "All (default)" ? updatesForecastsBridges.HNTB : updatesForecastsBridges.HNTB.filter(p => p.complexity.includes(complexity.toUpperCase()))
        let updatesForecastsBridgesByComplexityGS = complexity === "All (default)" ? updatesForecastsBridges.GS : updatesForecastsBridges.GS.filter(p => p.complexity.includes(complexity.toUpperCase()))
        let reviewsByCompexityHNTB = complexity === "All (default)" ? reviews.HNTB : reviews.HNTB.filter(r => r.complexity.includes(complexity.toUpperCase()))
        let reviewsByCompexityGS = complexity === "All (default)" ? reviews.GS : reviews.GS.filter(r => r.complexity.includes(complexity.toUpperCase()))
        let maintByCompexityHNTB = complexity === "All (default)" ? maintenance.HNTB : maintenance.HNTB.filter(r => r.complexity.includes(complexity.toUpperCase()))
        let maintByCompexityGS = complexity === "All (default)" ? maintenance.GS : maintenance.GS.filter(r => r.complexity.includes(complexity.toUpperCase()))

        bar1Data = setBar1Data({HNTB: updatesForecastsBridgesByComplexityHNTB, GS: updatesForecastsBridgesByComplexityGS})
        bar2Data = setBar2Data({HNTB: updatesForecastsBridgesByComplexityHNTB, GS: updatesForecastsBridgesByComplexityGS})
        bar3Data = setBar3Data({HNTB: reviewsByCompexityHNTB, GS: reviewsByCompexityGS})
        bar4Data = setBar4Data({HNTB: reviewsByCompexityHNTB, GS: reviewsByCompexityGS})
        bar5Data = setBar5Data({ HNTB: maintByCompexityHNTB, GS: maintByCompexityGS })
        bar6Data = setBar6Data({ HNTB: maintByCompexityHNTB, GS: maintByCompexityGS })

        chart1 = $("#barChart1").get(0).getContext("2d");
        chart2 = $("#barChart2").get(0).getContext("2d");
        chart3 = $("#barChart3").get(0).getContext("2d");
        chart4 = $("#barChart4").get(0).getContext("2d");
        chart5 = $("#barChart5").get(0).getContext("2d");
        chart6 = $("#barChart6").get(0).getContext("2d");

        canvasChart1 = new Chart(chart1, {
            type: "bar",
            data: bar1Data,
            options: bar1Options
            });
        
            canvasChart2 = new Chart(chart2, {
            type: "bar",
            data: bar2Data,
            options: bar2Options
        });
        canvasChart3 = new Chart(chart3, {
            type: "bar",
            data: bar3Data,
            options: bar3Options
          });
        
          canvasChart4 = new Chart(chart4, {
            type: "bar",
            data: bar4Data,
            options: bar4Options
        });
        canvasChart5 = new Chart(chart5, {
          type: "bar",
          data: bar5Data,
          options: bar5Options
        });
      
        canvasChart6 = new Chart(chart6, {
          type: "bar",
          data: bar6Data,
          options: bar6Options
      });

        if (updatesForecastsBridgesByComplexityHNTB.length === 0 && updatesForecastsBridgesByComplexityGS.length === 0) {
          chartsToRemove.push('#barChart1', '#chart1', '#barChart2', '#chart2')
        }
        if (reviewsByCompexityHNTB.length === 0 && reviewsByCompexityGS.length === 0) {
          chartsToRemove.push('#barChart3', '#chart3', '#barChart4', '#chart4')
        }
        if (maintByCompexityHNTB.length === 0 && maintByCompexityGS.length === 0) {
          chartsToRemove.push('#barChart5', '#chart5', '#barChart6', '#chart6')
        }

    } if (type === "New Forecast/Update/Bridge") {
      let updatesForecastsBridgesByComplexityHNTB
      let updatesForecastsBridgesByComplexityGS

      chartsToRemove.push('#barChart3', '#chart3', '#barChart4', '#chart4')
      chartsToRemove.push('#barChart5', '#chart5', '#barChart6', '#chart6')

      if (complexity === 'Bridge') {
        complexity = 'SIMPLE BRIDGE'
        type = 'BRIDGE'
      }
        
        if (complexity === "All (default)") {
          updatesForecastsBridgesByComplexityHNTB = updatesForecastsBridges.HNTB
          updatesForecastsBridgesByComplexityGS = updatesForecastsBridges.GS
        }
        if (complexity === 'SIMPLE BRIDGE') {
          updatesForecastsBridgesByComplexityHNTB = updatesForecastsBridges.HNTB.filter(p => p.complexity.includes('BRIDGE')).concat(updatesForecastsBridges.HNTB.filter(p => p.complexity.includes('SIMPLE')))
          updatesForecastsBridgesByComplexityGS = updatesForecastsBridges.GS.filter(p => p.complexity.includes('BRIDGE')).concat(updatesForecastsBridges.GS.filter(p => p.complexity.includes('SIMPLE')))
        } else {
          updatesForecastsBridgesByComplexityHNTB = updatesForecastsBridges.HNTB.filter(p => p.complexity.includes(complexity.toUpperCase()))
          updatesForecastsBridgesByComplexityGS = updatesForecastsBridges.GS.filter(p => p.complexity.includes(complexity.toUpperCase()))
        }
        
        if (type === "BRIDGE") {
          updatesForecastsBridgesByComplexityHNTB.filter(p => p.projectType.includes('BRIDGE'))
          updatesForecastsBridgesByComplexityGS.filter(p => p.projectType.includes('BRIDGE'))
        }

        if (updatesForecastsBridgesByComplexityHNTB.length > 0 || updatesForecastsBridgesByComplexityGS.length > 0) {
          bar1Data = setBar1Data({ HNTB: updatesForecastsBridgesByComplexityHNTB, GS: updatesForecastsBridgesByComplexityGS })
          bar2Data = setBar2Data({ HNTB: updatesForecastsBridgesByComplexityHNTB, GS: updatesForecastsBridgesByComplexityGS })
        } else {
          chartsToRemove.push('#barChart1', '#chart1', '#barChart2', '#chart2')
        }        
        chart1 = $("#barChart1").get(0).getContext("2d");
        chart2 = $("#barChart2").get(0).getContext("2d");
    
        canvasChart1 = new Chart(chart1, {
        type: "bar",
        data: bar1Data,
        options: bar1Options
        });
    
        canvasChart2 = new Chart(chart2, {
        type: "bar",
        data: bar2Data,
        options: bar2Options
        });
    }
    // check charts to remove and what data is left

    // if all charts need to be removed, add a message saying there is no data to show
    // if (chartsToRemove.length === 12) {
    //   chartsToRemove.map(chart => {
    //     $($(chart), '.panel-body').remove()
    //   })
    //   let message = ` 
    //   <div class="row" id="row1"> 
    //     <h3 style="text-align:center;color:gray;">There are no projects that meet these criteria</h3><br><br>
    //   </div> 
    //   `
    //   $( ".panel-body" ).append(message)
    // } else {
    //   chartsToRemove.map(chart => {
    //     $($(chart), '.panel-body').remove()
    //   })
    // }

    let message = ` 
      <div class="row" id="row1"> 
        <h3 style="text-align:center;color:gray;">There are no projects that meet these criteria</h3><br><br>
      </div> 
      `
    chartsToRemove.map(chart => {
      $($(chart), '.panel-body').remove()
    })

    if (chartsToRemove.length === 12) {
      $( ".panel-body" ).append(message)
    }
}

let months = {
  "01": "Jan.",
  "02": "Feb.",
  "03": "Mar.",
  "04": "Apr.",
  "05": "May",
  "06": "Jun.",
  "07": "Jul.",
  "08": "Aug.",
  "09": "Sep.",
  "10": "Oct.",
  "11": "Nov.",
  "12": "Dec."
}

function updateDateText(start, end, type, complexity) {
  let typeText = type === "All (default)"? "" : type
  let complexityText = complexity === "All (default)" ? "" : complexity

  // if complexity === 'BRIDGE' && projectType === 'new forecast/update/bridge':
  // then projectType = 'bridge' && complexity = 'SIMPLE'

  let chart1text
  let chart2text
  let chart3text
  let chart4text
  let chart5text
  let chart6text

  if (type === "All (default)") {
    chart1text = `Average Submittal Time per ${complexityText} New Forecast/Update/Bridge`
    chart2text = `Total ${complexityText} New Forecasts/Updates/Bridges`
    chart3text = `Average Review Time per ${complexityText} Submittal`
    chart4text = `Total ${complexityText} Reviews                    `
    chart5text = `Average Submittal Time per ${complexityText} Maintenance`
    chart6text = `Total ${complexityText} Maintenance Projects                           `
  } 
  if (type === "Review") {
    chart3text = `Average Review Time per ${complexityText} Submittal`
    chart4text = `Total ${complexityText} Reviews                                   `
  } if (type === "Maintenance") {
    chart5text = `Average Submittal Time per ${complexityText} Maintenance`
    chart6text = `Total ${complexityText} Maintenance Projects                           `
  } else {
    // check complexity
    if (complexity === 'Bridge') {
      chart1text = `Average Submittal Time per Simple Bridge Project`
      chart2text = `Total Simple Bridge Projects                         `
    } else {
      chart1text = `Average Submittal Time per ${complexityText} New Forecast/Update/Bridge`
      chart2text = `Total ${complexityText} New Forecasts/Updates/Bridges                         `
    }
  }
  $("#chart1").text(chart1text)
  $("#chart2").text(chart2text)
  $("#chart3").text(chart3text)
  $("#chart4").text(chart4text)
  $("#chart5").text(chart5text)
  $("#chart6").text(chart6text)
}

const clearCanvas = () => {
    $( ".panel-body" ).empty()
}

const addChartCanvas = () => {
  let row1 = `
  <div class="row" id="row1"> 
        <div class="col-sm-1"> 
        </div> 
        <div class="col-sm-5"> 
        <h2 id="chart1" style="font-size:18px;text-align:center;color:gray;"></h2> 
        <br>
            <canvas id="barChart1" style="float:left"></canvas> 
        </div> 
        <div class="col-sm-5"> 
        <h2 id="chart2" style="font-size:18px;text-align:center;color:gray;"></h2> 
        <br><br>
            <canvas id="barChart2" style="float:left"></canvas> 
        </div> 
        <div class="col-sm-1"> 
        </div> 
    </div>
    <div class="row" id="row1-table"></div>
  `
  let row2 = `
  <div class="row" id="row2"> 
        <div class="col-sm-1"> 
        </div> 
        <div class="col-sm-5"> 
        <h2 id="chart3" style="font-size:18px;text-align:center;color:gray;"></h2> 
        <br> 
          <canvas id="barChart3" style="float:left"></canvas> 
        </div> 
        <div class="col-sm-5"> 
        <h2 id="chart4" style="font-size:18px;text-align:center;color:gray;"></h2> 
        <br> 
            <canvas id="barChart4" style="float:left"></canvas> 
        </div> 
        <div class="col-sm-1"> 
        </div> 
    </div> 
    <div class="row" id="row2-table"></div>
  `
  let row3 = ` 
    <div class="row" id="row3"> 
        <div class="col-sm-1"> 
        </div> 
        <div class="col-sm-5"> 
        <h2 id="chart5" style="font-size:18px;text-align:center;color:gray;"></h2> 
        <br> 
            <canvas id="barChart5" style="float:left"></canvas> 
        </div> 
        <div class="col-sm-5"> 
        <h2 id="chart6" style="font-size:18px;text-align:center;color:gray;"></h2> 
        <br> 
            <canvas id="barChart6" style="float:left"></canvas> 
        </div> 
        <div class="col-sm-1"> 
        </div> 
    </div> 
    <div class="row" id="row3-table"></div>
    `
    $( ".panel-body" ).append(row1, row2, row3)
}

const clearProjectListsFromCanvas = () => {
  $($('#projectList'), '#row1').remove()
  $($('#projectList'), '#row2').remove()
  $($('#projectList'), '#row3').remove()
  if ($("#row1").children().length > 3) {
    $("#row1").children().last().remove()
  }
  if ($("#row2").children().length > 3) {
    $("#row2").children().last().remove()
  }
  if ($("#row3").children().length > 3) {
    $("#row3").children().last().remove()
  }
  $(`#row1-table`).empty()
  $(`#row2-table`).empty()
  $(`#row3-table`).empty()
  // $($(chart), '.panel-body').remove()
}

let headers = `<table class="table">
    <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">Task ID</th>
        <th scope="col">P.I. Number</th>
        <th scope="col">GDOT NTP</th>
        <th scope="col">PM Request</th>
        <th scope="col">Total Review Time</th>
        <th scope="col">Total Working Days</th>
        <th scope="col">Project Type</th>
      </tr>
    </thead>
    <tbody id="project-row">
    </tbody>
    </table>
    `

const fillTableWithProjects = (chartId, barId, rowId) => {
  $(`#project-${rowId}`).empty()
  chartId = chartId.slice(8)
  let data = allChartDatasets[`bar${chartId}Data`][barId]
  let row
  let rows = []
  let count = 1
  $(`#${rowId}-table`).append(headers)
  data.map(proj => {
    row = `<tr>
      <th scope="row">${count}</th>
      <td>${proj.taskId}</td>
      <td>${proj.piNum}</td>
      <td>${proj.gdotNtp}</td>
      <td>${proj.pmRequest}</td>
      <td>${proj.totalRevTime}</td>
      <td>${proj.totalDurMinusLost}</td>
      <td>${proj.projectType}</td>
    </tr>`
    $(`#project-row`).append(row)
    count++
  })
} 

const addProjectListToCanvas = ({ chartId, barId, rowId }) => {
  if ($(`#${rowId}`).children().length > 3) {
    $(`#${rowId}`).children().last().remove()
  }
  listTable =  fillTableWithProjects(chartId, barId, rowId)  
  $(`#${rowId}`).append(listTable)
}

const updateItem1 = (itemId, column, value) => {
  $().SPServices({
      operation: "UpdateListItems",
      listName: "MergedFile_V1",
      ID: parseInt(itemId),
      valuepairs: [[column, value]],
      completefunc: function(xData, Status) {
      }
  });
}

const updateItem2 = (itemId, value) => {
  $().SPServices({
      operation: "UpdateListItems",
      listName: "MergedFile_V1",
      ID: parseInt(itemId),
      valuepairs: [['EXISTING_x0020_SUBMITTAL', value]],
      completefunc: function(xData, Status) {          
      }
  });
}

const updateItem3 = (itemId, value) => {
  $().SPServices({
      operation: "UpdateListItems",
      listName: "MergedFile_V1",
      ID: parseInt(itemId),
      valuepairs: [['FINAL_x0020_REVIEW_x002f__x0020_', value]],
      completefunc: function(xData, Status) {
      }
  });
}

const updateItem4 = (itemId, value) => {
  $().SPServices({
      operation: "UpdateListItems",
      listName: "MergedFile_V1",
      ID: parseInt(itemId),
      valuepairs: [['COUNTS_x0020_RECEIVED_x0020_FROM', value]],
      completefunc: function(xData, Status) {
      }
  });
}

$(document).ready(sitesChart.FieldRenderSetup());
$(document).ready(function() {
  $("#myModal").css({ display: "none" });
  debugger
  // check the checkboxes

  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let prevMonth = String(today.getMonth()).padStart(2, '0')
  let yyyy = today.getFullYear();

  today = yyyy + '-' + mm + '-' + dd;
  let lastMonth = yyyy + '-' + prevMonth + '-01'
  let jan1st = yyyy + '-01-01'
    // $('#fromDate').val(lastMonth)
    $('#fromDate').val(jan1st)
    $('#toDate').val(today)
    getAllListItems()
    let inputFrom = $("#fromDate").val();
		let inputTo = $("#toDate").val();
    let complexity = $("#complexity").val();
		let projectType = $("#projectType").val();
    let startDate = Date.parse(inputFrom)
    let endDate = Date.parse(inputTo)
    clearCanvas()
    addChartCanvas()
		filterItems(startDate, endDate, complexity, projectType)
    updateDateText(inputFrom, inputTo, projectType, complexity)
	$("button").click(function() {
		let inputFrom = $("#fromDate").val();
		let inputTo = $("#toDate").val();
    let complexity = $("#complexity").val();
		let projectType = $("#projectType").val();
    let startDate = Date.parse(inputFrom)
    let endDate = Date.parse(inputTo)
    clearCanvas()
    addChartCanvas()
		filterItems(startDate, endDate, complexity, projectType)
    updateDateText(inputFrom, inputTo, projectType, complexity)
	});
  $("#yearSelectButton").click(function(event) {
    let selectedYear = $('#byYear').val()
    let inputFrom = $("#fromDate").val(selectedYear + '-01-01');
		let inputTo = $("#toDate").val(selectedYear + '-12-31');   
    let complexity = $("#complexity").val();
		let projectType = $("#projectType").val();
    let startDate = Date.parse('01-01-' + selectedYear)
    let endDate = Date.parse('12-31-' + selectedYear)
    clearCanvas()
    addChartCanvas()
		filterItems(startDate, endDate, complexity, projectType)
    updateDateText(inputFrom, inputTo, projectType, complexity)
	});
});



