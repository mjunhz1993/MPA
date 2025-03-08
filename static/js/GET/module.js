function GET_globals(d){
	$.getJSON('/crm/php/main/GET_globals.php', function(data){
		if(d.done){ d.done(data) }
	})
}

function GET_module(d){ console.log({loading_module:d.module});
	$.getJSON('/crm/php/main/GET_module.php?get_modules=1', {module:d.module}, function(data){
		if(d.error && data.error){ return d.error(data.error) }
		if(d.each){for(var i=0; i<data.length; i++){ d.each(data[i]) }}
		if(d.done){ d.done(data) }
	})
}

function GET_column(d){ console.log({loading_column:d.module});
	$.getJSON('/crm/php/main/GET_column.php?get_columns=1', {
		module:d.module,
		column:d.column,
		archive:d.archive,
		replaceFakeColumns:d.replaceFakeColumns,
		showAll:d.showAll
	}, function(data){
		if(d.error && data.error){ return d.error(data.error) }
		if(d.each){for(var i=0; i<data.length; i++){ d.each(data[i]) }}
		if(d.done){ d.done(data) }
	})
}

function GET_row(d){ console.log({loading_row:d.module});
	$.getJSON('/crm/php/main/GET_row.php?get_row=1', {
		readonly:d.readonly,
		module:d.module,
		id:d.id,
		archive:d.archive,
		offset:d.offset,
		sort_column:d.sort_column,
		sort_direction:d.sort_direction,
		filter:d.filter,
		filter_value:d.filter_value,
		dropdownMenu:d.dropdownMenu,
		searchMode:d.searchMode,
		dropdownMenu_search_value:d.dropdownMenu_search_value,
		dropdownMenu_filter:d.dropdownMenu_filter,
		dropdownMenu_filter_value:d.dropdownMenu_filter_value,
		limit:d.limit
	}, function(data){
		if(d.error && data.error){ return d.error(data.error) }
		if(d.each){for(const [key,col] of Object.entries(data)){ d.each(key,col) }}
		if(d.done){ d.done(data) }
	})
}