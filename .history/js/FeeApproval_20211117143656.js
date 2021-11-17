// alert($().SPServices.SPGetCurrentSite());

// put in script editor at top of page:
// <link rel="stylesheet" type="text/css" href="https://hntbdesigntraffic.sharepoint.com/SiteAssets/bootstrap/css/bootstrap-iso.css"> //DONE

// Place the following line of code in Edit Web Part --> Miscellaneous --> JS Link to link the code/custom css/external libraries to the page:
// ~site/SiteAssets/js/jquery.js|~site/SiteAssets/js/Chart.bundle.js|~site/SiteAssets/js/FeeApproval.js|~site/SiteAssets/js/Chart.PieceLabel.js //DONE

// Declare the variables
var sitesChart = sitesChart || {};
var masterFileUrl = "https://hntbdesigntraffic.sharepoint.com/Lists/MasterFileDraft012021/AllItems.aspx"
 
sitesChart.Colors = ["#214154", "#265961", "#227066", "#76A665", "#F7E32E", "#EBD72C", "#AB9D20","#6B6214"];
sitesChart.Allocation = [];
sitesChart.District = [];
sitesChart.Type = [];
sitesChart.Complexity = [];
sitesChart.TaskId = [];
sitesChart.ProjDesc = [];
sitesChart.TotCost = [];
sitesChart.ProjCost = [];
sitesChart.TrafCost = [];
sitesChart.NumInter = [];
sitesChart.PINum = [];
sitesChart.OtherCost = [];

// Override the rendering
sitesChart.FieldRenderSetup = function () { 
    var override = {};
    override.Templates = {};
    override.Templates.Header = sitesChart.CustomHeader;
    override.Templates.Item = sitesChart.CustomItem;
    override.Templates.Footer = sitesChart.CustomFooter;

    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(override);
};
  
//Get the data from the list 
sitesChart.CustomItem = function (ctx) {
    sitesChart.Allocation.push(ctx.CurrentItem["TOTAL_x0020_COST_x0020__x0028__x."]);
    sitesChart.District.push(ctx.CurrentItem["Title"]);
    sitesChart.Type.push(ctx.CurrentItem["TYPE_x0020_OF_x0020_PROJECT"]);
    sitesChart.Complexity.push(ctx.CurrentItem["COMPLEXITY"]);
    sitesChart.TaskId.push(ctx.CurrentItem["Task_x0020_ID_x003a_"]);
    sitesChart.ProjDesc.push(ctx.CurrentItem["PROJECT_x0020_DESCRIPTION"]);
    sitesChart.TotCost.push(ctx.CurrentItem["TOTAL_x0020_COST_x0020__x0028__x."]);
    sitesChart.ProjCost.push(ctx.CurrentItem["PROJECT_x0020_COST_x0020__x0028_."]);
    sitesChart.TrafCost.push(ctx.CurrentItem["TRAFFIC_x0020_COUNT_x0020_COST_x."]);
    sitesChart.NumInter.push(ctx.CurrentItem["_x0023__x0020_OF_x0020_INTERSECT"]);
    sitesChart.PINum.push(ctx.CurrentItem["P_x002e_I_x002e__x0020_NO_x002e_"]);
    sitesChart.OtherCost.push(ctx.CurrentItem["OTHER_x0020_DIRECT_x0020_COST_x0."]);
    
    return '';
};
  
// Override the Header
sitesChart.CustomHeader = function (ctx) {
    // HTML for creating the charts
    return '<div class="bootstrap-iso"> \
				<div class="container"> \
					<div class="panel panel panel-default"> \
						<div class="panel-heading"> \
							<h1 align="center">Fee Approval Form</h1> \
						</div> \
						<div class="panel-body"> \
							<div class="form-horizontal"> \
								<div class="form-group"> \
									<label class="col-sm-2 control-label" style="font-size:16px">Task ID:</label> \
									<div class="col-sm-2"> \
										<input type="text" class="form-control" id="taskIdInput" placeholder="Task"> \
									</div> \
									<div class="col-sm-2"> \
										<button type="button" class="btn btn-default" style="font-size:16px">Submit</button> \
									</div> \
								</div> \
								<div class="form-group"> \
									<label class="col-sm-2 control-label" style="font-size:16px">Project ID:</label> \
									<div class="col-sm-2"> \
										<p class="form-control-static" id="projIDRes" style="font-size:16px"></p> \
									</div> \
								</div> \
								<div class="form-group"> \
									<label class="col-sm-2 control-label" style="font-size:16px">Project Description:</label> \
									<div class="col-sm-10"> \
										<p class="form-control-static" id="projDescRes" style="font-size:16px"></p> \
									</div> \
								</div> \
								<div class="form-group"> \
									<label class="col-sm-2 control-label" style="font-size:16px">Project Type:</label> \
									<div class="col-sm-10"> \
										<p class="form-control-static" id="projTypeRes" style="font-size:16px"></p> \
									</div> \
								</div> \
								<div class="form-group"> \
									<label class="col-sm-2 control-label" style="font-size:16px">Project Cost:</label> \
									<div class="col-sm-10"> \
										<p class="form-control-static" id="projCostRes" style="font-size:16px"></p> \
									</div> \
								</div> \
								<div class="form-group form-group-sm"> \
									<label class="col-sm-2 control-label" style="font-size:16px">Traffic Count Cost:</label> \
									<div class="col-sm-10"> \
										<p class="form-control-static" id="TrfCountCostRes" style="font-size:16px"></p> \
									</div> \
								</div> \
								<div class="form-group form-group-sm"> \
									<label class="col-sm-2 control-label" style="font-size:16px">Other Direct Cost:</label> \
									<div class="col-sm-10"> \
										<p class="form-control-static" id="OthDirCostRes" style="font-size:16px"></p> \
									</div> \
								</div> \
								<div class="form-group"> \
									<label class="col-sm-2 control-label" style="font-size:16px">Project Contact:</label> \
									<div class="col-sm-10"> \
										<p class="form-control-static" id="projCont" style="font-size:16px"></p> \
									</div> \
								</div> \
								<div class="form-group"> \
									<label class="col-sm-2 control-label" style="font-size:16px">Project Intersections:</label> \
									<div class="col-sm-10"> \
										<p class="form-control-static" id="projInterRes" style="font-size:16px"></p> \
									</div> \
								</div> \
							</div> \
						</div> \
					</div> \
				</div> \
			</div>';
};

// Override the footer
sitesChart.CustomFooter = function () {
    return '';
};

const columnNames = {
    "Task ID": "ows_Title",
    "Project ID": "",
    "Project Description": "ows_PROJECT_x0020_DESCRIPTION",
    "Project Type": "ows_GDOT_x0020_PROJECT_x0020_TYPE",
    "Project Cost": "ows_PROJECT_x0020_COST_x0020__x0028",
    "Labor Cost": "", // no close match
    "Traffic Count Cost": "ows_TRAFFIC_x0020_COUNT_x0020_COST_x",
    "Other Direct Cost": "ows_OTHER_x0020_DIRECT_x0020_COST_x0",
    "Project Contact": "ows_HNTB_x0020_TRAFFIC_x0020_CONTACT", // closest match
    "Project Intersections": "ows__x0023__x0020_OF_x0020_INTERSECT" // closest match
}

let project = {}
let entireList = {}
let found = false

function getAllListItems(taskId) {
	debugger
	$().SPServices({
		operation: "GetListItems",
		async: false,
		listName: "MergedFile_V1",
		// listName: "MasterFileDraft_V5",
		completefunc: function(listData, Status) {
			debugger
			$(listData.responseXML).SPFilterNode("z:row").each(function() {
				if($(this).attr("ows_LinkTitle") == taskId) {
					debugger
					setProjectFoundValues(this)
				}
			});
		}
	})
}

function findProjectByTaskId(taskId) {
	let id = taskId.length === 9 ? taskId.slice(1) : taskId
	var queryLookup = `<Query><Where><Eq><FieldRef Name='Title' /><Value Type='Text'>${id}</Value></Eq></Where></Query>`;

	$().SPServices({
		operation: "GetListItems",
		async: false,
		// listName: "MasterFileDraft_V5",
		listName: "MergedFile_V1",
		CAMLQuery: queryLookup,
		completefunc: function (listData, Status) {
            if (Status !== 'success') {
                console.log('There was an error while retrieving the list: ', listData.errorText)
            } else {
				debugger
				found = true
                $(listData.responseXML).SPFilterNode("z:row").each(function() {
					setProjectFoundValues(this)
				});
            }	
		}
	});
}

function setProjectFoundValues(proj) {
	debugger
	project.taskId = $(proj).attr("ows_Title")
	project.projectId = $(proj).attr("ows_Title")
	project.projectDesc = $(proj).attr("ows_PROJECT_x0020_DESCRIPTION")
	project.projectType = $(proj).attr("ows_GDOT_x0020_PROJECT_x0020_TYPE")
	project.projectCost = $(proj).attr("ows_PROJECT_x0020_COST_x0020__x0028_")
	project.laborCost = $(proj).attr("") // no match
	project.trafficCountCost = $(proj).attr("ows_TRAFFIC_x0020_COUNT_x0020_COST_x")
	project.otherDirCost = $(proj).attr("ows_OTHER_x0020_DIRECT_x0020_COST_x0")
	project.HNTBtrafficContact = $(proj).attr("ows_HNTB_x0020_TRAFFIC_x0020_CONTACT")
	project.projectInters = $(proj).attr("ows__x0023__x0020_OF_x0020_INTERSECT")
}

function updateResults(proj) {
	debugger
	let laborProjText = proj.laborCost === undefined ? "Column not found" : "$" + parseFloat(proj.laborCost).toFixed(2)
	$("#projIDRes").text(proj.taskId);
	$("#projDescRes").text(proj.projectDesc);
	$("#projTypeRes").text(proj.projectType);
	$("#projCostRes").text("$" + parseFloat(proj.projectCost).toFixed(2));
	$("#LaborCostRes").text(laborProjText) 
	$("#TrfCountCostRes").text("$" + parseFloat(proj.trafficCountCost).toFixed(2));
	$("#OthDirCostRes").text("$" + parseFloat(proj.otherDirCost).toFixed(2) + " " + "(" + "-" + ")");
	$("#projInterRes").text(proj.projectInters);
	$("#projCont").text(proj.HNTBtrafficContact);
	$("#trafCont").text(proj.projectDesc);
}

$(document).ready(sitesChart.FieldRenderSetup());
$(document).ready(function() {
	
	$("button").click(function() {
		debugger
		$("p").text("");
		project = {}
		let input = $("#taskIdInput").val();
		getAllListItems(input)
		findProjectByTaskId(input)

		if (found) {
			if (project.taskId !== undefined) {
				$("#taskIdInput").val("")
				updateResults(project)
			} else {
				$("#taskIdInput").val("")
				$("p").text("Project not found");
			}
		} 
	});
});


