function ADDON_parent_copy(module, box, type, addon, i){
	if(!['ADD','EDIT'].includes(type)){ return }
	var thisInput = box.find('[name="' + addon[1] + '"]').attr('data-childinput', addon[2]);
}