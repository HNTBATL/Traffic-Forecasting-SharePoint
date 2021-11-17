
// ~site/SiteAssets/js/jquery.js|~site/SiteAssets/js/jquery.SPServices.min.js|~site/SiteAssets/js/Chart.bundle.js|~site/SiteAssets/js/Admin.js|~site/SiteAssets/js/Chart.PieceLabel.js|~site/SiteAssets/header.css
// Declare the letiables

var sitesChart = sitesChart || {};
const changeToNewForecast = []
const changeToBridge = []

let barChart1
let barChart2
let barChart3
let pieChart1
let pieChart2

let bar1Data
let bar2Data
let bar3Data
let pie1Data
let pie2Data

allChartDatasets = {
  bar1Data: [], bar2Data: [], bar3Data: [], pie1Data: [], pie2Data: []
}


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

sitesChart.Projects = {
    allProjects: [],
    taskOneProjects: [],
    taskOneGS: [],
    taskTwoGS: [],
    taskTwoProjects: [],
    taskOneByConsultant: {},
    taskTwoByConsultant: {},
    allConsultants: [],
    allGreshamSmith: []
}

sitesChart.totalOne = 0
sitesChart.totalTwo = 0

sitesChart.totalOneGS = 0
sitesChart.totalTwoGS = 0

sitesChart.budgetOne = 2500000
sitesChart.budgetTwo = 2023600

sitesChart.budgetOneGS = 2500000
sitesChart.budgetTwoGS = 2023600

// Override the rendering
sitesChart.FieldRenderSetup = function() {
    var override = {};
    override.Templates = {};
    override.Templates.Header = sitesChart.CustomHeader;
    override.Templates.Item = sitesChart.CustomItem;
    override.Templates.Footer = sitesChart.CustomFooter;

    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(override);
};

sitesChart.CustomItem = function(ctx) {
    return "";
};

sitesChart.CustomHeader = function(ctx) {
    return (
        `
        <div class="bootstrap-iso"> 
            <div class="container"> 
                <div class="panel">
                    <div class="panel panel-default" id="filter-panel"> 
                        <div class="panel-heading" id="main-header"> 
                        </div> 
                        <div class="panel-heading"> 
                            <div class="form-group"><br> 
                                <div class="row">
                                    <div class="col-sm-1">
                                    </div>
                                    <div class="col-sm-8">
                                        <div class="row"> 
                                            <label class="col-sm-6 control-label" style="font-size:18px;color:gray;">&nbsp; Filter by Contractor:</label>
                                            <div class="col-sm-6">
                                                <select class="form-control" id="contractor">
                                                    <option>All (default)</option>
                                                    <option>HNTB</option>
                                                    <option>Gresham Smith</option>
                                                </select> 
                                            </div>  
                                        </div> 
                                        <div class="row"> 
                                            <label class="col-sm-6 control-label" style="font-size:18px;color:gray;">&nbsp; Filter by Task Order:</label> 
                                            <div class="col-sm-6">
                                                <select class="form-control" id="taskOrder">
                                                    <option>All (default)</option>
                                                    <option>Task Order 1</option>
                                                    <option>Task Order 2</option>
                                                </select> 
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-1">
                                    </div>
                                </div> 
                            </div>
                            <div class="row"> 
                                <div class="col-sm-5">
                                </div> 
                                <div class="col-sm-2">
                                    <button id="submitButton" type="button" class="btn btn-default" style="font-size:18px">Submit</button>
                                </div> 
                                <div class="col-sm-5">
                                </div> 
                            </div> 
                        </div>
                    </div> 

                    <div class="panel panel-default" id="panel-body-1">  
                        <div class="panel-heading"> 
                            <h2 align="center">Project Allocation by Task Order</h2>
                        </div>  
                    </div> 
                        
                    <div class="panel panel-default" id="total-panel-HNTB">
                    </div> 

                    <div class="panel panel-default" id="total-panel-GS">
                    </div> 
                        
                    <div class="panel panel panel-default" id="pie-chart-panel"> 
                        <div class="panel-heading"> 
                            <h2 align="center">Project Allocation by District & Project Type</h2> 
                        </div> 
                        <div class="panel-body" id="panel-body-4"> 
                        </div> 
                    </div> 
                </div>
            </div> 
        </div>
    `
    )
};

const styles = {
    spanStyle: "font-size:16px",
    arial: "font-family: Arial;",
    verdana: "font-family: Verdana;"
}

// Override the Header
sitesChart.CustomFooter = function() {
    return ""
}

const clearProjectListsFromCanvas = () => {
    $(`#table-row`).empty()
    // $($(chart), '.panel-body').remove()
  }
  

let headers = `<table class="table">
    <thead>
      <tr>
        <th scope="col" style=${styles.arial}>#</th>
        <th scope="col" style=${styles.verdana}>Task ID</th>
        <th scope="col">P.I. Number</th>
        <th scope="col">District(s)</th>
        <th scope="col">Total Cost</th>
        <th scope="col">Project Type</th>
        <th scope="col">Project Complexity</th>
      </tr>
    </thead>
    <tbody id="project-row">
    </tbody>
    </table>
    `

const fillTableWithProjects = ({chartId, barId}) => {
    $(`#table-row`).empty()
    chartId = chartId.slice(8)
    let data = allChartDatasets[`pie${chartId}Data`][barId]
    let row
    let count = 1
    $(`#table-row`).append(headers)
    data.map(proj => {
        let dist = !!proj.dist ? proj.dist.split('').filter(char => char != ';').filter(char => char != '#').join('') : 'no data'
        let complexity = proj.complexity || 'no data'
        let projectType = proj.projectType || 'no data'
        let total = proj.totalCostInt.toString().split('')
        let len = total.length
        len > 6 && total.splice(len-3, 0, ',').splice(len-6, 0, ',')
        len > 3 && total.splice(len-3, 0, ',')
        total = total.join('')
        row = `<tr>
        <th scope="row">${count}</th>
        <td style=${styles.arial}>${proj.taskId}</td>
        <td style=${styles.verdana}>${proj.piNum}</td>
        <td>${dist}</td>
        <td>$${total}</td>
        <td>${projectType}</td>
        <td>${complexity}</td>
        </tr>`
        $(`#project-row`).append(row)
        count++
    })
} 

const getAllListItems = () => {
    $().SPServices({
        operation: "GetListItems",
        async: false,
        listName: "MergedFile_V1",
        completefunc: function(listData, Status) {
            $(listData.responseXML).SPFilterNode("z:row").each(function() {
                let consultant = $(this).attr("ows_DTE_x002f__x0020_TRAFFIC_x0020_F")
                let status = $(this).attr("ows_CURRENT_x0020_STATUS")
                let complexity = $(this).attr("ows_COMPLEXITY")
                let taskId = $(this).attr("ows_Title")
                let piNum = $(this).attr('ows_P_x002e_I_x002e__x0020__x0020_NO') || "" 
                let projectType = $(this).attr("ows_TYPE_x0020_OF_x0020_PROJECT")
                let totalCost = $(this).attr("ows_TOTAL_x0020_COST0")
                let totalCostInt = parseInt(totalCost.slice(7))
                let dist = $(this).attr("ows_District")

                let project = {
                    taskId: taskId,
                    piNum: piNum,
                    status: status,
                    projectType: projectType,
                    complexity: complexity,
                    totalCostInt: totalCostInt,
                    totalCost: totalCost,
                    dist: dist,
                    consultant: consultant
                }


                if (project.taskId) {
                    sitesChart.Projects.allProjects.push(project)
                    if (project.taskId.includes("1451.1")) {
                        sitesChart.Projects.taskOneProjects.push(project)                        
                    }
                    if (project.taskId.includes("1451.2")) {
                        sitesChart.Projects.taskTwoProjects.push(project)
                    }
                    if (project.taskId.includes("1453.")) {
                        sitesChart.Projects.allGreshamSmith.push(project)  
                    }
                    if (project.taskId.includes("1453.1")) {
                        sitesChart.Projects.taskOneGS.push(project)  
                    }
                    if (project.taskId.includes("1453.2")) {
                        sitesChart.Projects.taskTwoGS.push(project)  
                    }
                }
            })
        }
    })
}

const filterListItems = () => {
    sitesChart.totalOne = sitesChart.Projects.taskOneProjects.map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0)
    sitesChart.totalTwo = sitesChart.Projects.taskTwoProjects.map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0)

    sitesChart.totalOneGS = sitesChart.Projects.taskOneGS.map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0)
    sitesChart.totalTwoGS = sitesChart.Projects.taskTwoGS.map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0)
}

const updateChartData = (contractor=null, taskOrder=null) => {

    let total
    let budget
    let balance
    let allProjects

    if (!contractor || contractor === "All (default)") {
        if (!taskOrder || taskOrder === "All (default)") {
            total = [sitesChart.totalOne + sitesChart.totalTwo, sitesChart.totalOneGS + sitesChart.totalTwoGS]
            budget = [sitesChart.budgetOne + sitesChart.budgetTwo, sitesChart.budgetOneGS + sitesChart.budgetTwoGS]
            balance = [budget[0] - total[0], budget[1] - total[1]]
            allProjects = sitesChart.Projects.taskOneProjects.concat(sitesChart.Projects.taskTwoProjects).concat(sitesChart.Projects.taskOneGS.concat(sitesChart.Projects.taskTwoGS))
        } else {
            if (taskOrder === "Task Order 1") {
                total = [sitesChart.totalOne, sitesChart.totalOneGS]
                budget = [sitesChart.budgetOne, sitesChart.budgetOneGS]
                balance = [budget[0] - total[0], budget[1] - total[1]]
                allProjects = sitesChart.Projects.taskOneProjects.concat(sitesChart.Projects.taskOneGS)
            }
            if (taskOrder === "Task Order 2") {
                total = [sitesChart.totalTwo, sitesChart.totalTwoGS]
                budget = [sitesChart.budgetTwo, sitesChart.budgetTwoGS]
                balance = [budget[0] - total[0], budget[1] - total[1]]
                allProjects = sitesChart.Projects.taskTwoProjects.concat(sitesChart.Projects.taskTwoGS)
            }
        }
    } else if (!!contractor || contractor !== "All (default)") {
        if (contractor === "HNTB") {
            if (!taskOrder || taskOrder === "All (default)") {
                total = [sitesChart.totalOne + sitesChart.totalTwo, 0]
                budget = [sitesChart.budgetOne + sitesChart.budgetTwo, 0]
                balance = [budget[0] - total[0], 0]
                allProjects = sitesChart.Projects.taskOneProjects.concat(sitesChart.Projects.taskTwoProjects)
            } 
            if (taskOrder === "Task Order 1") {
                total = [sitesChart.totalOne, 0]
                budget = [sitesChart.budgetOne, 0]
                balance = [budget[0] - total[0], 0]
                allProjects = sitesChart.Projects.taskOneProjects
            }
            if (taskOrder === "Task Order 2") {
                total = [sitesChart.totalTwo, 0]
                budget = [sitesChart.budgetTwo, 0]
                balance = [budget[0] - total[0], 0]
                allProjects = sitesChart.Projects.taskTwoProjects
            }
        } else if (contractor === "Gresham Smith") {
            if (!taskOrder || taskOrder === "All (default)") {
                total = [0, sitesChart.totalOneGS + sitesChart.totalTwoGS]
                budget = [0, sitesChart.budgetOneGS + sitesChart.budgetTwoGS]
                balance = [0, budget[1] - total[1]]
                allProjects = sitesChart.Projects.allGreshamSmith
            } 
            if (taskOrder === "Task Order 1") {
                total = [0, sitesChart.totalOneGS]
                budget = [0, sitesChart.budgetOneGS]
                balance = [0, budget[1] - total[1]]
                allProjects = sitesChart.Projects.taskOneGS
            }
            if (taskOrder === "Task Order 2") {
                total = [0, sitesChart.totalTwoGS]
                budget = [0, sitesChart.budgetTwoGS]
                balance = [0, budget[1] - total[1]]
                allProjects = sitesChart.Projects.taskTwoGS
            }
        }
    }

    let bar1Data = {
        labels: [""],
        datasets: [
            {
                label: 'Allocated',
                backgroundColor: ["#004358"],
                data: [Math.round(((total[0]+total[1]) / (budget[0]+budget[1])) * 100)]
            },
            {
                label: 'Remaining',
                backgroundColor: ["#1F8A70"],
                data: [Math.round(((balance[0]+balance[1]) / (budget[0]+budget[1])) * 100)]
            }
        ]
    }

    let totalBudgetHNTB = 9000000
    let totalBudgetGS = 9000000
    let remainingHNTB = totalBudgetHNTB - total[0]
    let remainingGS = totalBudgetGS - total[1]

    let bar2Data = {
        labels: [""],
        datasets: [
            {
                label: "Allocated",
                backgroundColor: ["#004358"],
                data: [Math.round((total[0]/totalBudgetHNTB) * 100)]
            },
            {
                label: "Remaining",
                backgroundColor: ["#1F8A70"],
                data: [Math.round((remainingHNTB/ totalBudgetHNTB) * 100)]
            }
        ]
    }

    let bar3Data = {
        labels: [""],
        datasets: [
            {
                label: "Allocated",
                backgroundColor: ["#004358"],
                data: [Math.round((total[1]/totalBudgetGS) * 100)]
            },
            {
                label: "Remaining",
                backgroundColor: ["#1F8A70"],
                data: [Math.round((remainingGS / totalBudgetGS) * 100)]
            }
        ]
    }

    let allTot = allProjects.map(p => parseInt(p.totalCost.slice(7))).reduce((a, b) => a + b, 0)

    let dist1tot = allProjects.filter(p => p.dist == 1).map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0)
    let dist2tot = allProjects.filter(p => p.dist == 2).map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0)
    let dist3tot = allProjects.filter(p => p.dist == 3).map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0)
    let dist4tot = allProjects.filter(p => p.dist == 4).map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0)
    let dist5tot = allProjects.filter(p => p.dist == 5).map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0)
    let dist6tot = allProjects.filter(p => p.dist == 6).map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0)
    let dist7tot = allProjects.filter(p => p.dist == 7).map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0)

// for District Chart
    let inclDistOne = allProjects.filter(p => p.dist).filter(p => p.dist.includes(1))
    let inclDistTwo = allProjects.filter(p => p.dist).filter(p => p.dist.includes(2))
    let inclDistThree = allProjects.filter(p => p.dist).filter(p => p.dist.includes(3))
    let inclDistFour = allProjects.filter(p => p.dist).filter(p => p.dist.includes(4))
    let inclDistFive = allProjects.filter(p => p.dist).filter(p => p.dist.includes(5))
    let inclDistSix = allProjects.filter(p => p.dist).filter(p => p.dist.includes(6))
    let inclDistSeven = allProjects.filter(p => p.dist).filter(p => p.dist.includes(7))

    const districts = ['1', '2', '3', '4', '5', '6', '7']
    const notAppl = allProjects.filter(p => !districts.includes(p.dist))

    allChartDatasets.pie1Data = {
        Dist1: inclDistOne, 
        Dist2: inclDistTwo, 
        Dist3: inclDistThree, 
        Dist4: inclDistFour, 
        Dist5: inclDistFive, 
        Dist6: inclDistSix, 
        Dist7: inclDistSeven,
    }

    dist1tot = dist1tot == 0 ? inclDistOne.map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0) : dist1tot
    dist2tot = dist2tot == 0 ? inclDistTwo.map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0) : dist2tot
    dist3tot = dist3tot == 0 ? inclDistThree.map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0) : dist3tot
    dist4tot = dist4tot == 0 ? inclDistFour.map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0) : dist4tot
    dist5tot = dist5tot == 0 ? inclDistFive.map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0) : dist5tot
    dist6tot = dist6tot == 0 ? inclDistSix.map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0) : dist6tot
    dist7tot = dist7tot == 0 ? inclDistSeven.map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0) : dist7tot

    let totNotAppl = notAppl.map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0)

    let allWithDist = inclDistOne.length + inclDistTwo.length + inclDistThree.length + inclDistFour.length + inclDistFive.length + inclDistSix.length + inclDistSeven.length + notAppl.length
    let allWithDistTotal = dist1tot + dist2tot + dist3tot + dist4tot + dist5tot + dist6tot + dist7tot

    let pie1Data = {
        labels: [
        "District 1",
        "District 2",
        "District 3",
        "District 4",
        "District 5",
        "District 6",
        "District 7",
        // "Multiple Districts"
        ],
        datasets: [
        {
            label: [
                "Dist1",
                "Dist2",
                "Dist3",
                "Dist4",
                "Dist5",
                "Dist6",
                "Dist7",
                // "MultDist"
                ],            
            backgroundColor: [
            "#214154",
            "#265961",
            "#227066",
            "#76A665",
            "#F7E32E",
            "#EBD72C",
            "#AB9D20",
            // "#AB9D25",
            ],
            // data: [
            // Math.round((inclDistOne.length / allWithDist) * 100),
            // Math.round((inclDistTwo.length / allWithDist) * 100),
            // Math.round((inclDistThree.length / allWithDist) * 100),
            // Math.round((inclDistFour.length / allWithDist) * 100),
            // Math.round((inclDistFive.length / allWithDist) * 100),
            // Math.round((inclDistSix.length / allWithDist) * 100),
            // Math.round((inclDistSeven.length / allWithDist) * 100),
            // // Math.round((notAppl.length / allWithDist) * 100)
            // ],
            // 
            // changed to percentage based on budget allocation, not project count (10/20/21)
            data: [
                Math.round((dist1tot / allWithDistTotal) * 100),
                Math.round((dist2tot / allWithDistTotal) * 100),
                Math.round((dist3tot/ allWithDistTotal) * 100),
                Math.round((dist4tot / allWithDistTotal) * 100),
                Math.round((dist5tot / allWithDistTotal) * 100),
                Math.round((dist6tot / allWithDistTotal) * 100),
                Math.round((dist7tot / allWithDistTotal) * 100),
                // Math.round((notAppl.length / allWithDist) * 100)
                ],
            hoverData: [
            [inclDistOne.length, dist1tot],
            [inclDistTwo.length, dist2tot],
            [inclDistThree.length, dist3tot],
            [inclDistFour.length, dist4tot],
            [inclDistFive.length, dist5tot],
            [inclDistSix.length, dist6tot],
            [inclDistSeven.length, dist7tot],
            // [notAppl.length, totNotAppl]
            ]
            // data: [5, 10, 15, 20, 25, 30, 35]
        }
        ]
    };

    let newForecastTotal = allProjects.filter(p => p.projectType === "NEW FORECAST").map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0)
    let updateTotal = allProjects.filter(p => p.projectType === "UPDATE").map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0)
    let reviewTotal = allProjects.filter(p => p.projectType === "REVIEW").map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0)
    let bridgeTotal = allProjects.filter(p => p.projectType === "BRIDGE").map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0)
    let progManTotal = allProjects.filter(p => p.projectType === "PROGRAM MANAGEMENT").map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0)
    let countsTotal = allProjects.filter(p => p.projectType === "COUNTS").map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0)
    let maintTotal = allProjects.filter(p => p.projectType === "MAINTENANCE").map(t => parseInt(t.totalCost.slice(7))).reduce((a, b) => a + b, 0)

    let newForecastCount = allProjects.filter(p => p.projectType === "NEW FORECAST").length
    let updateCount =  allProjects.filter(p => p.projectType === "UPDATE").length
    let reviewCount = allProjects.filter(p => p.projectType === "REVIEW").length
    let bridgeCount = allProjects.filter(p => p.projectType === "BRIDGE").length
    let progManCount = allProjects.filter(p => p.projectType === "PROGRAM MANAGEMENT").length
    let countsCount = allProjects.filter(p => p.projectType === "COUNTS").length
    let maintCount = allProjects.filter(p => p.projectType === "MAINTENANCE").length

    let allCount = allProjects.length
    let allTotal = newForecastTotal + updateTotal + reviewTotal + bridgeTotal + progManTotal + countsTotal + maintTotal

    allChartDatasets.pie2Data = {
        newForecasts: allProjects.filter(p => p.projectType === "NEW FORECAST"), 
        updates: allProjects.filter(p => p.projectType === "UPDATE"), 
        reviews: allProjects.filter(p => p.projectType === "REVIEW"), 
        bridges: allProjects.filter(p => p.projectType === "BRIDGE"), 
        programManagements: allProjects.filter(p => p.projectType === "PROGRAM MANAGEMENT"), 
        counts: allProjects.filter(p => p.projectType === "COUNTS"), 
        maintenances: allProjects.filter(p => p.projectType === "MAINTENANCE"),
    }

    let pie2Data = {
        labels: ["New Forecast", "Update", "Review", "Bridge", "Program Management", "Counts", "Maintenance"], 
        fontSize: 14,
        datasets: [
        {
            label: ['newForecasts', 'updates', 'reviews', 'bridges', 'programManagements', 'counts', 'maintenances'],
            fontSize: 30,
            backgroundColor: ["#214154", "#265961", "#227066", "#76A665", "#F7E32E", "#EBD72C", "#AB9D20"],
            // data: [
            // parseInt(Math.round(newForecastCount / allCount * 100)),
            // parseInt(Math.round(updateCount / allCount * 100)),
            // parseInt(Math.round(reviewCount / allCount * 100)),
            // parseInt(Math.round(bridgeCount / allCount * 100)),
            // parseInt(Math.round(progManCount / allCount * 100)),
            // parseInt(Math.round(countsCount / allCount * 100)),
            // parseInt(Math.round(maintCount / allCount * 100))
            // ],
            // changed to percentage based on budget allocation, not project count (10/20/21)
            data: [
                parseInt(Math.round(newForecastTotal / allTotal * 100)),
                parseInt(Math.round(updateTotal / allTotal * 100)),
                parseInt(Math.round(reviewTotal / allTotal * 100)),
                parseInt(Math.round(bridgeTotal / allTotal * 100)),
                parseInt(Math.round(progManTotal / allTotal * 100)),
                parseInt(Math.round(countsTotal / allTotal * 100)),
                parseInt(Math.round(maintTotal / allTotal * 100))                
            ],
            hoverData: [
                [newForecastCount, newForecastTotal], 
                [updateCount, updateTotal], 
                [reviewCount, reviewTotal], 
                [bridgeCount, bridgeTotal],
                [progManCount, progManTotal],
                [countsCount, countsTotal],
                [maintCount, maintTotal]
            ]
        }
        ]
    };

    let bar1Options = {
        responsive: true,
        maintainAspectRatio: true,
        title: {
        display: true,
        fontSize: 14
        },
        pieceLabel: {
        render: "value",
        fontColor: "#FFF",
        fontSize: 16
        },
        tooltips: {
        callbacks: {
            label: function(tooltipItem, data) {
                return (
                    Number(bar1Data.datasets[tooltipItem.datasetIndex].data) + "%"
                );
            },
            fontSize: 25
        }
        },
        scales: {
        xAxes: [
            {
            ticks: {
                min: 0,
                max: 100,
                fontSize: 15,
                callback: function(value, index, values) {
                    let message = !!contractor ? contractor + ' - ' + taskOrder : 'Both Contractors - Task Order 1 & 2'
                    return message 
                }
            }
            }
        ],
        yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "Percentage",
                fontSize: 14
              },
              ticks: {
                min: 0
              }
            }
          ],
    
        }
    };

    let bar2Options = {
        responsive: true,
        maintainAspectRatio: true,
        title: {
        display: true,
        fontSize: 14
        },
        pieceLabel: {
        render: "value",
        fontColor: "#FFF"
        },
        tooltips: {
        callbacks: {
            label: function(tooltipItem, data) {
            return (
                Number(bar2Data.datasets[tooltipItem.datasetIndex].data) + "%"
            );
            }
        }
        },
        scales: {
        xAxes: [
            {
            ticks: {
                min: 0,
                max: 100,
                callback: function(value, index, values) {
                    let message = !!contractor ? contractor + ' - ' + taskOrder : 'Both Contractors - Task Order 1 & 2'
                    return message 
                }
            }
            }
        ],
        yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "Percentage",
                fontSize: 14
              },
              ticks: {
                min: 0
              }
            }
          ],

        }
    };

    let bar3Options = {
        responsive: true,
        maintainAspectRatio: true,
        title: {
        display: true,
        fontSize: 14
        },
        pieceLabel: {
        render: "value",
        fontColor: "#FFF"
        },
        tooltips: {
        callbacks: {
            label: function(tooltipItem, data) {
            return (
                Number(bar3Data.datasets[tooltipItem.datasetIndex].data) + "%"
            );
            }
        }
        },
        scales: {
        xAxes: [
            {
            ticks: {
                min: 0,
                max: 100,
                callback: function(value, index, values) {
                    let message = !!contractor ? contractor + ' - ' + taskOrder : 'Both Contractors - Task Order 1 & 2'
                    return message 
                }
            }
            }
        ],
        yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "Percentage",
                fontSize: 14
              },
              ticks: {
                min: 0
              }
            }
          ],

        }
    };

    let label

    let pie1Options = {
        onClick: e => {
            if (pieChart1.lastActive.length > 0) {
                let index = pieChart1.lastActive[0]._index
                let barId = pieChart1.getDatasetAtEvent(e)[index]._model.label
                let chartId = e.currentTarget.id
                let chartBarId = { chartId, barId }
                debugger
                clearProjectListsFromCanvas()
                fillTableWithProjects(chartBarId)    
            }
        },        
        responsive: true,
        maintainAspectRatio: true,
        title: {
        display: true,
        text: "Budget Allocation by District",
        fontSize: 14
        },
        pieceLabel: {
        render: function(current) {
            return Number(current.value).toLocaleString() + "%"
            },
            fontColor: "#FFF"
            },
            tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                    label = pie1Data.labels[tooltipItem.index]
                    const projects = Number(pie1Data.datasets[0].hoverData[tooltipItem.index][0]).toLocaleString()
                    let totalAmount = Number(pie1Data.datasets[0].hoverData[tooltipItem.index][1]).toLocaleString()
                    let total = totalAmount === "NaN" ? 'n/a' : totalAmount
                    return `${label}: ${projects} projects | $${total}`
                }
            }
        }
    };

    let pie2Options = {
        onClick: e => {
            if (pieChart2.lastActive.length > 0) {
                let index = pieChart2.lastActive[0]._index
                let barId = pieChart2.getDatasetAtEvent(e)[index]._model.label
                let chartId = e.currentTarget.id
                let chartBarId = { chartId, barId }
                debugger
                clearProjectListsFromCanvas()
                fillTableWithProjects(chartBarId)    
            }
        },        
        responsive: true,
        maintainAspectRatio: true,
        title: {
        display: true,
        text: "Budget Allocation by Project Type",
        fontSize: 14
        },
        pieceLabel: {
            render: function(current) {
                return Number(current.value).toLocaleString() + "%"
            },
            fontColor: "#FFF"
            },
            tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                    label = pie2Data.labels[tooltipItem.index]
                    const projects = Number(pie2Data.datasets[0].hoverData[tooltipItem.index][0]).toLocaleString()
                    let totalAmount = Number(pie2Data.datasets[0].hoverData[tooltipItem.index][1]).toLocaleString()
                    let total = totalAmount === "NaN" ? 'n/a' : totalAmount
                    return `${label}: ${projects} projects | $${total}`
                }
            }
        }
    };

    let bar1
    let bar2
    let bar3
    let pie1
    let pie2

    if (contractor === 'HNTB') {
        bar1 = $("#barChart1").get(0).getContext("2d");
        bar2 = $("#barChart2").get(0).getContext("2d");
        pie1 = $("#pieChart1").get(0).getContext("2d")
        pie2 = $("#pieChart2").get(0).getContext("2d");
        barChart1 = new Chart(bar1, {
            type: "bar",
            data: bar1Data,
            options: bar1Options
        });
    
        barChart2 = new Chart(bar2, {
            type: "bar",
            data: bar2Data,
            options: bar2Options
        });
    
        pieChart1 = new Chart(pie1, {
            type: "pie",
            data: pie1Data,
            options: pie1Options
        });
    
        pieChart2 = new Chart(pie2, {
            type: "pie",
            data: pie2Data,
            options: pie2Options
        });
    }
    if (contractor === 'Gresham Smith') {
        bar1 = $("#barChart1").get(0).getContext("2d");
        bar3 = $("#barChart3").get(0).getContext("2d");        
        pie1 = $("#pieChart1").get(0).getContext("2d")
        pie2 = $("#pieChart2").get(0).getContext("2d");
        barChart1 = new Chart(bar1, {
            type: "bar",
            data: bar1Data,
            options: bar1Options
        });
    
        barChart3 = new Chart(bar3, {
            type: 'bar',
            data: bar3Data,
            options: bar3Options
        });
    
        pieChart1 = new Chart(pie1, {
            type: "pie",
            data: pie1Data,
            options: pie1Options
        });
    
        pieChart2 = new Chart(pie2, {
            type: "pie",
            data: pie2Data,
            options: pie2Options
        });
    } if (contractor === "All (default)" || contractor === 'All Contractors' || contractor === null) {
        bar1 = $("#barChart1").get(0).getContext("2d");
        bar2 = $("#barChart2").get(0).getContext("2d");
        bar3 = $("#barChart3").get(0).getContext("2d");        
        pie1 = $("#pieChart1").get(0).getContext("2d")
        pie2 = $("#pieChart2").get(0).getContext("2d");
        barChart1 = new Chart(bar1, {
            type: "bar",
            data: bar1Data,
            options: bar1Options
        });
    
        barChart2 = new Chart(bar2, {
            type: "bar",
            data: bar2Data,
            options: bar2Options
        });
    
        barChart3 = new Chart(bar3, {
            type: 'bar',
            data: bar3Data,
            options: bar3Options
        });
    
        pieChart1 = new Chart(pie1, {
            type: "pie",
            data: pie1Data,
            options: pie1Options
        });
    
        pieChart2 = new Chart(pie2, {
            type: "pie",
            data: pie2Data,
            options: pie2Options
        });
    }

    replaceList = [];
    // Project Allocation
    $("#tableReplace1").html("$" + Number(budget[0]+budget[1]).toLocaleString()); // Task Order Budget
    $("#tableReplace2").html("$" + Number(total[0]+total[1]).toLocaleString()); // Encumbered Amount (total)
    $("#tableReplace3").html("$" + Number((budget[0]+budget[1])-(total[0]+total[1])).toLocaleString()); // Balance

    // Total Allocated for Contract - HNTB
    $("#tableReplace4").html("$" + Number(totalBudgetHNTB).toLocaleString()); // Task Order Budget
    $("#tableReplace5").html("$" + Number(total[0]).toLocaleString()); // Encumbered Amount (total)
    $("#tableReplace6").html("$" + Number(totalBudgetHNTB - total[0]).toLocaleString()); // Balance

    // Total Allocated for Contract - Gresham Smith
    $("#tableReplace7").html("$" + Number(totalBudgetGS).toLocaleString()); // Task Order Budget
    $("#tableReplace8").html("$" + Number(total[1]).toLocaleString()); // Encumbered Amount (total)
    $("#tableReplace9").html("$" + Number(totalBudgetGS - total[1]).toLocaleString()); // Balance
}

const clearCanvas = () => {

    $( "#main-header" ).empty()
    $( "#panel-body-1" ).empty()
    $( "#total-panel-HNTB" ).empty()
    $( "#total-panel-GS" ).empty()
    $( "#panel-body-4" ).empty()
}
 
const addChartCanvas = (contractor='All Contractors', taskOrder='All Task Orders') => {
    let contractorText = contractor === "All (default)" ? 'All Contractors' : contractor
    let taskOrderText = taskOrder === "All (default)" ? 'All Task Orders' : taskOrder
    let header = `<h2 align="center">${contractorText} - ${taskOrderText}</h2>`
    let panel1 = `
    <div class="row" style="display: flex; align-items: center;"> 
    <div class="col-sm-2"> 
    </div> 
        <div class="col-sm-6"> 
            <canvas id="barChart1" style="float:left"></canvas> 
        </div> 
        <div class="col-sm-3"> 
            <table class="table"> 
                <tr> 
                    <td class="align-middle admin-text"><b>${taskOrder} Budget</b></td> 
                    <td><span class="admin-text" id="tableReplace1"></span></td> 
                </tr> 
                <tr> 
                    <td class="admin-text"><b>${taskOrder} Encumbered Amount</b></td> 
                    <td><span class="admin-text" id="tableReplace2"></span></td> 
                </tr> 
                <tr> 
                    <td class="admin-text"><b>${taskOrder} Contract Balance</b></td> 
                    <td><span class="admin-text" id="tableReplace3"></span></td> 
                </tr> 
            </table> 
        </div> 
    </div> `
    let panel2 = `
    <div class="panel-heading"> 
                            <h2 align="center">Total Allocated for Contract - HNTB</h2> 
                        </div> 

                        <div class="panel-body" id="panel-body-2"> 
                        <div class="row" style="display: flex; align-items: center;"> 
        <div class="col-sm-2"> 
        </div> 
        <div class="col-sm-6"> 
            <canvas id="barChart2" style="float:left"></canvas> 
        </div> 
        <div class="col-sm-3"> 
            <table class="table"> 
                <tr> 
                    <td class="admin-text" class="align-middle"><b>Project Budget</b></td> 
                    <td><span class="admin-text" id="tableReplace4"></span></td> 
                </tr> 
                <tr> 
                    <td class="admin-text"><b>Encumbered Amount</b></td> 
                    <td><span class="admin-text" id="tableReplace5"></span></td> 
                </tr> 
                <tr> 
                    <td class="admin-text"><b>Contract Balance</b></td> 
                    <td><span class="admin-text" id="tableReplace6"></span></td> 
                </tr> 
            </table> 
        </div> 
    </div> 
                        </div> `
    let panel3 = `<div class="panel-heading"> 
    <h2 align="center">Total Allocated for Contract - Gresham Smith</h2> 
</div> 

<div class="panel-body" id="panel-body-3"> 
<div class="row" style="display: flex; align-items: center;"> 
        <div class="col-sm-2"> 
        </div> 
        <div class="col-sm-6"> 
            <canvas id="barChart3" style="float:left"></canvas> 
        </div> 
        <div class="col-sm-3"> 
            <table class="table"> 
                <tr> 
                    <td class="admin-text" class="align-middle"><b>Project Budget</b></td> 
                    <td><span class="admin-text" id="tableReplace7"></span></td> 
                </tr> 
                <tr> 
                    <td class="admin-text"><b>Encumbered Amount</b></td> 
                    <td><span class="admin-text" id="tableReplace8"></span></td> 
                </tr> 
                <tr> 
                    <td class="admin-text"><b>Contract Balance</b></td> 
                    <td><span class="admin-text" id="tableReplace9"></span></td> 
                </tr> 
            </table> 
        </div> 
    </div> 
</div> `
    let panel4 = `
    <div class="row"> 
        <div class="col-sm-6"> 
            <canvas id="pieChart1" style="float:middle"></canvas> 
        </div> 
        <div class="col-sm-6"> 
            <canvas id="pieChart2" style="float:middle"></canvas> 
        </div> 
    </div> 
    <div class="row" id="table-row"></div>
    `

    if (contractor === 'HNTB') {
        $( "#main-header" ).append(header)
        $( "#panel-body-1" ).append(panel1)
        $( "#total-panel-HNTB" ).append(panel2)
        $( "#panel-body-4" ).append(panel4)
    }
    if (contractor === 'Gresham Smith') {
        $( "#main-header" ).append(header)
        $( "#panel-body-1" ).append(panel1)
        $( "#total-panel-GS" ).append(panel3)
        $( "#panel-body-4" ).append(panel4)
    } if (contractor === "All (default)" || contractor === 'All Contractors' || contractor === null) {
        $( "#main-header" ).append(header)
        $( "#panel-body-1" ).append(panel1)
        $( "#total-panel-HNTB" ).append(panel2)
        $( "#total-panel-GS" ).append(panel3)
        $( "#panel-body-4" ).append(panel4)
    }
}

// const editOldList = () => {
//     $().SPServices({
//         operation: "UpdateListItems",
//         async: false,
//         listName: "MasterFileDraft_V5",
//         completefunc: (listData, Status) => {
//             $(listData.responseXML).SPFilterNode("z:row").each(function() {
//                 let consultant = $(this).attr("ows_DTE_x002f__x0020_TRAFFIC_x0020_F")
//                 let status = $(this).attr("ows_CURRENT_x0020_STATUS")
//                 let taskId = $(this).attr("ows_Title")
//                 let projectType = $(this).attr("ows_TYPE_x0020_OF_x0020_PROJECT")
//                 let totalCost = $(this).attr("ows_TOTAL_x0020_COST0")
//                 let dist = $(this).attr("ows_District")
//             })
//         }
//     })
// }

const findProjects = () => {
    $().SPServices({
        operation: "GetListItems",
        async: false,
        listName: "MergedFile_V1",
        completefunc: function(listData, Status) {
            $(listData.responseXML).SPFilterNode("z:row").each(function() {

                let numOfInters = $(this).attr("ows__x0023__x0020_OF_x0020_INTERSECT") || 0
                let numOfBridges = $(this).attr("ows__x0023__x0020_OF_x0020_BRIDGES") || 0
                let taskId = $(this).attr("ows_Title")
                let itemId = $(this).attr("ows_ID")
                let projectType = $(this).attr("ows_TYPE_x0020_OF_x0020_PROJECT")

                if (taskId) {
                    if (taskId.includes("1453.1") || taskId.includes("1453.2")) {
                        if (projectType === 'PROJECT') {
                            if (numOfInters > 0) {
                                changeToNewForecast.push(itemId)
                            }
                            if (numOfBridges > 0) {
                                changeToBridge.push(itemId)
                            }
                        }
                    }
                }
            })
        }
    })
}

// THE FOLLOWING SECTION IS USEFUL IF YOU EVER NEED TO BATCH-UPDATE ITEMS ON THE LIST

// const updateProjectType = () => {
//     changeToBridge.map(e => {
//         updateItem(parseInt(e), 'BRIDGE')
//     })
//     changeToNewForecast.map(e => {
//         updateItem(parseInt(e), 'NEW FORECAST')
//     })
// }

// const updateItem = (itemId, value) => {
//     $().SPServices({
//         operation: "UpdateListItems",
//         listName: "MergedFile_V1",
//         ID: itemId,
//         valuepairs: [['TYPE_x0020_OF_x0020_PROJECT', value]],
//         // valuepairs: [['TYPE OF PROJECT', value]],
//         completefunc: function(xData, Status) {
//             //Callback
//             console.log('item ', itemId, 'has been updates')
//         }
//     });
// }

$(document).ready(sitesChart.FieldRenderSetup()); // JavaScript source code
$(document).ready(function() {
    addChartCanvas()
    getAllListItems()
    filterListItems()
    updateChartData()
    $("#submitButton").click(function() {
        clearCanvas()
		let contractor = $("#contractor").val();
		let taskOrder = $("#taskOrder").val();
        addChartCanvas(contractor, taskOrder)
        updateChartData(contractor, taskOrder)
	});
});
