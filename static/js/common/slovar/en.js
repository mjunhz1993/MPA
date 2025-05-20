var trans = {
    // ADMIN
    Desktop: "Desktop",
    Administration: "Administration",
    Currency: "Currency",
    Custom_module: "Custom module",
    Company: "Company",
    Internal_crm_files: "Internal MPA files",

    // WIDGETS
    Add_widget: "Add widget",

    // MODULS
    Dashboard: "Dashboard",
    Chat: "Chat",
    Users: "Users",
    Events: "Events",
    Diary: "Diary",
    Configurations: "Configurations",
    Module: "Module",
    Modules: "Modules",
    Module_access: "Module access",
    Edit_module: "Edit Module",
    Can_view: "Can View",
    Can_edit: "Can Edit",
    Can_delete: "Can Delete",
    Campaigns: "Campaigns",
    Campaign: "Campaign",
    Archive: "Archive",
    Analytics: "Analytics",
    Toggle_all: "Toggle all",
    Parent_module: "Parent Module",

    // CHAT
    Add_conversation: "Create conversation",
    Show_conversation: "Show conversation",
    No_messages: "No Messages Were Found",
    Chat_message: "Chat message",
    Pickup_call_title: "Call invitation",
    Pickup_call_desc: "You are invited to a call",
    Answer: "Pick up",

    // NOTIFICATIONS
    Notification: "Notification",
    Notification_confirm: "Notification confirm",
    Notification_mentioned: "You were mentioned in - ",

    // LANGUAGES
    Language: "Language",
    Slovenian: "Slovenian",
    English: "English",

    // COLORS
    Color: "Color",

    // CALENDAR
    Wrong_date: "Wrong date",
    Calendar: "Calendar",
    Show_today: "Show today",
    Start_date: "Start date",
    End_date: "End date",
    Time: "Time",
    All_months: "All months",

    // USERS
    Profile: "Profile",
    Sign_out: "Sign out",
    Account: "Account",
    Username: "Username",
    Email: "E-mail",
    Emails: "E-mails",
    Email_list: "E-mail list",
    Email_column: "E-mail column",
    Email_accounts: "E-mail accounts",
    Password: "Password",
    Email_password: "E-mail password",
    Assigned_to: "Assigned to",
    Share_with: "Share with",

    // ROLES
    Roles: "Roles",
    Role: "Role",
    General: "General",
    Privileges: "Privileges",
    Event_view_access: "Event view access",
    Module_filter_access: "Module filter access",

    // COMPANY
    Company: "Company",
    Street: "Street",
    Postal: "Postal",
    City: "City",
    Tax_number: "Tax number",
    Registration_number: "Registration number",
    Taxpayer: "Taxpayer",

    // TABLE
    Row: "Row",
    Column: "Column",
    Columns: "Columns",
    Refresh_data: "Refresh Data",
    Resize_columns: "Resize columns",
    Edit_columns: "Edit Columns",
    Edit_column: "Edit column",
    Set_columns: "Also set all columns",
    Sort_by: "Sort by: ",
    Edit_row: "Edit row",
    Copy_row: "Copy row",
    Delete_row: "Delete row",
    Show_more_options: "Show more options",
    No_items: "No items were found",
    Trash: "Trash",
    Recover_row: "Recover row",
    Recover_desc: "Do you want to recover this row ?",
    Filter_table: "Filter table",
    Get_filter: "Get filter",
    Is_empty: "Is empty",

    // FILE
    Wrong_file_type: "Wrong file type",
    Export: "Export",
    Export_type: "Export type",
    Export_selected: "Export selected",
    Export_all_filterd: "Exports everything according to the selected filter",
    Export_all: "Exports everything",
    Drag_and_drop: "Drag and drop",
    Unknown_file_title: "Download file ?",
    Unknown_file_desc: "Before downloading, please make sure the file comes from a trusted source.",

    // ALERTS
    Confirm_event: "Confirm event",
    Confirm_delete: "Are you sure you want to delete this item ?",
    Fill_in_this_field: "Fill in this field",

    // COMMON
    Select: "Select",
    Select_all: "Select all",
    Select_multiple: "Select multiple",
    Read: "Read",
    Download: "Download",
    Last_update: "Last update",
    Subject: "Subject",
    Description: "Description",
    Extra: "Extra",
    Tools: "Tools",
    Name: "Name",
    Name_column: "Column for name",
    Send: "Send",
    New: "New",
    Add_new: "Add new",
    Delete: "Delete",
    Accept: "Accept",
    Accepted: "Accepted",
    Declined: "Declined",
    Cancel: "Cancel",
    Close: "Close",
    Go_back: "Go back",
    Advanced: "Advanced",
    Search: "Search",
    Showing: "Showing",
    Entries: "Entries",
    Show_more: "Show more",
    View: "View",
    Edit: "Edit",
    Upload: "Upload",
    Save: "Save",
    Save_changes: "Save changes",
    Save_changes_close: "Save changes and close",
    Saved: "Saved",
    Access_denied: "Access Denied",
    Total: "Total",
    Count: "Count",
    Average: "Average",
    Public: "Public",
    Reset: "Reset",
    Yes: "Yes",
    No: "No",
    Got_it: "Got it",
    From: "From",
    To: "To",
    Empty: "Empty",
};

function slovar(word = 'en'){
    if(trans[word]){ return trans[word]; }
    return word;
}
function add_to_slovar(obj){for(const [key, value] of Object.entries(obj)){ trans[key] = value }}
$(document).ready(function(){$('[data-slovar]').each(function(){$(this).text(slovar($(this).data('slovar')));});});