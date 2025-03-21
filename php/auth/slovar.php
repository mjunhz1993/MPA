<?php
function slovarLocal($word){
	if($GLOBALS["config"]["defaultLanguage"] == 'sl'){ $trans = slovarLocal_sl($word); }
	else{ $trans = slovarLocal_en($word); }

	if($trans != ''){ return $trans; }
	else{ return $word; }
}

function slovarLocal_sl($word){
	$trans = [
		"Welcome_to" => "Dobrodošli na",
		"Welcome_to_desc" => "<a target='_blank' href='https://oktagon-it.si//index.php/mpa'>
			Odkrij več
		</a>",

		"unknown_username" => "Uporabniško ime ne obstaja ali je blokirano",
		"wrong_credentials" => "Nepravilno uporabniško ime ali geslo",
		"illegal_device" => "Neprimerna naprava",

		"email_confirm_subject" => "MPA - Obvestilo",

		"email_confirm_body_0" => "Prekopirajte spodaj navedeno kodo v primerno polje aplikacije.",
		"email_confirm_body_1" => "Nekdo se je poskusil prijaviti iz neznane naprave.<hr>",
		"ip" => "IP",
		"hostname" => "Gostiteljsko ime",
		"city" => "Mesto",
		"country" => "Država",
		"email_confirm_body_2" => "<hr>Če ste to vi, prekopirajte spodaj navedeno kodo v primerno polje aplikacije.",
		"email_confirm_body_3" => "<br>V primeru, da ne prepoznate naprave, obvestite vašega administratorja, da vam nujno spremeni geslo.",
		"Protected_by" => "Zaščiten z"
	];

	return $trans[$word];
}

function slovarLocal_en($word){
	$trans = [
		"Welcome_to" => "Welcome to",
		"Welcome_to_desc" => "<a target='_blank' href='https://oktagon-it.si//index.php/mpa'>
			Discover more
		</a>",

		"unknown_username" => "Username does not exist or is blocked",
		"wrong_credentials" => "Incorrect username or password",
		"illegal_device" => "Illegal device",

		"email_confirm_subject" => "MPA - Notification",

		"email_confirm_body_0" => "Copy the code below into the appropriate field in the application.",
		"email_confirm_body_1" => "Someone tried to log in from an unknown device.<hr>",
		"ip" => "IP",
		"hostname" => "Hostname",
		"city" => "City",
		"country" => "Country",
		"email_confirm_body_2" => "<hr>If this is you, copy the code below into the appropriate field in the application.",
		"email_confirm_body_3" => "<br>If you do not recognize the device, inform your administrator to change your password urgently.",
		"Protected_by" => "Protected by"
	];

	return $trans[$word];
}
?>