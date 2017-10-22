
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
 
 if($_REQUEST['task']=='approve')
 {
$approved=$_REQUEST['approved'];
$id=$_REQUEST['id'];
$table =LINKBASE_TABLE_PREFIX1."linkbase";
$sql="update $table set approved=1,denied=0 where id=$id";
}
if($_REQUEST['task']=='deny')
 {
$deny=$_REQUEST['deny'];
$id=$_REQUEST['id'];
$table =LINKBASE_TABLE_PREFIX1."linkbase";
$sql="update $table set approved=0,denied=1 where id=$id";
}


$wpdb->query($sql);
echo "Thank You";

	?>
