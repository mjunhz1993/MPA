<?php
function slovar($word = 'sl'){
	$trans = [
		// LOG-IN PAGE
		"Welcome_to" => "Dobrodošli na",
		"Welcome_to_desc" => "Različica aplikacije",
		"Log_in" => "Prijavi se",
		"Username" => "Uporabniško ime",
		"Password" => "Geslo",

		// MODULS
		"Events" => "Dogodki",
		"No_user_selected" => "Izbran ni noben uporabnik",

		// DIARY
		"Added_row" => "Uporabnik je dodal vrstico",
		"Edited_row" => "Uporabnik je uredil vrstico",
		"Deleted_row" => "Uporabnik je izbrisal vrstico",
		"Deleted_file" => "Uporabnik je izbrisal dokument",

		// FORM
		"Successfully_edited" => "Uspešno urejeno",
		"Successfully_deleted" => "Uspešno izbrisano",
		"Access_denied" => "Dostop zavrnjen",
		"No_item" => "Ni podatka",
		"Delete_yourself_error" => "Ne morete izbrisati samega sebe",
		"Password_old_error" => "Staro geslo ni pravilno",
		"Password_match_error" => "Gesli se ne ujemata",

		// FILE
		"File" => "Dokument",
		"File_error" => "Napaka pri datoteki",
		"Wrong_file_type" => "Napačna vrsta datoteke",
		"Wrong_file_size" => "Napačna velikost datoteke",

		// FILTERS
		"Delete_filter_error" => "Tega filtra ni mogoče izbrisati",
		"Filter_name_error" => "Ime filtra je prazno",
		"Filter_columns_error" => "Noben stolpec ni bil izbran",

		// AUTOMATION
		"Combination_of_values_wrong" => "Kombinacija vrednot je napačna",
		"Minimum_value_exceeded" => "Najmanjša vrednost je presežena",

		// SQL ERRORS
		"Error_1054" => "Neznan stolpec v tabeli SQL",
		"Error_1062" => "Podvojen vnos v bazi za nekatera polja",
		"Error_1064" => "Napaka v sintaksi SQL",
		"Error_1264" => "Ena ali več vhodnih vrednosti je izven obsega",
		"Error_1366" => "Ena ali več napačno vnesene vrste vrednosti",
		"Error_1406" => "Nekatere vrednosti so predolge",
		"Error_1451" => "Nadrejene vrstice ni mogoče izbrisati ali posodobiti (S tem je povezana ena ali več vrstic)",
		"Error_1452" => "Podrejene vrstice ni mogoče dodati (Obstaja ena ali več podrejenih vrstic z napačnimi vrednostmi)",

		// UNSUBSCRIBE
		"Unsub_title" => "Uspešno ste se odjavili !",
		"Unsub_p_start" => "E-mail naslov",
		"Unsub_p_end" => "je uspešno odjavljen"
	];

	if(isset($trans[$word])){ return $trans[$word]; }
	else{ return $word; }
}
?>