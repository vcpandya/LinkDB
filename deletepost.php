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
echo "hai";
if($_POST['id'] != '') {
	
	$id=$_POST['id'];
	$table = LINKBASE_TABLE_PREFIX1."linkbase";
	$sql="delete from $table where id=$id";
	 $wpdb->query($sql);
	echo $mainbody='Record has been deleted.';

	  exit;	
	
}
