// Declare the global variables
var once = true;
var sitesChart = sitesChart || {};
sitesChart.Colors = [];
sitesChart.ID = [];
sitesChart.PINum =[];
sitesChart.TurnTime = [];
sitesChart.DateRcvd = [];
sitesChart.DateAsnd = [];

// Override the rendering
sitesChart.FieldRenderSetup = function () {
  
    var override = {};
    override.Templates = {};
    override.Templates.Header = sitesChart.CustomHeader;
    override.Templates.Item = sitesChart.CustomItem;
    override.Templates.Footer = sitesChart.CustomFooter;
  
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(override);
};
  
// Get the data from the list 
sitesChart.CustomItem = function (ctx) {
    // Entry ID
    sitesChart.ID.push(parseInt(ctx.CurrentItem["ID"]));
    // Project number column 
    sitesChart.PINum.push(parseInt(ctx.CurrentItem["P_x002e_I_x002e__x0020_NO_x002e_"]));
    // Turnaround time column 
    sitesChart.TurnTime.push(parseInt(ctx.CurrentItem["TOTAL_x0020_WORKING_x0020_DAYS_x"]));
    // Date Received column - get correct name, just read as string. Will conver later.
    sitesChart.DateRcvd.push(ctx.CurrentItem["DATE_x0020_REC_x0027_D_x002e_"]);
    // Date Assigned column - get correct name, just read as string. Will conver later.
    sitesChart.DateAsnd.push(ctx.CurrentItem["DATE_x0020_ASSIGNED"]);
    return '';
};
  
//Override the Header
sitesChart.CustomHeader = function (ctx) {
    // HTML for creating the alert box, the alerts civ will be replaced with:
    return '<link rel="stylesheet" type="text/css" href="https://hntbdesigntraffic.sharepoint.com/SiteAssets/bootstrap/css/bootstrap-iso.css"> \
             <div class="bootstrap-iso" unselectable="on"> \
                <div class="containter" unselectable="on"> \
                    <div class="panel panel-default"> \
                        <div class="panel-heading"> \
                            <h2 align="center" unselectable="on">Alerts</h2> \
                        </div> \
                        <div class="panel-body"> \
                            <div class="list-group"> \
                                <div id="alerts"></div>\
                            </div> \
                        </div> \
                    </div> \
                </div> \
            </div>';
};
  
// Override the footer
sitesChart.CustomFooter = function () {
    // Using if statement to only run once. This is needed because sharepoint is 
    // calling this function 3 times.
    if (once) {
        // all errors are stored in this array
        errorList = [];

        // check for projects with a turnaround time over the threshold
        for (var i = 0; i < sitesChart.PINum.length; i++) {
            if (isNaN(sitesChart.PINum[i]) || sitesChart.TurnTime[i] > 40000 || isNaN(sitesChart.TurnTime[i])) {
                debugger
                continue;
            } else if (sitesChart.TurnTime[i] > 250) {
                debugger
                // errorList.push('<a href="https://hntbdesigntraffic.sharepoint.com/Lists/MasterProjectsWithTO/DispForm.aspx?ID=' +
                errorList.push('<a href="https://hntbdesigntraffic.sharepoint.com/Lists/MergedFile_V1/AllItems.aspx?ID=' +
                    sitesChart.ID[i] + '" class="list-group-item list-group-item-success">Project Number: ' + sitesChart.PINum[i] +
                    "  Turnaround Time: " + sitesChart.TurnTime[i] + '</a>\n');
            }
        }

        // check the date received and if over 850 days (arbitrary for testing).
        // If over, and there is no date assigned, then it is added to errors.
        // will convert dates (mm/dd/yyyy) to UTC format (yyyy-mm-dd) then convert to JS
        // date object for comparison.
        for (var i = 0; i < sitesChart.DateRcvd.length; i++) {
            if (isNaN(sitesChart.PINum[i]) || sitesChart.DateRcvd[i] === '' || sitesChart.DateAsnd[i] !== '') {
                continue;
            } else {
                var splitDate = sitesChart.DateRcvd[i].split('/');
                var newDateRcvd = new Date(splitDate[2] + '-' + splitDate[0] + '-' + splitDate[1]);
                var today = new Date();
                var timeDiff = Math.abs(newDateRcvd.getTime() - today.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                if (diffDays > 850 && !isNaN(diffDays)) {
                    errorList.push('<a href="https://hntbdesigntraffic.sharepoint.com/Lists/MasterProjectsWithTO/DispForm.aspx?ID=' +
                    // errorList.push('<a href="https://hntbdesigntraffic.sharepoint.com/Lists/MasterFileDraft012021/DispForm.aspx?ID=' +
                    // sitesChart.ID[i] + '" class="list-group-item list-group-item-success">Project Number: ' + sitesChart.PINum[i] +
                    //     "  Days without assignment: " + diffDays + '</a>\n');
                }
            }
        }

        // append the error list to the alerts section
        (errorList.length > 0) ? $('#alerts').append(errorList) : $('#alerts').append('<div class="list-group-item list-group-item-success">No alerts to display</div>');
        once = false;
    }

    return '';
};
  
// JavaScript source code
$(document).ready(sitesChart.FieldRenderSetup());