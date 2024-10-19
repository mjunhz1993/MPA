function copy_row(d){
	GET_row({
        readonly:false,
        module:d.module,
        id:d.id,
        archive:d.year,
        done: function(data){
            console.log(data);
            loadJS('main/add-box', function(){ copy_data_to_box(d, data) })
        },
        error: function(error){ return createAlertPOPUP(error) }
    })
}

function copy_data_to_box(d, data){
    openAddBoxQuick(d.module, function(){
        MoveRowDataToFormFields(data, d.module, $('.popup').last());
    })
}