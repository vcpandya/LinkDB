<?php

$a=explode('wp-content',$_SERVER['SCRIPT_FILENAME']);
 
  $path=$a[0];

include_once $path . '/wp-config.php';
include_once $path . '/wp-load.php';
include_once $path . '/wp-includes/wp-db.php';
include_once $path . '/wp-includes/pluggable.php';
global $wpdb;
$linkbase_table_prefix1=$wpdb->prefix.'linkbase_';
define('LINKBASE_TABLE_PREFIX1', $linkbase_table_prefix1);


if($_POST['table_heading']!=''){
    
    
global $wpdb;
$sql21 = "SELECT * FROM ".$wpdb->prefix."licensekey";
$res121 = $wpdb->get_row($sql21);
$json_array2 = json_encode($res121->licensekey);
$url10 = "http://wplinkbase.com/?edd_action=check_license&item_name=linkbase+plugin&license=".$res121->licensekey;
 $ch2 = curl_init(); 
curl_setopt ($ch2, CURLOPT_URL, $url10); 

   curl_setopt ($ch2, CURLOPT_SSL_VERIFYPEER, FALSE); 

   curl_setopt ($ch2, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.6) Gecko/20070725 Firefox/2.0.0.6"); 

   curl_setopt ($ch2, CURLOPT_TIMEOUT, 60); 

   curl_setopt ($ch2, CURLOPT_FOLLOWLOCATION, 0); 

   curl_setopt ($ch2, CURLOPT_RETURNTRANSFER, true); 

   curl_setopt ($ch2, CURLOPT_REFERER, $url10); 



   curl_setopt ($ch2, CURLOPT_POSTFIELDS, $json_array2); 

   curl_setopt ($ch2, CURLOPT_POST, 1); 

   $result2 = curl_exec($ch2); 



   curl_close($ch2);
   $result2;

   $pieces = explode(",", $result2);

   $pieces1 = explode("{\"license\":", $pieces[0]);

   $state= str_replace('"', '',$pieces1[1]);
   if($state=='valid'){
	$table_heading=$_POST['table_heading'];
	$color=$_POST['color_picker'];
	$created_date=date('m/d/Y h:i:s a', time());
	$current_id=get_current_user_id( );
	$current_user = wp_get_current_user();
	$created_by=$current_user->user_login;
	$table = LINKBASE_TABLE_PREFIX1."table";
	$sql1 = "SELECT *FROM ".LINKBASE_TABLE_PREFIX1."table";
	$results = $wpdb->get_results($sql1);
	$sql="INSERT INTO $table (table_heading, created_by,created_date,color) VALUES('$table_heading','$created_by','$created_date','$color')";
	$wpdb->query($sql);
	echo $mainbody='Thank You For Submitting.';
	exit;
   }else{
       
       echo $mainbody='Your license key is not valid.Please renew it.';
	exit;
   }
	
}

if($_POST['edit_heading']!=''){
$edit_heading=$_POST['edit_heading'];
$id=$_POST['id'];
$color=$_POST['color_picker'];
$table = LINKBASE_TABLE_PREFIX1."table";
$sql="update $table set table_heading='$edit_heading', color='$color' where	id=$id";
 $wpdb->query($sql);
echo $mainbody='Thank You For Editing.';

  exit;	
	
	
	
	
	
}

if($_POST['delete_row']!=''){
$delete_row=$_POST['delete_row'];
$id=$_POST['id'];
$table = LINKBASE_TABLE_PREFIX1."table";
$sql="delete from $table where id=$id";
 $wpdb->query($sql);
echo $mainbody='Record has been deleted.';

  exit;	
	
}

if($_POST['delete_link_id']!=''){
 $id=$_POST['delete_link_id'];
$table = LINKBASE_TABLE_PREFIX1."linkbase";
  $sql="delete from $table where id=$id";
 $wpdb->query($sql);
 echo $mainbody='Record has been deleted.';

  exit;	
	
}

if($_POST['user_id']!=''){
 $id=$_POST['user_id'];
$table = $wpdb->prefix."block_user";
 $sql="delete from $table where user_id=$id";
 $wpdb->query($sql);
 echo $mainbody='Record has been deleted.';

  exit;	
	
}

if($_POST['ip_id']!='') {
	$id=$_POST['ip_id'];
	$table = $wpdb->prefix."ip";
	$sql="delete from $table where id=$id";
	$wpdb->query($sql);
	echo 'Record has been deleted';

}



?>
