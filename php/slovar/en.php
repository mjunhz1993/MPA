<?php
function slovar($word = 'en'){
	$trans = [
		// LOG-IN PAGE
		"Welcome_to" => "Welcome to",
		"Welcome_to_desc" => "App version",
		"Log_in" => "Log in",
		"Username" => "Username",
		"Password" => "Password",

		// MODULS
		"Events" => "Events",
		"No_user_selected" => "No user selected",

		// DIARY
		"Added_row" => "User added a row",
		"Edited_row" => "User edited a row",
		"Deleted_row" => "User deleted a row",
		"Deleted_file" => "User deleted a file",

		// FORM
		"Successfully_edited" => "Successfully edited",
		"Successfully_deleted" => "Successfully deleted",
		"Access_denied" => "Access denied",
		"No_item" => "No item",
		"Delete_yourself_error" => "Can't delete yourself",
		"Password_old_error" => "The old password is incorrect",
		"Password_match_error" => "Passwords do not match",

		// FILE
		"File" => "File",
		"File_error" => "File error",
		"Wrong_file_type" => "Wrong file type",
		"Wrong_file_size" => "Wrong file size",

		// FILTERS
		"Delete_filter_error" => "Can't delete this filter",
		"Filter_name_error" => "Filter name is empty",
		"Filter_columns_error" => "No columns were selected",

		// AUTOMATION
		"Combination_of_values_wrong" => "Combination of values is wrong",
		"Minimum_value_exceeded" => "Minimum value exceeded",

		// SQL ERRORS
		"Error_1054" => "Unknown column in your SQL table",
		"Error_1062" => "Duplicate database entry for some fields",
		"Error_1064" => "You have an error in your SQL syntax",
		"Error_1264" => "One or more input values out of range",
		"Error_1366" => "One or more incorrectly entered value types",
		"Error_1406" => "One or more input values are too long",
		"Error_1451" => "Cannot delete or update a parent row (There's one or multiple rows connected to this one)",
		"Error_1452" => "Cannot add child row (There's one or multiple child rows with incorrect values)",

		// UNSUBSCRIBE
		"Unsub_title" => "You have successfully unsubscribed !",
		"Unsub_p_start" => "E-mail address",
		"Unsub_p_end" => "has been successfully unsubscribed"
	];

	if(isset($trans[$word])){ return $trans[$word]; }
	else{ return $word; }
}
?>