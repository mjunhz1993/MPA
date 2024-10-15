<?php
session_start();
error_reporting(E_ALL ^ E_NOTICE);
$data = array();
if($_SESSION['user_language'] == 'sl'){
	$data = array(
		'si' => array('name'=>'Slovenija', 'phone'=>'+386', 'flag'=>'-3232px'),
		'hr' => array('name'=>'Hrvaška', 'phone'=>'+385', 'flag'=>'-1744px'),
		'de' => array('name'=>'Nemčija', 'phone'=>'+49', 'flag'=>'-1152px'),
		'en' => array('name'=>'Amerika', 'phone'=>'+1', 'flag'=>'-3664px')
	);
}
else{
	$data = array(
		'si' => array('name'=>'Slovenia', 'phone'=>'+386', 'flag'=>'-3232px'),
		'hr' => array('name'=>'Croatia', 'phone'=>'+385', 'flag'=>'-1744px'),
		'de' => array('name'=>'Germany', 'phone'=>'+49', 'flag'=>'-1152px'),
		'en' => array('name'=>'United States', 'phone'=>'+1', 'flag'=>'-3664px')
	);
}
echo json_encode($data);
?>